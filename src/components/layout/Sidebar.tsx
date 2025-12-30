import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  CreditCard, 
  BarChart3,
  Dumbbell,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: UserRole[];
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed: externalCollapsed, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    if (externalCollapsed === undefined) {
      setInternalCollapsed(newState);
    }
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    onToggle?.();
  };

  useEffect(() => {
    // Update localStorage when external state changes
    if (externalCollapsed !== undefined) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(externalCollapsed));
    }
  }, [externalCollapsed]);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'members', label: 'Members', icon: Users, path: '/dashboard', roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN] },
    { id: 'classes', label: 'Classes', icon: Calendar, path: '/dashboard' },
    { id: 'staff', label: 'Staff', icon: UserCheck, path: '/dashboard', roles: [UserRole.MANAGER, UserRole.ADMIN] },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/dashboard', roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard', roles: [UserRole.MANAGER, UserRole.ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.some(role => hasRole(role))
  );

  const getActiveTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const handleNavigation = (item: NavItem) => {
    navigate(`${item.path}?tab=${item.id}`);
  };

  const isActive = (item: NavItem) => {
    const activeTab = getActiveTab();
    return activeTab === item.id;
  };

  return (
    <TooltipProvider>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border/40 bg-white/80 backdrop-blur-xl transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "relative flex h-16 items-center border-b border-border/40 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "gap-3 px-6"
          )}>
            {isCollapsed ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20 flex-shrink-0"
                >
                  <Dumbbell className="h-5 w-5 text-white" />
                </motion.div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-lg bg-white border border-border/40 shadow-md hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20 flex-shrink-0"
                >
                  <Dumbbell className="h-5 w-5 text-white" />
                </motion.div>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden flex-1"
                  >
                    <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                      GymPro
                    </h1>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Management</p>
                  </motion.div>
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleCollapse}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors flex-shrink-0 flex items-center justify-center"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 space-y-1 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
            {filteredNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(item)}
                      className={cn(
                        "relative w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                        isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                        active
                          ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {active && !isCollapsed && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute right-2 h-2 w-2 rounded-full bg-white"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* User Section */}
          <div className={cn("border-t border-border/40 space-y-2 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
            <div className={cn(
              "flex items-center rounded-lg hover:bg-accent transition-colors",
              isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-2 py-2"
            )}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className={cn("flex gap-2", isCollapsed && "flex-col")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-9 rounded-lg", isCollapsed ? "w-full" : "flex-1")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Settings</p>
                  </TooltipContent>
                )}
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className={cn("h-9 rounded-lg text-destructive hover:text-destructive", isCollapsed ? "w-full" : "flex-1")}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Logout</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;

