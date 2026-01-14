import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Staff, UserRole, WorkSchedule } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus, 
  Calendar,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Award,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, DEFAULT_GYM_ID } from '@/lib/supabase';
import { toast } from 'sonner';

type SupabaseStaffRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  employee_id?: string | null;
  position: string;
  department: string;
  hire_date?: string | null;
  salary?: string | number | null;
  certifications?: string[] | null;
  specializations?: string[] | null;
};
const StaffManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to convert Supabase staff to Staff interface
  const mapSupabaseStaffToStaff = (dbStaff: SupabaseStaffRow): Staff => {
    return {
      id: dbStaff.id,
      email: dbStaff.email,
      firstName: dbStaff.first_name,
      lastName: dbStaff.last_name,
      phone: dbStaff.phone || '',
      role: dbStaff.role as UserRole,
      createdAt: new Date(dbStaff.created_at),
      updatedAt: new Date(dbStaff.updated_at),
      employeeId: dbStaff.employee_id || '',
      position: dbStaff.position,
      department: dbStaff.department,
      hireDate: dbStaff.hire_date ? new Date(dbStaff.hire_date) : new Date(),
      salary: dbStaff.salary ? parseFloat(String(dbStaff.salary)) : 0,
      schedule: [], // Schedule not stored in staff table
      certifications: dbStaff.certifications || [],
      specializations: dbStaff.specializations || []
    };
  };

  // Fetch staff from Supabase
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching staff:', error);
          toast.error('Failed to load staff');
          return;
        }

        if (data) {
          const mappedStaff = data.map(mapSupabaseStaffToStaff);
          setStaff(mappedStaff);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Fitness':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Operations':
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
      case 'Management':
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.TRAINER:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case UserRole.STAFF:
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
      case UserRole.MANAGER:
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleDeleteStaff = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff member');
        return;
      }

      setStaff(prev => prev.filter(s => s.id !== staffId));
      toast.success('Staff member deleted successfully');
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const StaffDetailsDialog = ({ staff: staffMember }: { staff: Staff }) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={staffMember.avatar} />
          <AvatarFallback>{staffMember.firstName[0]}{staffMember.lastName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{staffMember.firstName} {staffMember.lastName}</h3>
          <p className="text-sm text-muted-foreground">Employee ID: {staffMember.employeeId}</p>
          <div className="flex space-x-2 mt-2">
            <Badge className={getRoleColor(staffMember.role)}>
              {staffMember.role}
            </Badge>
            <Badge className={getDepartmentColor(staffMember.department)}>
              {staffMember.department}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{staffMember.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{staffMember.phone}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Employment Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Position:</strong> {staffMember.position}</p>
              <p><strong>Department:</strong> {staffMember.department}</p>
              <p><strong>Hire Date:</strong> {staffMember.hireDate.toLocaleDateString()}</p>
              <p><strong>Salary:</strong> ${staffMember.salary.toLocaleString()}/year</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Schedule</h4>
            <div className="space-y-1 text-sm">
              {staffMember.schedule.filter(s => s.isActive).map((schedule, index) => (
                <p key={index}>
                  <strong>{getDayName(schedule.dayOfWeek)}:</strong> {schedule.startTime} - {schedule.endTime}
                </p>
              ))}
            </div>
          </div>

          {staffMember.certifications && staffMember.certifications.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-1">
                {staffMember.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {staffMember.specializations && staffMember.specializations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-1">
                {staffMember.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet-600" />
            Staff Management
          </h2>
          <p className="text-muted-foreground">Manage gym staff and roles</p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="brand"
              className="rounded-full h-11 px-6 shadow-lg"
              onClick={() => navigate('/staff/new')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, icon: Users, gradient: 'from-violet-500 to-blue-500', delay: 0.1 },
          { label: 'Trainers', value: staff.filter(s => s.role === UserRole.TRAINER).length, icon: UserPlus, gradient: 'from-blue-500 to-cyan-500', delay: 0.2 },
          { label: 'Support Staff', value: staff.filter(s => s.role === UserRole.STAFF).length, icon: Award, gradient: 'from-indigo-500 to-blue-500', delay: 0.3 },
          { label: 'Avg. Salary', value: `$${Math.round(staff.reduce((sum, s) => sum + s.salary, 0) / staff.length).toLocaleString()}`, icon: DollarSign, gradient: 'from-cyan-500 to-blue-500', delay: 0.4 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 p-6 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={staffMember.avatar} />
                        <AvatarFallback>{staffMember.firstName[0]}{staffMember.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{staffMember.firstName} {staffMember.lastName}</div>
                        <div className="text-sm text-muted-foreground">{staffMember.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{staffMember.position}</TableCell>
                  <TableCell>
                    <Badge className={`${getDepartmentColor(staffMember.department)} border rounded-full px-3 py-1`}>
                      {staffMember.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getRoleColor(staffMember.role)} border rounded-full px-3 py-1`}>
                      {staffMember.role}
                    </Badge>
                  </TableCell>
                  <TableCell>${staffMember.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(staffMember);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hasRole(UserRole.MANAGER) && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/staff/${staffMember.id}/edit`)}
                            className="rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteStaff(staffMember.id)}
                            
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && <StaffDetailsDialog staff={selectedStaff} />}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StaffManagement;
