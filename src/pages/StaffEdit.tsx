import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Staff, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

type DbStaff = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  position: string;
  department: string;
  role: string;
  salary?: string | number | null;
  created_at: string;
  updated_at: string;
  employee_id?: string | null;
  hire_date?: string | null;
  certifications?: string[] | null;
  specializations?: string[] | null;
};

const mapSupabaseStaffToStaff = (dbStaff: DbStaff): Staff => {
  return {
    id: dbStaff.id,
    email: dbStaff.email,
    firstName: dbStaff.first_name,
    lastName: dbStaff.last_name,
    phone: dbStaff.phone || '',
    position: dbStaff.position,
    department: dbStaff.department,
    salary: dbStaff.salary ? parseFloat(String(dbStaff.salary)) : 0,
    role: (dbStaff.role ? dbStaff.role.toUpperCase() : UserRole.STAFF) as UserRole,
    hireDate: dbStaff.hire_date ? new Date(dbStaff.hire_date) : new Date(),
    employeeId: dbStaff.employee_id || '',
    schedule: [],
    certifications: dbStaff.certifications || [],
    specializations: dbStaff.specializations || [],
    createdAt: new Date(dbStaff.created_at),
    updatedAt: new Date(dbStaff.updated_at)
  };
};

const StaffEdit: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase.from('staff').select('*').eq('id', id).single();
        if (error) {
          toast.error('Failed to load staff member');
          return;
        }
        setStaff(mapSupabaseStaffToStaff(data as DbStaff));
      } catch {
        toast.error('Failed to load staff member');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchStaff();
  }, [id]);

  const allowed = hasRole(UserRole.ADMIN) || hasRole(UserRole.MANAGER);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    role: UserRole.STAFF as UserRole
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone || '',
        position: staff.position,
        department: staff.department,
        salary: staff.salary.toString(),
        role: staff.role
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          position: formData.position,
          department: formData.department,
          salary: parseFloat(formData.salary), // Ensure number is sent
          role: formData.role, // Remove unnecessary toUpperCase if it's already enum
          updated_at: new Date().toISOString()
        })
        .eq('id', staff?.id);
      if (error) {
        console.error('Update error:', error);
        toast.error(`Failed to update staff member: ${error.message}`);
        return;
      }
      toast.success('Staff member updated successfully');
      navigate('/dashboard?tab=staff');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Failed to update staff member');
    }
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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Edit Staff Member</CardTitle>
                <CardDescription>Update staff member information</CardDescription>
              </CardHeader>
              <CardContent>
                {!allowed ? (
                  <div className="p-6 text-center text-muted-foreground">Access denied</div>
                ) : isLoading ? (
                  <div className="p-6 text-center">Loading...</div>
                ) : !staff ? (
                  <div className="p-6 text-center">Staff member not found</div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData({ ...formData, department: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fitness">Fitness</SelectItem>
                              <SelectItem value="Operations">Operations</SelectItem>
                              <SelectItem value="Management">Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="salary">Annual Salary</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                          >
                            <SelectTrigger>
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
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/dashboard?tab=staff')}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="brand">
                        Update Staff Member
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default StaffEdit;
