import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, Class, ClassSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowLeft, 
  Dumbbell, 
  Users, 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Sparkles,
  Tag,
  User,
  Layers
} from 'lucide-react';

const ClassCreate: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructorId: '3', // Default to a trainer for now
    duration: '60',
    capacity: '20',
    category: '',
    difficulty: 'Beginner',
    price: '15',
    equipment: [] as string[],
    startTime: '',
    endTime: '',
    roomId: '1'
  });

  const [equipmentInput, setEquipmentInput] = useState('');

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

  const handleAddEquipment = () => {
    if (equipmentInput.trim() && !formData.equipment.includes(equipmentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipmentInput.trim()]
      }));
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Creating class...',
        success: () => {
          navigate('/dashboard?tab=classes');
          return 'Class created successfully!';
        },
        error: 'Failed to create class'
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]'}`}>
        <Topbar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <Button 
                  variant="ghost" 
                  className="mb-4 pl-0 hover:bg-transparent hover:text-violet-600 transition-colors"
                  onClick={() => navigate('/dashboard?tab=classes')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Classes
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  Create New Class
                </h1>
                <p className="text-muted-foreground mt-1 ml-14">
                  Set up a new fitness class, schedule, and capacity.
                </p>
              </div>
            </motion.div>

            <motion.form 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Basic Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-violet-600" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Basic Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="name">Class Name</Label>
                          <Input 
                            id="name" 
                            placeholder="e.g. Morning Yoga Flow" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData({...formData, category: value})}
                          >
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yoga">Yoga</SelectItem>
                              <SelectItem value="Cardio">Cardio</SelectItem>
                              <SelectItem value="Strength">Strength</SelectItem>
                              <SelectItem value="Pilates">Pilates</SelectItem>
                              <SelectItem value="Dance">Dance</SelectItem>
                              <SelectItem value="HIIT">HIIT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select 
                            value={formData.difficulty} 
                            onValueChange={(value) => setFormData({...formData, difficulty: value})}
                          >
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Describe what members can expect..." 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="min-h-[100px] bg-gray-50/50 border-gray-200 focus:bg-white transition-all resize-none"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Class Details */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-violet-600" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Class Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacity (People)</Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              id="capacity" 
                              type="number"
                              value={formData.capacity}
                              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                              className="pl-10 h-11 bg-gray-50/50 border-gray-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (Minutes)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              id="duration" 
                              type="number"
                              value={formData.duration}
                              onChange={(e) => setFormData({...formData, duration: e.target.value})}
                              className="pl-10 h-11 bg-gray-50/50 border-gray-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              id="price" 
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                              className="pl-10 h-11 bg-gray-50/50 border-gray-200"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Equipment Needed</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={equipmentInput}
                            onChange={(e) => setEquipmentInput(e.target.value)}
                            placeholder="Add equipment (e.g. Yoga Mat)"
                            className="h-11 bg-gray-50/50 border-gray-200"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddEquipment();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddEquipment}
                            variant="secondary"
                            className="h-11 px-6"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.equipment.map((item, index) => (
                            <div 
                              key={index}
                              className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-violet-100"
                            >
                              {item}
                              <button 
                                type="button"
                                onClick={() => handleRemoveEquipment(item)}
                                className="hover:text-violet-900"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Column - Schedule & Summary */}
              <div className="space-y-8">
                
                {/* Schedule Card */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-lg bg-white overflow-hidden h-full">
                    <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white pb-6">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        <CardTitle className="text-lg text-white">Schedule</CardTitle>
                      </div>
                      <CardDescription className="text-violet-100">Set the time and location</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input 
                          id="startTime" 
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="h-11 bg-gray-50/50 border-gray-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input 
                          id="endTime" 
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          className="h-11 bg-gray-50/50 border-gray-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="roomId">Room / Location</Label>
                        <Select 
                          value={formData.roomId} 
                          onValueChange={(value) => setFormData({...formData, roomId: value})}
                        >
                          <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                            <SelectValue placeholder="Select Room" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Studio A (Capacity: 25)</SelectItem>
                            <SelectItem value="2">Fitness Room (Capacity: 20)</SelectItem>
                            <SelectItem value="3">Weight Room (Capacity: 15)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Select 
                          value={formData.instructorId} 
                          onValueChange={(value) => setFormData({...formData, instructorId: value})}
                        >
                          <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                            <SelectValue placeholder="Select Instructor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">Sarah Wilson (Yoga)</SelectItem>
                            <SelectItem value="4">Mike Johnson (HIIT)</SelectItem>
                            <SelectItem value="5">Lisa Davis (Strength)</SelectItem>
                            <SelectItem value="6">Emma Brown (Pilates)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Summary / Actions */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 bg-gray-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500">Total Capacity</span>
                        <span className="text-lg font-bold text-gray-900">{formData.capacity || 0}</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-medium text-gray-500">Est. Duration</span>
                        <span className="text-lg font-bold text-gray-900">{formData.duration || 0} min</span>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-semibold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20"
                      >
                        Create Class
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassCreate;
