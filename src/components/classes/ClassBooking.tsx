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
        
        // 1. Fetch Classes with Instructor details
        // We'll fetch classes first
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*');
          
        if (classesError) throw classesError;
        
        // For instructors, we need to fetch them from users/staff table
        // We'll collect all instructor IDs
        const instructorIds = [...new Set(classesData.map((c: any) => c.instructor_id))];
        
        const { data: instructorsData, error: instructorsError } = await supabase
          .from('staff') // Assuming instructors are in staff table
          .select('*')
          .in('id', instructorIds);
          
        if (instructorsError) {
           console.warn('Could not fetch instructors', instructorsError);
        }
        
        const instructorsMap = new Map(instructorsData?.map((i: any) => [i.id, i]) || []);

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
            } : undefined,
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

        // 2. Fetch Rooms (Skipped as table 'rooms' does not exist yet)
        // We will use the fallback mock data logic below
        const roomsData: any[] = [];
        const roomsMap = new Map();

        /* 
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*');
          
        const roomsMap = new Map(roomsData?.map((r: any) => [r.id, r]) || []);
        */

        // 3. Fetch Class Schedules
        const { data: schedulesData, error: schedulesError } = await supabase
          .from('class_schedules')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0]); // Only future/today schedules

        if (schedulesError) throw schedulesError;

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet-600" />
            Class Booking
          </h2>
          <p className="text-muted-foreground">Book fitness classes and manage your schedule</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => navigate('/classes/new')}
            className="rounded-full h-11 px-6 shadow-lg"
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
        className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden"
      >
        <CardHeader className="bg-gradient-to-r from-white/80 to-white/40 border-b border-border/40">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-violet-600" />
            Available Classes
          </CardTitle>
          <CardDescription>Browse and book fitness classes</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search classes or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-2 h-11 bg-white/50"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 rounded-full border-2 h-11 bg-white/50">
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

          {/* Classes Table */}
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50/50 to-white/50">
                <TableRow className="border-border/40">
                  <TableHead className="font-semibold">Class</TableHead>
                  <TableHead className="font-semibold">Instructor</TableHead>
                  <TableHead className="font-semibold">Schedule</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Difficulty</TableHead>
                  <TableHead className="font-semibold">Availability</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule, index) => {
                  const availableSpots = schedule.class.capacity - schedule.bookedCount;
                  const isFullyBooked = availableSpots === 0;

                  return (
                    <motion.tr
                      key={schedule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-border/40 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-blue-50/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.class.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.class.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.class.duration} minutes
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {schedule.class.instructor.firstName} {schedule.class.instructor.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {schedule.date.toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{schedule.room.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getDifficultyColor(schedule.class.difficulty)} border rounded-full px-3 py-1`}>
                          {schedule.class.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={`${getAvailabilityColor(schedule)} border rounded-full px-3 py-1`}>
                            {availableSpots} spots left
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{schedule.bookedCount}/{schedule.class.capacity}</span>
                            {schedule.waitlistCount > 0 && (
                              <span>(+{schedule.waitlistCount} waitlist)</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${schedule.class.price}</div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClass(schedule);
                            setIsBookingDialogOpen(true);
                          }}
                          disabled={isFullyBooked && !hasRole(UserRole.STAFF)}
                          className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-50"
                        >
                          {isFullyBooked ? 'Join Waitlist' : 'Book Now'}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
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