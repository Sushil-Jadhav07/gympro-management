import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Member, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  UserPlus, 
  Eye,
  Users,
  Upload,
  Sparkles,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Activity,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import BulkUploadModal from './BulkUploadModal';
import { supabase, DEFAULT_GYM_ID } from '@/lib/supabase';
import { toast } from 'sonner';

const MemberManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembership, setSelectedMembership] = useState<string>('all');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to convert Supabase member to Member interface
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
    // Height is stored in cm in Supabase
    const height = dbMember.height ? parseFloat(dbMember.height) : undefined;
    const heightUnit: 'cm' | 'ft' = 'cm';
    let heightFeet: number | undefined;
    let heightInches: number | undefined;

    if (height) {
      // Height is always in cm in database, convert to feet if needed for display
      // For now, we'll keep it in cm, but you can add conversion logic here if needed
    }

    // Convert weight - assume stored value is in kg
    const weightUnit: 'kg' | 'lbs' = 'kg';
    const weight = dbMember.weight ? parseFloat(dbMember.weight) : undefined;

    return {
      id: dbMember.id,
      email: dbMember.email,
      firstName: dbMember.first_name,
      lastName: dbMember.last_name,
      phone: dbMember.phone || '',
      dateOfBirth: dbMember.dob ? new Date(dbMember.dob) : new Date(),
      weight,
      weightUnit,
      height,
      heightUnit,
      heightFeet,
      heightInches,
      membershipType: dbMember.membership_type as 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit',
      membershipStartDate: new Date(),
      membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: dbMember.status === 'ACTIVE',
      role: UserRole.MEMBER,
      createdAt: new Date(dbMember.created_at),
      updatedAt: new Date(dbMember.updated_at),
      fitnessGoals: [],
      medicalConditions: []
    };
  };

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching members:', error);
          toast.error('Failed to load members');
          return;
        }

        if (data) {
          const mappedMembers = data.map(mapSupabaseMemberToMember);
          setMembers(mappedMembers);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case 'Gym':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Gym + Cardio':
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
      case 'Gym + Cardio + Crossfit':
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
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

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMembership = selectedMembership === 'all' || member.membershipType === selectedMembership;
    
    return matchesSearch && matchesMembership;
  });

  const handleBulkUpload = (newMembers: Member[]) => {
    setMembers(prev => [...newMembers, ...prev]);
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    try {
      // Convert height to cm if needed
      let heightInCm = updatedMember.height;
      if (updatedMember.heightUnit === 'ft' && updatedMember.heightFeet) {
        const totalInches = (updatedMember.heightFeet * 12) + (updatedMember.heightInches || 0);
        heightInCm = totalInches * 2.54;
      }

      const { error } = await supabase
        .from('members')
        .update({
          first_name: updatedMember.firstName,
          last_name: updatedMember.lastName,
          email: updatedMember.email,
          phone: updatedMember.phone || null,
          dob: updatedMember.dateOfBirth.toISOString().split('T')[0],
          weight: updatedMember.weight ? updatedMember.weight.toString() : null,
          height: heightInCm ? heightInCm.toString() : null,
          membership_type: updatedMember.membershipType,
          plan_price: getMembershipPrice(updatedMember.membershipType).toString(),
          status: updatedMember.isActive ? 'ACTIVE' : 'INACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedMember.id);

      if (error) {
        console.error('Error updating member:', error);
        toast.error('Failed to update member');
        return;
      }

      setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
      setIsEditDialogOpen(false);
      setEditingMember(null);
      toast.success('Member updated successfully');
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error deleting member:', error);
        toast.error('Failed to delete member');
        return;
      }

      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };



  const EditMemberForm = ({ member }: { member: Member }) => {
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
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
      emergencyContactName: member.emergencyContact?.name || '',
      emergencyContactPhone: member.emergencyContact?.phone || '',
      emergencyContactRelationship: member.emergencyContact?.relationship || '',
      medicalConditions: member.medicalConditions?.join(', ') || '',
      fitnessGoals: member.fitnessGoals?.join(', ') || '',
      notes: member.notes || '',
      isActive: member.isActive
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const updatedMember: Member = {
        ...member,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: new Date(formData.dateOfBirth),
        address: formData.address,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        weightUnit: formData.weightUnit,
        height: formData.heightUnit === 'cm' ? (formData.height ? parseFloat(formData.height) : undefined) : (formData.heightFeet ? parseFloat(formData.heightFeet) : undefined),
        heightUnit: formData.heightUnit,
        heightFeet: formData.heightUnit === 'ft' ? (formData.heightFeet ? parseFloat(formData.heightFeet) : undefined) : undefined,
        heightInches: formData.heightUnit === 'ft' ? (formData.heightInches ? parseFloat(formData.heightInches) : undefined) : undefined,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        },
        membershipType: formData.membershipType,
        isActive: formData.isActive,
        fitnessGoals: formData.fitnessGoals.split(',').map(goal => goal.trim()).filter(goal => goal),
        medicalConditions: formData.medicalConditions.split(',').map(condition => condition.trim()).filter(condition => condition),
        notes: formData.notes,
        updatedAt: new Date()
      };

      handleUpdateMember(updatedMember);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name *</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name *</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dateOfBirth">Date of Birth *</Label>
            <Input
              id="edit-dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Physical Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight</Label>
              <div className="flex space-x-2">
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                />
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
              <Label htmlFor="edit-height">Height</Label>
              <div className="flex space-x-2">
                {formData.heightUnit === 'cm' ? (
                  <Input
                    id="edit-height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="175"
                  />
                ) : (
                  <>
                    <Input
                      id="edit-heightFeet"
                      type="number"
                      value={formData.heightFeet}
                      onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                      placeholder="5"
                      className="w-16"
                    />
                    <span className="self-center">ft</span>
                    <Input
                      id="edit-heightInches"
                      type="number"
                      value={formData.heightInches}
                      onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                      placeholder="10"
                      className="w-16"
                    />
                    <span className="self-center">in</span>
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
          <h3 className="text-lg font-semibold">Membership Information</h3>
          <div className="space-y-2">
            <Label htmlFor="edit-membershipType">Membership Type *</Label>
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
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Emergency Contact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyName">Name</Label>
              <Input
                id="edit-emergencyName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyPhone">Phone</Label>
              <Input
                id="edit-emergencyPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyRelationship">Relationship</Label>
              <Input
                id="edit-emergencyRelationship"
                value={formData.emergencyContactRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <div className="space-y-2">
            <Label htmlFor="edit-fitnessGoals">Fitness Goals (comma-separated)</Label>
            <Input
              id="edit-fitnessGoals"
              value={formData.fitnessGoals}
              onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
              placeholder="Weight Loss, Muscle Building"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-medicalConditions">Medical Conditions (comma-separated)</Label>
            <Input
              id="edit-medicalConditions"
              value={formData.medicalConditions}
              onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
              placeholder="None, Knee Injury"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => {
            setIsEditDialogOpen(false);
            setEditingMember(null);
          }}>
            Cancel
          </Button>
          <Button type="submit" variant="brand">
            Update Member
          </Button>
        </div>
      </form>
    );
  };

  const ViewMemberDialog = ({ member }: { member: Member }) => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-cyan-500/5 p-6 border border-white/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="h-24 w-24 text-violet-500" />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full blur-lg opacity-20" />
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white text-3xl font-bold">
                {member.firstName[0]}{member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
               <Badge className={`${member.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white border-2 border-white shadow-sm`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </motion.div>
          
          <div className="text-center md:text-left space-y-2 flex-1">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h3>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4" /> {member.email}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm border-gray-200/50">
                ID: {member.id.slice(0, 8)}...
              </Badge>
              <Badge className={`${getMembershipColor(member.membershipType)} border`}>
                {member.membershipType}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-white/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-violet-500" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {member.phone || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Date of Birth</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {member.dateOfBirth.toLocaleDateString()} ({calculateAge(member.dateOfBirth)} yrs)
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Weight</p>
                <p className="font-medium">{member.weight ? `${member.weight} ${member.weightUnit}` : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Height</p>
                <p className="font-medium">
                  {member.height 
                    ? (member.heightUnit === 'cm' ? `${member.height} cm` : `${member.heightFeet}'${member.heightInches}"`)
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-dashed">
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Address</p>
              <p className="font-medium flex items-start gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                {member.address || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Membership & Status Card */}
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-white/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Membership Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <span className="font-semibold text-violet-700">{member.membershipType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Fee</span>
                <span className="font-bold text-lg">${getMembershipPrice(member.membershipType)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Start Date</p>
                <p className="font-medium">{member.membershipStartDate.toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">End Date</p>
                <p className="font-medium">{member.membershipEndDate.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health & Emergency Card - Full Width */}
        <Card className="md:col-span-2 border-0 shadow-lg shadow-gray-100/50 bg-white/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-pink-500" />
              Health & Emergency
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
               {member.emergencyContact && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    Emergency Contact
                  </h4>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="font-medium text-red-900">{member.emergencyContact.name}</p>
                    <p className="text-sm text-red-700">{member.emergencyContact.relationship}</p>
                    <p className="text-sm text-red-700 font-mono mt-1">{member.emergencyContact.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {member.fitnessGoals && member.fitnessGoals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Fitness Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.fitnessGoals.map((goal, i) => (
                      <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {member.medicalConditions && member.medicalConditions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Medical Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.medicalConditions.map((condition, i) => (
                      <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {member.notes && (
          <Card className="md:col-span-2 border-0 shadow-lg shadow-gray-100/50 bg-amber-50/50 backdrop-blur-xl border-amber-100/50">
             <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Notes
                </h4>
                <p className="text-sm text-amber-800/80 italic">{member.notes}</p>
             </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.isActive).length,
    gymMembers: members.filter(m => m.membershipType === 'Gym').length,
    gymCardioMembers: members.filter(m => m.membershipType === 'Gym + Cardio').length,
    fullMembers: members.filter(m => m.membershipType === 'Gym + Cardio + Crossfit').length
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet-600" />
            Member Management
          </h2>
          <p className="text-muted-foreground">Manage gym members and their information</p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={() => setIsBulkUploadOpen(true)}
              className="rounded-full border-2 h-11 px-6"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="brand"
              className="rounded-full h-11 px-6 shadow-lg"
              onClick={() => navigate('/members/new')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </motion.div>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Members', value: stats.totalMembers, icon: Users, gradient: 'from-violet-500 to-blue-500', delay: 0.1 },
          { label: 'Active', value: stats.activeMembers, icon: Users, gradient: 'from-blue-500 to-cyan-500', delay: 0.2 },
          { label: 'Gym', value: stats.gymMembers, icon: Users, gradient: 'from-blue-500 to-indigo-500', delay: 0.3 },
          { label: 'Gym + Cardio', value: stats.gymCardioMembers, icon: Users, gradient: 'from-cyan-500 to-blue-500', delay: 0.4 },
          { label: 'Full Package', value: stats.fullMembers, icon: Users, gradient: 'from-violet-500 to-indigo-500', delay: 0.5 },
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden"
      >
        <CardHeader className="bg-gradient-to-r from-white/80 to-white/40 border-b border-border/40">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            Members Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-2 h-11 bg-white/50"
                />
              </div>
            </div>
            <Select value={selectedMembership} onValueChange={setSelectedMembership}>
              <SelectTrigger className="w-48 rounded-full border-2 h-11 bg-white/50">
                <SelectValue placeholder="Filter by membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="Gym">Gym</SelectItem>
                <SelectItem value="Gym + Cardio">Gym + Cardio</SelectItem>
                <SelectItem value="Gym + Cardio + Crossfit">Gym + Cardio + Crossfit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50/50 to-white/50">
                <TableRow className="border-border/40">
                  <TableHead className="font-semibold">Member</TableHead>
                  <TableHead className="font-semibold">Membership</TableHead>
                  <TableHead className="font-semibold">Age</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                        <span className="ml-3 text-muted-foreground">Loading members...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-border/40 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-blue-50/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="ring-2 ring-violet-500/20">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge className={`${getMembershipColor(member.membershipType)} border rounded-full px-3 py-1`}>
                          {member.membershipType}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          ${getMembershipPrice(member.membershipType)}/month
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{calculateAge(member.dateOfBirth)}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.dateOfBirth.toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={member.isActive ? 'default' : 'secondary'}
                        className={`rounded-full ${member.isActive ? 'bg-blue-500/10 text-blue-700 border-blue-200' : 'bg-gray-500/10 text-gray-700 border-gray-200'}`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsViewDialogOpen(true);
                          }}
                          className="rounded-full"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {hasRole(UserRole.STAFF) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/members/${member.id}/edit`)}
                              className="rounded-full"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="rounded-full"
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
        </CardContent>
      </motion.div>

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onMembersUploaded={handleBulkUpload}
      />

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Member Details</DialogTitle>
            <DialogDescription>
              View complete member information
            </DialogDescription>
          </DialogHeader>
          {selectedMember && <ViewMemberDialog member={selectedMember} />}
        </DialogContent>
      </Dialog>

      {isEditDialogOpen && editingMember && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Member</CardTitle>
            <CardDescription>Update member information</CardDescription>
          </CardHeader>
          <CardContent>
            <EditMemberForm member={editingMember} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberManagement;
