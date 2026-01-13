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


  // Mock data
  useEffect(() => {
    const mockClasses: Class[] = [
      {
        id: '1',
        name: 'Morning Yoga',
        description: 'Start your day with relaxing yoga',
        instructorId: '3',
        instructor: {
          id: '3',
          email: 'trainer@gym.com',
          firstName: 'Sarah',
          lastName: 'Wilson',
          role: UserRole.TRAINER,
          employeeId: 'EMP003',
          position: 'Yoga Instructor',
          department: 'Fitness',
          hireDate: new Date('2023-01-15'),
          salary: 45000,
          schedule: [],
          certifications: ['RYT-200', 'Prenatal Yoga'],
          specializations: ['Hatha Yoga', 'Vinyasa'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        capacity: 20,
        duration: 60,
        price: 15,
        category: 'Yoga',
        difficulty: 'Beginner',
        equipment: ['Yoga Mat', 'Blocks'],
        isActive: true
      },
      {
        id: '2',
        name: 'HIIT Training',
        description: 'High-intensity interval training',
        instructorId: '4',
        instructor: {
          id: '4',
          email: 'mike.trainer@gym.com',
          firstName: 'Mike',
          lastName: 'Johnson',
          role: UserRole.TRAINER,
          employeeId: 'EMP004',
          position: 'Fitness Trainer',
          department: 'Fitness',
          hireDate: new Date('2023-03-01'),
          salary: 50000,
          schedule: [],
          certifications: ['NASM-CPT', 'HIIT Specialist'],
          specializations: ['HIIT', 'Strength Training'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        capacity: 15,
        duration: 45,
        price: 20,
        category: 'Cardio',
        difficulty: 'Advanced',
        equipment: ['Kettlebells', 'Battle Ropes'],
        isActive: true
      },
      {
        id: '3',
        name: 'Strength Training',
        description: 'Build muscle and strength',
        instructorId: '5',
        instructor: {
          id: '5',
          email: 'lisa.trainer@gym.com',
          firstName: 'Lisa',
          lastName: 'Davis',
          role: UserRole.TRAINER,
          employeeId: 'EMP005',
          position: 'Strength Coach',
          department: 'Fitness',
          hireDate: new Date('2022-11-01'),
          salary: 55000,
          schedule: [],
          certifications: ['CSCS', 'Powerlifting Coach'],
          specializations: ['Powerlifting', 'Olympic Lifting'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        capacity: 12,
        duration: 75,
        price: 25,
        category: 'Strength',
        difficulty: 'Intermediate',
        equipment: ['Barbells', 'Dumbbells', 'Squat Rack'],
        isActive: true
      },
      {
        id: '4',
        name: 'Pilates',
        description: 'Core strengthening and flexibility',
        instructorId: '6',
        instructor: {
          id: '6',
          email: 'emma.trainer@gym.com',
          firstName: 'Emma',
          lastName: 'Brown',
          role: UserRole.TRAINER,
          employeeId: 'EMP006',
          position: 'Pilates Instructor',
          department: 'Fitness',
          hireDate: new Date('2023-02-01'),
          salary: 42000,
          schedule: [],
          certifications: ['PMA-CPT', 'Mat Pilates'],
          specializations: ['Classical Pilates', 'Reformer'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        capacity: 15,
        duration: 50,
        price: 18,
        category: 'Pilates',
        difficulty: 'Beginner',
        equipment: ['Pilates Mat', 'Resistance Bands'],
        isActive: true
      }
    ];

    const mockSchedules: ClassSchedule[] = [
      {
        id: '1',
        classId: '1',
        class: mockClasses[0],
        date: new Date(),
        startTime: '07:00',
        endTime: '08:00',
        roomId: '1',
        room: {
          id: '1',
          name: 'Studio A',
          capacity: 25,
          equipment: ['Sound System', 'Mirrors', 'Yoga Mats'],
          amenities: ['Air Conditioning', 'Water Fountain'],
          isActive: true
        },
        bookedCount: 12,
        waitlistCount: 2,
        status: 'scheduled'
      },
      {
        id: '2',
        classId: '2',
        class: mockClasses[1],
        date: new Date(),
        startTime: '18:00',
        endTime: '18:45',
        roomId: '2',
        room: {
          id: '2',
          name: 'Fitness Room',
          capacity: 20,
          equipment: ['Kettlebells', 'Battle Ropes', 'TRX'],
          amenities: ['Air Conditioning', 'Sound System'],
          isActive: true
        },
        bookedCount: 15,
        waitlistCount: 0,
        status: 'scheduled'
      },
      {
        id: '3',
        classId: '3',
        class: mockClasses[2],
        date: new Date(),
        startTime: '19:00',
        endTime: '20:15',
        roomId: '3',
        room: {
          id: '3',
          name: 'Weight Room',
          capacity: 15,
          equipment: ['Free Weights', 'Machines', 'Benches'],
          amenities: ['Air Conditioning', 'Towel Service'],
          isActive: true
        },
        bookedCount: 8,
        waitlistCount: 0,
        status: 'scheduled'
      },
      {
        id: '4',
        classId: '4',
        class: mockClasses[3],
        date: new Date(),
        startTime: '10:00',
        endTime: '10:50',
        roomId: '1',
        room: {
          id: '1',
          name: 'Studio A',
          capacity: 25,
          equipment: ['Sound System', 'Mirrors', 'Yoga Mats'],
          amenities: ['Air Conditioning', 'Water Fountain'],
          isActive: true
        },
        bookedCount: 10,
        waitlistCount: 1,
        status: 'scheduled'
      }
    ];

    setClasses(mockClasses);
    setClassSchedules(mockSchedules);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Intermediate':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
      case 'Advanced':
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getAvailabilityColor = (schedule: ClassSchedule) => {
    const availableSpots = schedule.class.capacity - schedule.bookedCount;
    if (availableSpots === 0) return 'bg-blue-300/10 text-blue-600 border-blue-200';
    if (availableSpots <= 3) return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
    return 'bg-blue-500/10 text-blue-700 border-blue-200';
  };

  const handleBookClass = (schedule: ClassSchedule) => {
    if (!user) return;
    
    console.log('Booking class:', schedule.class.name, 'for user:', user.email);
    setIsBookingDialogOpen(false);
    
    // Update local state to reflect the booking
    setClassSchedules(prev => prev.map(s => 
      s.id === schedule.id 
        ? { ...s, bookedCount: s.bookedCount + 1 }
        : s
    ));
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