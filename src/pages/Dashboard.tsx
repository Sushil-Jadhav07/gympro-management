import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MemberManagement from '@/components/members/MemberManagement';
import ClassBooking from '@/components/classes/ClassBooking';
import StaffManagement from '@/components/staff/StaffManagement';
import PaymentSystem from '@/components/payments/PaymentSystem';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setDisplayValue(Math.floor(value * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
};

// Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 ${className}`}
  >
    {children}
  </motion.div>
);

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}> = ({ title, value, change, icon: Icon, gradient, delay = 0 }) => {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 p-6 transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-blue-600' : 'text-blue-400'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          <AnimatedCounter value={value} />
        </p>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  if (!user) return null;

  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Members"
        value={1234}
        change={12}
        icon={Users}
        gradient="from-violet-500 to-blue-500"
        delay={0.1}
      />
      <StatCard
        title="Active Classes"
        value={48}
        change={8}
        icon={Calendar}
        gradient="from-blue-500 to-cyan-500"
        delay={0.2}
      />
      <StatCard
        title="Monthly Revenue"
        value={45231}
        change={15}
        icon={DollarSign}
        gradient="from-blue-500 to-indigo-500"
        delay={0.3}
      />
      <StatCard
        title="Equipment Status"
        value={94}
        change={-2}
        icon={Activity}
        gradient="from-cyan-500 to-blue-500"
        delay={0.4}
      />
    </div>
  );

  const RecentActivity = () => {
    const activities = [
      { icon: Users, text: 'New member registration', subtext: 'John Doe joined Premium membership', time: '2 min ago', color: 'from-blue-500 to-cyan-500' },
      { icon: Calendar, text: 'Class booking', subtext: 'Yoga class is now fully booked', time: '5 min ago', color: 'from-violet-500 to-blue-500' },
      { icon: Activity, text: 'Equipment maintenance', subtext: 'Treadmill #3 scheduled for service', time: '1 hour ago', color: 'from-indigo-500 to-blue-500' },
    ];

    return (
      <GlassCard delay={0.3}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${activity.color} shadow-md`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.subtext}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </GlassCard>
    );
  };

  const QuickActions = () => {
    const actions = [
      { icon: Users, label: 'Add Member', color: 'from-violet-500 to-blue-500' },
      { icon: Calendar, label: 'Schedule Class', color: 'from-blue-500 to-cyan-500' },
      { icon: CreditCard, label: 'Process Payment', color: 'from-indigo-500 to-blue-500' },
      { icon: Activity, label: 'View Reports', color: 'from-cyan-500 to-blue-500' },
    ];

    return (
      <GlassCard delay={0.4}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm border border-white/20 p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </GlassCard>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <motion.div
        animate={{
          marginLeft: isSidebarCollapsed ? '5rem' : '16rem' // 80px when collapsed, 256px when expanded
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="transition-all duration-300"
      >
        <Topbar />
        <main className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome back, {user.firstName}! 👋
                  </h1>
                  <p className="text-muted-foreground">Here's what's happening at your gym today.</p>
                </div>

                <QuickStats />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentActivity />
                  <QuickActions />
                </div>
              </motion.div>
            )}

            {activeTab === 'members' && hasRole(UserRole.STAFF) && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MemberManagement />
              </motion.div>
            )}

            {activeTab === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ClassBooking />
              </motion.div>
            )}

            {activeTab === 'staff' && hasRole(UserRole.MANAGER) && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StaffManagement />
              </motion.div>
            )}

            {activeTab === 'payments' && hasRole(UserRole.STAFF) && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentSystem />
              </motion.div>
            )}

            {activeTab === 'analytics' && hasRole(UserRole.MANAGER) && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnalyticsDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default Dashboard;
