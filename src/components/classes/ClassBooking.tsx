import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Class, ClassSchedule, Booking, UserRole } from '@/types';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Clock,
  Users,
  MapPin,
  Plus,
  Search,
  User,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import PageLoader from '../ui/PageLoader';

const ClassBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch Classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*');

        if (classesError) throw classesError;

        if (!classesData || classesData.length === 0) {
          setClasses([]);
          setClassSchedules([]);
          setIsLoading(false);
          return;
        }

        // 2. Fetch Instructors
        const instructorIds = [...new Set(classesData.map((c: any) => c.instructor_id))].filter(Boolean);
        let instructorsMap = new Map();

        if (instructorIds.length > 0) {
          const { data: instructorsData, error: instructorsError } = await supabase
            .from('staff')
            .select('*')
            .in('id', instructorIds);

          if (instructorsError) {
            console.warn('Could not fetch instructors', instructorsError);
          } else if (instructorsData) {
            instructorsMap = new Map(instructorsData.map((i: any) => [i.id, i]));
          }
        }

        const mappedClasses: Class[] = classesData.map((c: any) => {
          const instructor = instructorsMap.get(c.instructor_id);
          return {
            id: c.id,
            name: c.name,
            description: c.description,
            instructorId: c.instructor_id,
            instructor: instructor ? {
              id: instructor.id,
              email: instructor.email,
              firstName: instructor.first_name,
              lastName: instructor.last_name,
              role: instructor.role as UserRole,
              employeeId: instructor.employee_id || '',
              position: instructor.position || '',
              department: instructor.department || '',
              hireDate: new Date(instructor.hire_date || Date.now()),
              salary: Number(instructor.salary) || 0,
              schedule: [],
              certifications: instructor.certifications || [],
              specializations: instructor.specializations || [],
              createdAt: new Date(instructor.created_at),
              updatedAt: new Date(instructor.updated_at)
            } : {
              // Fallback instructor if missing
              id: 'unknown',
              email: '',
              firstName: 'Unknown',
              lastName: 'Instructor',
              role: UserRole.TRAINER,
              employeeId: '',
              position: '',
              department: '',
              hireDate: new Date(),
              salary: 0,
              schedule: [],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            capacity: c.capacity,
            duration: c.duration,
            price: c.price,
            category: c.category,
            difficulty: c.difficulty,
            equipment: c.equipment || [],
            isActive: c.is_active
          };
        });

        setClasses(mappedClasses);

        // 3. Fetch Rooms (mock)
        const roomsMap = new Map();

        // 4. Fetch Class Schedules
        const { data: schedulesData, error: schedulesError } = await supabase
          .from('class_schedules')
          .select('*')
          .order('date', { ascending: true });

        if (schedulesError) throw schedulesError;

        if (!schedulesData || schedulesData.length === 0) {
          setClassSchedules([]);
          setIsLoading(false);
          return;
        }

        const mappedSchedules: ClassSchedule[] = schedulesData.map((s: any) => {
          const relatedClass = mappedClasses.find(c => c.id === s.class_id);
          const relatedRoom = roomsMap.get(s.room_id);

          // Fallback mock room if not found
          const room = relatedRoom ? {
            id: relatedRoom.id,
            name: relatedRoom.name,
            capacity: relatedRoom.capacity,
            equipment: relatedRoom.equipment || [],
            amenities: relatedRoom.amenities || [],
            isActive: relatedRoom.is_active
          } : {
            id: '0',
            name: 'Main Studio',
            capacity: 20,
            isActive: true
          };

          if (!relatedClass) return null;

          return {
            id: s.id,
            classId: s.class_id,
            class: relatedClass,
            date: new Date(s.date),
            startTime: s.start_time,
            endTime: s.end_time,
            roomId: s.room_id,
            room,
            bookedCount: s.booked_count || 0,
            waitlistCount: s.waitlist_count || 0,
            status: s.status
          };
        }).filter(Boolean) as ClassSchedule[];

        setClassSchedules(mappedSchedules);

      } catch (error) {
        console.error('Error fetching class data:', error);
        toast.error('Failed to load class schedules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  const handleBookClass = async (schedule: ClassSchedule) => {
    if (!user) return;

    try {
      // Create booking in Supabase
      const { error } = await supabase
        .from('bookings')
        .insert({
          member_id: user.id,
          class_schedule_id: schedule.id,
          booking_date: new Date().toISOString(),
          status: 'CONFIRMED'
        });

      if (error) throw error;

      // Update local state
      setClassSchedules(prev => prev.map(s =>
        s.id === schedule.id
          ? { ...s, bookedCount: s.bookedCount + 1 }
          : s
      ));

      toast.success('Class booked successfully!');
      setIsBookingDialogOpen(false);
    } catch (error: any) {
      console.error('Error booking class:', error);
      toast.error(error.message || 'Failed to book class');
    }
  };

  const filteredSchedules = classSchedules.filter(schedule => {
    const matchesCategory = filterCategory === 'all' || schedule.class.category === filterCategory;
    const matchesSearch = schedule.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.class.instructor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.class.instructor.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-[#00bc7d]/10 text-[#00bc7d] border-[#00bc7d]/20';
      case 'intermediate':
        return 'bg-[#00bc7d]/20 text-[#00bc7d] border-[#00bc7d]/30';
      case 'advanced':
        return 'bg-[#00bc7d]/30 text-[#00bc7d] border-[#00bc7d]/40';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAvailabilityColor = (schedule: ClassSchedule) => {
    const availableSpots = schedule.class.capacity - schedule.bookedCount;
    if (availableSpots === 0) return 'bg-red-50 text-red-600 border-red-100';
    if (availableSpots < 5) return 'bg-orange-50 text-orange-600 border-orange-100';
    return 'bg-[#00bc7d]/10 text-[#00bc7d] border-[#00bc7d]/20';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-[#00bc7d]" />
            Class Booking
          </h2>
          <p className="text-muted-foreground">Book fitness classes and manage your schedule</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => navigate('/classes/new')}
            className="rounded-xl h-11 px-6 shadow-lg shadow-[#00bc7d]/20 bg-[#00bc7d] hover:bg-[#00bc7d]/90 text-white"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00bc7d]/10 rounded-xl border border-[#00bc7d]/10">
              <CalendarIcon className="h-6 w-6 text-[#00bc7d]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Available Classes</h3>
              <p className="text-sm text-gray-500">Browse and book fitness classes</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00bc7d] transition-colors" />
              <Input
                placeholder="Search classes or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 h-11 bg-white focus:ring-2 focus:ring-[#00bc7d]/20 focus:border-[#00bc7d] transition-all shadow-sm w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200 h-11 bg-white focus:ring-2 focus:ring-[#00bc7d]/20 focus:border-[#00bc7d] shadow-sm">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
                <SelectItem value="Strength">Strength</SelectItem>
                <SelectItem value="Pilates">Pilates</SelectItem>
                <SelectItem value="Dance">Dance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Classes Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-500 py-5 pl-8 text-xs uppercase tracking-wider">Class</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Instructor</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Schedule</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Difficulty</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Availability</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-xs uppercase tracking-wider">Price</TableHead>
                <TableHead className="font-semibold text-gray-500 py-5 text-right pr-8 text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00bc7d]"></div>
                      <span className="mt-4 text-gray-500 font-medium">Loading classes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full border border-gray-100">
                        <CalendarIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No classes found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule, index) => {
                  const availableSpots = schedule.class.capacity - schedule.bookedCount;
                  const isFullyBooked = availableSpots === 0;

                  return (
                    <motion.tr
                      key={schedule.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-gray-50 hover:bg-[#00bc7d]/[0.02] transition-colors group"
                    >
                      <TableCell className="py-5 pl-8">
                        <div>
                          <div className="font-bold text-gray-900 text-base group-hover:text-[#00bc7d] transition-colors">{schedule.class.name}</div>
                          <div className="text-sm text-gray-500">
                            {schedule.class.duration} minutes
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-700">
                            {schedule.class.instructor.firstName} {schedule.class.instructor.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="text-sm">
                          <div className="flex items-center space-x-1 font-medium text-gray-900">
                            <Clock className="h-3.5 w-3.5 text-[#00bc7d]" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="text-gray-500 pl-4.5">
                            {schedule.date.toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{schedule.room.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge className={`${getDifficultyColor(schedule.class.difficulty)} border-0 px-3 py-1`}>
                          {schedule.class.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="space-y-1">
                          <Badge variant="outline" className={`${getAvailabilityColor(schedule)} border rounded-full px-3 py-1`}>
                            {availableSpots} spots left
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="font-bold text-gray-900">${schedule.class.price}</div>
                      </TableCell>
                      <TableCell className="py-5 text-right pr-8">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClass(schedule);
                            setIsBookingDialogOpen(true);
                          }}
                          disabled={isFullyBooked && !hasRole(UserRole.STAFF)}
                          className={`rounded-xl shadow-md transition-all ${isFullyBooked
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-[#00bc7d] hover:bg-[#00bc7d]/90 text-white shadow-[#00bc7d]/20'
                            }`}
                        >
                          {isFullyBooked ? 'Join Waitlist' : 'Book Now'}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Book Class</DialogTitle>
            <DialogDescription>
              Confirm your booking for {selectedClass?.class.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Class</Label>
                  <p>{selectedClass.class.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Instructor</Label>
                  <p>{selectedClass.class.instructor.firstName} {selectedClass.class.instructor.lastName}</p>
                </div>
                <div>
                  <Label className="font-medium">Date & Time</Label>
                  <p>{selectedClass.date.toLocaleDateString()} at {selectedClass.startTime}</p>
                </div>
                <div>
                  <Label className="font-medium">Duration</Label>
                  <p>{selectedClass.class.duration} minutes</p>
                </div>
                <div>
                  <Label className="font-medium">Location</Label>
                  <p>{selectedClass.room.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Price</Label>
                  <p>${selectedClass.class.price}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleBookClass(selectedClass)}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassBooking;