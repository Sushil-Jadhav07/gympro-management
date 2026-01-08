import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, 
  Users, 
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth-utils';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Check if user is admin
  if (!hasRole(UserRole.ADMIN)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Failed to load users');
          return;
        }

        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      case 'manager':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'trainer':
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
      case 'member':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone_number && u.phone_number.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const CreateUserForm = () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: 'member' as 'admin' | 'manager' | 'trainer' | 'member'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      try {
        const passwordHash = await hashPassword(formData.password);
        
        const { data, error } = await supabase
          .from('users')
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phoneNumber || null,
            password_hash: passwordHash,
            role: formData.role,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
          toast.error(error.message || 'Failed to create user');
          return;
        }

        setUsers(prev => [data, ...prev]);
        setIsCreateDialogOpen(false);
        toast.success('User created successfully');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          role: 'member'
        });
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+1-555-0100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create User</Button>
        </div>
      </form>
    );
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    trainers: users.filter(u => u.role === 'trainer').length,
    members: users.filter(u => u.role === 'member').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <motion.div
        animate={{
          marginLeft: isSidebarCollapsed ? '5rem' : '16rem'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="transition-all duration-300"
      >
        <Topbar />
        <main className="p-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-7 w-7 text-violet-600" />
                  User Management
                </h2>
                <p className="text-muted-foreground">Manage system users and their roles</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/30">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system with their role and credentials
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, gradient: 'from-violet-500 to-blue-500' },
                { label: 'Active', value: stats.activeUsers, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'Admins', value: stats.admins, gradient: 'from-violet-500 to-indigo-500' },
                { label: 'Managers', value: stats.managers, gradient: 'from-blue-500 to-indigo-500' },
                { label: 'Trainers', value: stats.trainers, gradient: 'from-cyan-500 to-blue-500' },
                { label: 'Members', value: stats.members, gradient: 'from-gray-500 to-gray-600' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 p-6 transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-white/80 to-white/40 border-b border-border/40">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-600" />
                  Users Directory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-full border-2 h-11 bg-white/50"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48 rounded-full border-2 h-11 bg-white/50">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50/50 to-white/50">
                      <TableRow className="border-border/40">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                              <span className="ml-3 text-muted-foreground">Loading users...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-border/40 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-blue-50/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="ring-2 ring-violet-500/20">
                                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                                    {user.first_name[0]}{user.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {user.email}
                                </div>
                                {user.phone_number && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    {user.phone_number}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getRoleColor(user.role)} border rounded-full px-3 py-1 capitalize`}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.is_active ? 'default' : 'secondary'}
                                className={`rounded-full ${user.is_active ? 'bg-blue-500/10 text-blue-700 border-blue-200' : 'bg-gray-500/10 text-gray-700 border-gray-200'}`}
                              >
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </motion.div>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default UserManagement;

