import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowLeft, 
  UserPlus, 
  Briefcase, 
  DollarSign, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { supabase, DEFAULT_GYM_ID } from '@/lib/supabase';

const StaffCreate: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    role: UserRole.STAFF
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const employeeId = `EMP${String(Date.now()).slice(-3)}`;
      
      const { error } = await supabase
        .from('staff')
        .insert({
          gym_id: DEFAULT_GYM_ID,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          employee_id: employeeId,
          position: formData.position,
          department: formData.department,
          role: formData.role,
          salary: parseFloat(formData.salary).toString(),
          hire_date: new Date().toISOString().split('T')[0],
          certifications: [],
          specializations: []
        });

      if (error) {
        console.error('Error creating staff:', error);
        toast.error(error.message || 'Failed to create staff member');
        return;
      }

      toast.success('Staff member added successfully');
      navigate('/dashboard?tab=staff');
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error('Failed to create staff member');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]'}`}>
        <Topbar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <Button 
                  variant="ghost" 
                  className="mb-4 pl-0 hover:bg-transparent hover:text-violet-600 transition-colors"
                  onClick={() => navigate('/dashboard?tab=staff')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Staff
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  Add Staff Member
                </h1>
                <p className="text-muted-foreground mt-1 ml-14">
                  Onboard a new employee, trainer, or manager.
                </p>
              </div>
            </motion.div>

            <motion.form 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Personal Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Personal Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="h-11 bg-gray-50/50 border-gray-200"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="h-11 bg-gray-50/50 border-gray-200"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              id="email" 
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="pl-10 h-11 bg-gray-50/50 border-gray-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              id="phone" 
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="pl-10 h-11 bg-gray-50/50 border-gray-200"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Employment Details */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Employment Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="position">Position Title</Label>
                          <Input 
                            id="position" 
                            placeholder="e.g. Senior Trainer"
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            className="h-11 bg-gray-50/50 border-gray-200"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select 
                            value={formData.department} 
                            onValueChange={(value) => setFormData({...formData, department: value})}
                          >
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fitness">Fitness</SelectItem>
                              <SelectItem value="Operations">Operations</SelectItem>
                              <SelectItem value="Management">Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">System Role</Label>
                          <Select 
                            value={formData.role} 
                            onValueChange={(value) => setFormData({...formData, role: value as UserRole})}
                          >
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UserRole.TRAINER}>Trainer</SelectItem>
                              <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                              <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Column - Compensation & Summary */}
              <div className="space-y-8">
                
                {/* Compensation Card */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-lg bg-white overflow-hidden h-full">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white pb-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <CardTitle className="text-lg text-white">Compensation</CardTitle>
                      </div>
                      <CardDescription className="text-blue-100">Set salary and benefits</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="salary">Annual Salary ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input 
                            id="salary" 
                            type="number"
                            value={formData.salary}
                            onChange={(e) => setFormData({...formData, salary: e.target.value})}
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 text-lg font-semibold"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Gym Access
                        </h4>
                        <p className="text-sm text-blue-700">
                          Staff members receive full gym access and employee benefits automatically.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Summary / Actions */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 bg-gray-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500">Department</span>
                        <span className="text-lg font-bold text-gray-900">{formData.department || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-medium text-gray-500">Role</span>
                        <span className="text-lg font-bold text-gray-900">{formData.role}</span>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                      >
                        Create Staff Member
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffCreate;
