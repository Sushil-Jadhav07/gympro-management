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
import { supabase, DEFAULT_GYM_ID } from '@/lib/supabase';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { 
  UserPlus, 
  ArrowLeft, 
  User, 
  Activity, 
  CreditCard, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  FileText,
  Heart,
  ShieldAlert,
  CheckCircle2,
  Dumbbell
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const MemberCreate: React.FC = () => {
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
    dateOfBirth: '',
    address: '',
    weight: '',
    weightUnit: 'kg' as 'kg' | 'lbs',
    height: '',
    heightUnit: 'cm' as 'cm' | 'ft',
    heightFeet: '',
    heightInches: '',
    membershipType: 'Gym' as 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalConditions: '',
    fitnessGoals: '',
    notes: ''
  });

  const allowed = hasRole(UserRole.ADMIN) || hasRole(UserRole.MANAGER) || hasRole(UserRole.STAFF);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let heightInCm: number | null = null;
      if (formData.heightUnit === 'cm' && formData.height) {
        heightInCm = parseFloat(formData.height);
      } else if (formData.heightUnit === 'ft' && formData.heightFeet) {
        const totalInches = (parseFloat(formData.heightFeet) * 12) + (parseFloat(formData.heightInches || '0'));
        heightInCm = totalInches * 2.54;
      }
      const weightValue = formData.weight ? parseFloat(formData.weight) : null;
      
      const { error } = await supabase
        .from('members')
        .insert({
          gym_id: DEFAULT_GYM_ID,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          dob: formData.dateOfBirth || null,
          weight: weightValue ? weightValue.toString() : null,
          height: heightInCm ? heightInCm.toString() : null,
          membership_type: formData.membershipType,
          plan_price: getMembershipPrice(formData.membershipType).toString(),
          status: 'ACTIVE',
        });

      if (error) {
        toast.error(error.message || 'Failed to create member');
        return;
      }
      toast.success('Member added successfully');
      navigate('/dashboard?tab=members');
    } catch (error) {
      toast.error('Failed to create member');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50/50">
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
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold mb-2 text-gray-900 flex items-center gap-3"
                >
                  <div className="p-3 bg-violet-600 rounded-xl shadow-lg shadow-violet-200">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  Add New Member
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground ml-16"
                >
                  Create a new membership account and set up their profile
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard?tab=members')}
                  className="group hover:border-violet-200 hover:bg-violet-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Members
                </Button>
              </motion.div>
            </div>

            {!allowed ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center text-red-600">
                  Access denied. You do not have permission to add members.
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Personal Information Card */}
                    <motion.div variants={itemVariants}>
                      <Card className="border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-violet-500" />
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                          </div>
                          <CardDescription>Basic details about the member</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input 
                              id="firstName" 
                              value={formData.firstName} 
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                              required 
                              className="focus-visible:ring-violet-500"
                              placeholder="John"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input 
                              id="lastName" 
                              value={formData.lastName} 
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                              required 
                              className="focus-visible:ring-violet-500"
                              placeholder="Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email} 
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                              required 
                              className="focus-visible:ring-violet-500"
                              placeholder="john.doe@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                              id="phone" 
                              value={formData.phone} 
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                              className="focus-visible:ring-violet-500"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input 
                              id="dateOfBirth" 
                              type="date" 
                              value={formData.dateOfBirth} 
                              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} 
                              className="focus-visible:ring-violet-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input 
                              id="address" 
                              value={formData.address} 
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                              className="focus-visible:ring-violet-500"
                              placeholder="123 Main St, City, Country"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Physical Stats Card */}
                    <motion.div variants={itemVariants}>
                      <Card className="border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg">Physical Statistics</CardTitle>
                          </div>
                          <CardDescription>Body measurements for tracking progress</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight</Label>
                            <div className="flex space-x-2">
                              <Input 
                                id="weight" 
                                type="number" 
                                step="0.1" 
                                value={formData.weight} 
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })} 
                                className="focus-visible:ring-blue-500"
                                placeholder="70"
                              />
                              <Select 
                                value={formData.weightUnit} 
                                onValueChange={(value) => setFormData({ ...formData, weightUnit: value as 'kg' | 'lbs' })}
                              >
                                <SelectTrigger className="w-24">
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
                                <Input 
                                  id="height" 
                                  type="number" 
                                  value={formData.height} 
                                  onChange={(e) => setFormData({ ...formData, height: e.target.value })} 
                                  className="focus-visible:ring-blue-500"
                                  placeholder="175"
                                />
                              ) : (
                                <>
                                  <Input 
                                    id="heightFeet" 
                                    type="number" 
                                    value={formData.heightFeet} 
                                    onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })} 
                                    className="w-full focus-visible:ring-blue-500"
                                    placeholder="5"
                                  />
                                  <Input 
                                    id="heightInches" 
                                    type="number" 
                                    value={formData.heightInches} 
                                    onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })} 
                                    className="w-full focus-visible:ring-blue-500"
                                    placeholder="9"
                                  />
                                </>
                              )}
                              <Select 
                                value={formData.heightUnit} 
                                onValueChange={(value) => setFormData({ ...formData, heightUnit: value as 'cm' | 'ft' })}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cm">cm</SelectItem>
                                  <SelectItem value="ft">ft</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Emergency Contact Card */}
                    <motion.div variants={itemVariants}>
                      <Card className="border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            <CardTitle className="text-lg">Emergency Contact</CardTitle>
                          </div>
                          <CardDescription>Who to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                            <Label htmlFor="emergencyName">Contact Name</Label>
                            <Input 
                              id="emergencyName" 
                              value={formData.emergencyContactName} 
                              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} 
                              placeholder="Jane Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyPhone">Contact Phone</Label>
                            <Input 
                              id="emergencyPhone" 
                              value={formData.emergencyContactPhone} 
                              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} 
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="emergencyRelation">Relationship</Label>
                            <Input 
                              id="emergencyRelation" 
                              value={formData.emergencyContactRelationship} 
                              onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })} 
                              placeholder="Spouse, Parent, etc."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Right Column - Membership & Summary */}
                  <div className="space-y-8">
                    
                    {/* Membership Plan Card */}
                    <motion.div variants={itemVariants}>
                      <Card className="border-0 shadow-lg bg-white overflow-hidden h-full">
                        <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white pb-6">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            <CardTitle className="text-lg text-white">Membership Plan</CardTitle>
                          </div>
                          <CardDescription className="text-violet-100">Select the best plan for the member</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {['Gym', 'Gym + Cardio', 'Gym + Cardio + Crossfit'].map((plan) => (
                            <div 
                              key={plan}
                              onClick={() => setFormData({ ...formData, membershipType: plan as 'Gym' | 'Gym + Cardio' | 'Gym + Cardio + Crossfit' })}
                              className={`
                                cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 
                                ${formData.membershipType === plan 
                                  ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500 shadow-sm' 
                                  : 'border-gray-100 hover:border-violet-200 hover:bg-gray-50'
                                }
                              `}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-semibold text-sm ${formData.membershipType === plan ? 'text-violet-700' : 'text-gray-700'}`}>
                                  {plan}
                                </h4>
                                {formData.membershipType === plan && (
                                  <CheckCircle2 className="h-5 w-5 text-violet-600" />
                                )}
                              </div>
                              <p className={`text-2xl font-bold ${formData.membershipType === plan ? 'text-violet-600' : 'text-gray-900'}`}>
                                ${getMembershipPrice(plan)}
                                <span className="text-sm font-normal text-muted-foreground">/mo</span>
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Summary / Submit Card */}
                    <motion.div variants={itemVariants}>
                      <Card className="border-0 shadow-lg bg-white overflow-hidden">
                         <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <CardTitle className="text-lg">Summary</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Monthly Total:</span>
                            <span className="text-xl font-bold text-violet-600">${getMembershipPrice(formData.membershipType)}</span>
                          </div>
                          <Separator />
                          <Button 
                            type="submit" 
                            className="w-full h-12 text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 transition-all duration-300"
                          >
                            Create Member Account
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => navigate('/dashboard?tab=members')}
                            className="w-full text-muted-foreground hover:text-gray-900"
                          >
                            Cancel
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>

                  </div>
                </motion.div>
              </form>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default MemberCreate;
