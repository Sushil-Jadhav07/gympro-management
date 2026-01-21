import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Staff, UserRole, WorkSchedule } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from '../ui/dialog';
import PageLoader from '../ui/PageLoader';

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

  if (isLoading) {
    return <PageLoader />;
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Fitness':
        return 'bg-[#00bc7d]/10 text-[#00bc7d] border-[#00bc7d]/20';
      case 'Operations':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Management':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.TRAINER:
        return 'bg-[#00bc7d]/10 text-[#00bc7d] border-[#00bc7d]/20';
      case UserRole.STAFF:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case UserRole.MANAGER:
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const calculateTenure = (hireDate: Date) => {
    const today = new Date();
    const years = today.getFullYear() - hireDate.getFullYear();
    const monthDiff = today.getMonth() - hireDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
      return years - 1;
    }
    return years;
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



  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-[#00bc7d]" />
            Staff Management
          </h2>
          <p className="text-muted-foreground">Manage gym staff and roles</p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="rounded-xl h-11 px-6 shadow-lg shadow-[#00bc7d]/20 bg-[#00bc7d] hover:bg-[#00bc7d]/90 text-white"
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
          { label: 'Total Staff', value: staff.length, icon: Users, color: 'text-[#00bc7d]', bg: 'bg-[#00bc7d]/10', border: 'border-[#00bc7d]/20', delay: 0.1 },
          { label: 'Trainers', value: staff.filter(s => s.role === UserRole.TRAINER).length, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-200', delay: 0.2 },
          { label: 'Support Staff', value: staff.filter(s => s.role === UserRole.STAFF).length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-200', delay: 0.3 },
          { label: 'Avg. Salary', value: `$${Math.round(staff.reduce((sum, s) => sum + s.salary, 0) / (staff.length || 1)).toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-200', delay: 0.4 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-100/50 border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00bc7d]/5"
          >
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.border} border`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00bc7d]/10 rounded-xl border border-[#00bc7d]/10">
              <Users className="h-6 w-6 text-[#00bc7d]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Staff Directory</h3>
              <p className="text-sm text-gray-500">Manage your team members</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00bc7d] transition-colors" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 h-11 bg-white focus:ring-2 focus:ring-[#00bc7d]/20 focus:border-[#00bc7d] transition-all shadow-sm w-64"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200 h-11 bg-white focus:ring-2 focus:ring-[#00bc7d]/20 focus:border-[#00bc7d] shadow-sm">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="w-[300px] font-semibold text-gray-500 py-5 pl-8 text-xs uppercase tracking-wider">Staff Member</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Role & Department</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Join Date</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-right pr-8 text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full border border-gray-100">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No staff members found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staffMember, index) => (
                  <motion.tr
                    key={staffMember.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-gray-50 hover:bg-[#00bc7d]/[0.02] transition-colors group"
                  >
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-md group-hover:ring-[#00bc7d]/20 transition-all">
                            <AvatarImage src={staffMember.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#00bc7d] to-[#009664] text-white font-bold text-lg">
                              {staffMember.firstName[0]}{staffMember.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#00bc7d]"></span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base group-hover:text-[#00bc7d] transition-colors">
                            {staffMember.firstName} {staffMember.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {staffMember.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className={`${getRoleColor(staffMember.role)} border-0 font-medium w-fit px-2.5 py-0.5 rounded-lg shadow-sm`}>
                          {staffMember.role}
                        </Badge>
                        <span className="text-xs text-gray-500 font-medium ml-1">
                          {staffMember.department}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="text-gray-900 font-medium flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {staffMember.hireDate.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {calculateTenure(staffMember.hireDate)} years tenure
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-[#00bc7d]/10 text-[#00bc7d] border-[#00bc7d]/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00bc7d] animate-pulse"></span>
                        Active
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-8">
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/staff/${staffMember.id}`)}
                          className="h-9 w-9 rounded-xl text-gray-500 hover:bg-[#00bc7d]/10 hover:text-[#00bc7d] hover:scale-105 transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {hasRole(UserRole.MANAGER) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/staff/${staffMember.id}/edit`)}
                              className="h-9 w-9 rounded-xl text-gray-500 hover:bg-[#00bc7d]/10 hover:text-[#00bc7d] hover:scale-105 transition-all"
                              title="Edit Staff"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStaff(staffMember.id)}
                              className="h-9 w-9 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all"
                              title="Delete Staff"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Staff Details Dialog */}
      {/* <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && <StaffDetailsDailog staff={selectedStaff} />}
        </DialogContent>
      </Dialog> */}

    </div>
  );
};

export default StaffManagement;
