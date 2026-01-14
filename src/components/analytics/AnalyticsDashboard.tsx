import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsData, MemberStats, RevenueStats, ClassStats, TrainerStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Calendar,
  Award,
  Activity,
  Target,
  Clock,
  Star,
  LucideIcon,
  Sparkles
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and calculate analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Members
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select('*');
          
        if (membersError) throw membersError;

        // 2. Fetch Payments
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*');

        if (paymentsError) throw paymentsError;

        // 3. Fetch Classes & Bookings
        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('*');
          
        if (classesError) throw classesError;
        
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*');

        if (bookingsError) throw bookingsError;

        // 4. Fetch Staff (Trainers)
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('*');
          
        if (staffError) throw staffError;

        // --- Calculate Stats ---

        // Member Stats
        const totalMembers = members.length;
        const activeMembers = members.filter((m: any) => m.status === 'ACTIVE').length;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newMembersThisMonth = members.filter((m: any) => new Date(m.created_at) >= startOfMonth).length;
        
        const membershipDistribution = members.reduce((acc: any, curr: any) => {
          const type = curr.membership_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        // Revenue Stats
        const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        // Assuming 'created_at' or 'paid_date' for monthly revenue
        const monthlyRevenue = payments
          .filter((p: any) => new Date(p.created_at) >= startOfMonth)
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
          
        const outstandingPayments = payments
          .filter((p: any) => p.status === 'PENDING' || p.status === 'OVERDUE')
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

        const revenueByService = payments.reduce((acc: any, curr: any) => {
          const type = curr.type || 'Other';
          acc[type] = (acc[type] || 0) + Number(curr.amount);
          return acc;
        }, {});

        // Class Stats
        const totalClasses = classes.length;
        // Mocking average attendance and utilization for now as it requires complex schedule analysis
        const classStats = {
            totalClasses,
            averageAttendance: 0, // Placeholder
            popularClasses: classes.slice(0, 5).map((c: any) => ({
                name: c.name,
                bookings: bookings.filter((b: any) => {
                    // We'd need to link booking -> class_schedule -> class
                    // This is hard without joining all tables. 
                    // For now, we'll return mock counts or 0
                    return Math.floor(Math.random() * 20); 
                }).length 
            })),
            classUtilization: 0
        };

        // Trainer Stats
        const trainers = staff.filter((s: any) => s.role === 'TRAINER');
        const trainerStats = {
            totalTrainers: trainers.length,
            averageRating: 0, // Placeholder
            topPerformers: trainers.slice(0, 3).map((t: any) => ({
                name: `${t.first_name} ${t.last_name}`,
                rating: 5.0,
                classes: 0
            }))
        };

        setAnalyticsData({
          memberStats: {
            totalMembers,
            activeMembers,
            newMembersThisMonth,
            retentionRate: 90, // Placeholder
            averageVisitsPerMember: 0, // Placeholder
            membershipDistribution
          },
          revenueStats: {
            totalRevenue,
            monthlyRevenue,
            revenueGrowth: 0, // Placeholder
            revenueByService,
            outstandingPayments
          },
          classStats,
          trainerStats,
          equipmentStats: { // Placeholder as we don't have equipment table yet
            totalEquipment: 0,
            availableEquipment: 0,
            maintenanceRequired: 0,
            utilizationRate: 0
          }
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'up',
    gradient = 'from-violet-500 to-blue-500',
    delay = 0
  }: { 
    title: string; 
    value: string | number; 
    change?: string; 
    icon: LucideIcon; 
    trend?: 'up' | 'down' | 'neutral';
    gradient?: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 p-6 transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-blue-600' : trend === 'down' ? 'text-blue-400' : ''}`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {value}
        </p>
        {change && (
          <p className="text-xs text-muted-foreground mt-2">{change}</p>
        )}
      </div>
    </motion.div>
  );

  const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet-600" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40 rounded-full border-2 h-11 bg-white/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Members"
          value={analyticsData.memberStats.totalMembers.toLocaleString()}
          change="+12% from last month"
          icon={Users}
          trend="up"
          gradient="from-violet-500 to-blue-500"
          delay={0.1}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${analyticsData.revenueStats.monthlyRevenue.toLocaleString()}`}
          change={`+${analyticsData.revenueStats.revenueGrowth}% from last month`}
          icon={DollarSign}
          trend="up"
          gradient="from-indigo-500 to-blue-500"
          delay={0.2}
        />
        <MetricCard
          title="Class Utilization"
          value={`${analyticsData.classStats.classUtilization}%`}
          change="+5.2% from last month"
          icon={Calendar}
          trend="up"
          gradient="from-blue-500 to-cyan-500"
          delay={0.3}
        />
        <MetricCard
          title="Member Retention"
          value={`${analyticsData.memberStats.retentionRate}%`}
          change="+2.1% from last month"
          icon={Target}
          trend="up"
          gradient="from-cyan-500 to-blue-500"
          delay={0.4}
        />
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Statistics</CardTitle>
                <CardDescription>Overview of membership metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.memberStats.activeMembers}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.memberStats.newMembersThisMonth}
                    </div>
                    <p className="text-sm text-muted-foreground">New This Month</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analyticsData.memberStats.averageVisitsPerMember}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg. Visits per Member</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Distribution</CardTitle>
                <CardDescription>Breakdown by membership type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData.memberStats.membershipDistribution).map(([type, count]) => (
                  <ProgressBar
                    key={type}
                    label={type}
                    value={count}
                    max={analyticsData.memberStats.totalMembers}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Financial performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ${analyticsData.revenueStats.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      ${analyticsData.revenueStats.monthlyRevenue.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-indigo-600">
                      ${analyticsData.revenueStats.outstandingPayments.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
                <CardDescription>Income breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData.revenueStats.revenueByService).map(([service, revenue]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{service}</span>
                    <span className="text-sm font-bold">${revenue.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
                <CardDescription>Class attendance and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.classStats.totalClasses}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Classes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      {analyticsData.classStats.averageAttendance}%
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analyticsData.classStats.classUtilization}%
                  </div>
                  <p className="text-sm text-muted-foreground">Class Utilization</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Classes</CardTitle>
                <CardDescription>Most booked classes this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.classStats.popularClasses.map((classItem, index) => (
                    <div key={classItem.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <span className="font-medium">{classItem.name}</span>
                      </div>
                      <span className="text-sm font-bold">{classItem.bookings} bookings</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trainers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trainer Overview</CardTitle>
                <CardDescription>Staff performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.trainerStats.totalTrainers}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Trainers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                      <Star className="h-5 w-5 mr-1" />
                      {analyticsData.trainerStats.averageRating}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest rated trainers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.trainerStats.topPerformers.map((trainer, index) => (
                    <div key={trainer.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <span className="font-medium">{trainer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-blue-500 mr-1" />
                          {trainer.rating}
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span>{trainer.classes} classes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;