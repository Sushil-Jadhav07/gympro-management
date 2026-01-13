import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Member, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

type DbMember = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  dob?: string | null;
  weight?: string | null;
  height?: string | null;
  membership_type: 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit';
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
};

const mapSupabaseMemberToMember = (dbMember: DbMember): Member => {
  const height = dbMember.height ? parseFloat(dbMember.height) : undefined;
  const heightUnit: 'cm' | 'ft' = 'cm';
  let heightFeet: number | undefined;
  let heightInches: number | undefined;
  const weightUnit: 'kg' | 'lbs' = 'kg';
  const weight = dbMember.weight ? parseFloat(dbMember.weight) : undefined;
  return {
    id: dbMember.id,
    email: dbMember.email,
    firstName: dbMember.first_name,
    lastName: dbMember.last_name,
    phone: dbMember.phone || '',
    dateOfBirth: dbMember.dob ? new Date(dbMember.dob) : new Date(),
    address: '',
    weight,
    weightUnit,
    height,
    heightUnit,
    heightFeet,
    heightInches,
    membershipType: dbMember.membership_type,
    membershipStartDate: new Date(),
    membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    isActive: dbMember.status === 'ACTIVE',
    role: UserRole.MEMBER,
    createdAt: new Date(dbMember.created_at),
    updatedAt: new Date(dbMember.updated_at),
    fitnessGoals: [],
    medicalConditions: [],
    notes: ''
  };
};

const getMembershipPrice = (membership: string) => {
  switch (membership) {
    case 'Gym':
      return 39.99;
    case 'Gym + Cardio':
      return 59.99;
    case 'Gym + Cardio + Crossfit':
      return 89.99;
    default:
      return 39.99;
  }
};

const MemberEdit: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
        if (error) {
          toast.error('Failed to load member');
          return;
        }
        setMember(mapSupabaseMemberToMember(data as DbMember));
      } catch {
        toast.error('Failed to load member');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchMember();
  }, [id]);

  const allowed = hasRole(UserRole.ADMIN) || hasRole(UserRole.MANAGER) || hasRole(UserRole.STAFF);

  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    weight: '',
    weightUnit: 'kg' as 'kg' | 'lbs',
    height: '',
    heightUnit: 'cm' as 'cm' | 'ft',
    heightFeet: '',
    heightInches: '',
    membershipType: 'Gym' as 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit',
    isActive: true
  });

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone || '',
        dateOfBirth: formatDateForInput(member.dateOfBirth),
        address: member.address || '',
        weight: member.weight?.toString() || '',
        weightUnit: (member.weightUnit || 'kg') as 'kg' | 'lbs',
        height: member.heightUnit === 'cm' ? (member.height?.toString() || '') : '',
        heightUnit: (member.heightUnit || 'cm') as 'cm' | 'ft',
        heightFeet: member.heightFeet?.toString() || '',
        heightInches: member.heightInches?.toString() || '',
        membershipType: member.membershipType as 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit',
        isActive: member.isActive
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let heightInCm = member.height;
      if (formData.heightUnit === 'ft' && formData.heightFeet) {
        const totalInches = (parseFloat(formData.heightFeet) * 12) + (parseFloat(formData.heightInches || '0'));
        heightInCm = totalInches * 2.54;
      } else if (formData.heightUnit === 'cm' && formData.height) {
        heightInCm = parseFloat(formData.height);
      }
      const { error } = await supabase
        .from('members')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          dob: formData.dateOfBirth,
          weight: formData.weight ? formData.weight.toString() : null,
          height: heightInCm ? heightInCm.toString() : null,
          membership_type: formData.membershipType,
          plan_price: getMembershipPrice(formData.membershipType).toString(),
          status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);
      if (error) {
        toast.error('Failed to update member');
        return;
      }
      toast.success('Member updated successfully');
      navigate('/dashboard?tab=members');
    } catch {
      toast.error('Failed to update member');
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
                <CardTitle className="text-2xl">Edit Member</CardTitle>
                <CardDescription>Update member information</CardDescription>
              </CardHeader>
              <CardContent>
                {!allowed ? (
                  <div className="p-6 text-center text-muted-foreground">Access denied</div>
                ) : isLoading ? (
                  <div className="p-6 text-center">Loading...</div>
                ) : !member ? (
                  <div className="p-6 text-center">Member not found</div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <div className="flex space-x-2">
                      <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                      <Select value={formData.weightUnit} onValueChange={(value) => setFormData({ ...formData, weightUnit: value as 'kg' | 'lbs' })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <div className="flex space-x-2">
                      {formData.heightUnit === 'cm' ? (
                        <Input id="height" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                      ) : (
                        <>
                          <Input id="heightFeet" type="number" value={formData.heightFeet} onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })} className="w-16" />
                          <Input id="heightInches" type="number" value={formData.heightInches} onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })} className="w-16" />
                        </>
                      )}
                      <Select value={formData.heightUnit} onValueChange={(value) => setFormData({ ...formData, heightUnit: value as 'cm' | 'ft' })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="ft">ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <Select value={formData.membershipType} onValueChange={(value) => setFormData({ ...formData, membershipType: value as 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gym">Gym - $39.99/month</SelectItem>
                      <SelectItem value="Gym + Cardio">Gym + Cardio - $59.99/month</SelectItem>
                      <SelectItem value="Gym + Cardio + Crossfit">Gym + Cardio + Crossfit - $89.99/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard?tab=members')}>Cancel</Button>
                <Button type="submit" variant="brand">Update Member</Button>
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

export default MemberEdit;
