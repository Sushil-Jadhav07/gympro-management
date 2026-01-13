import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { PaymentType, PaymentMethod, PaymentStatus, Payment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  User, 
  Tag, 
  FileText, 
  CheckCircle2,
  Receipt
} from 'lucide-react';

const PaymentCreate: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    type: PaymentType.MEMBERSHIP,
    method: PaymentMethod.STRIPE,
    description: '',
    promoCode: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Processing payment...',
        success: () => {
          navigate('/dashboard?tab=payments');
          return 'Payment processed successfully!';
        },
        error: 'Failed to process payment'
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
                  onClick={() => navigate('/dashboard?tab=payments')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Payments
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
                    <Receipt className="h-6 w-6" />
                  </div>
                  Process Payment
                </h1>
                <p className="text-muted-foreground mt-1 ml-14">
                  Record a new transaction for a member.
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
                
                {/* Transaction Details */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-violet-500" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Transaction Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="memberId">Member ID</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            id="memberId" 
                            placeholder="Enter member ID or search..."
                            value={formData.memberId}
                            onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="type">Payment Type</Label>
                          <Select 
                            value={formData.type} 
                            onValueChange={(value) => setFormData({...formData, type: value as PaymentType})}
                          >
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PaymentType.MEMBERSHIP}>Membership</SelectItem>
                              <SelectItem value={PaymentType.CLASS}>Class</SelectItem>
                              <SelectItem value={PaymentType.PERSONAL_TRAINING}>Personal Training</SelectItem>
                              <SelectItem value={PaymentType.EQUIPMENT_RENTAL}>Equipment Rental</SelectItem>
                              <SelectItem value={PaymentType.LATE_FEE}>Late Fee</SelectItem>
                              <SelectItem value={PaymentType.OTHER}>Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="method">Payment Method</Label>
                          <Select 
                            value={formData.method} 
                            onValueChange={(value) => setFormData({...formData, method: value as PaymentMethod})}
                          >
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PaymentMethod.STRIPE}>Stripe (Credit Card)</SelectItem>
                              <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
                              <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                              <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea 
                            id="description" 
                            placeholder="Add details about this payment..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="pl-10 min-h-[80px] bg-gray-50/50 border-gray-200 resize-none"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Additional Info */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-emerald-600" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Discounts & Promo</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                        <Input 
                          id="promoCode" 
                          placeholder="e.g. SUMMER2024"
                          value={formData.promoCode}
                          onChange={(e) => setFormData({...formData, promoCode: e.target.value})}
                          className="h-11 bg-gray-50/50 border-gray-200"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter a valid promo code to apply discount automatically.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Column - Amount & Summary */}
              <div className="space-y-8">
                
                {/* Amount Card */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-lg bg-white overflow-hidden h-full">
                    <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pb-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <CardTitle className="text-lg text-white">Total Amount</CardTitle>
                      </div>
                      <CardDescription className="text-emerald-100">Enter payment amount</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="sr-only">Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
                          <Input 
                            id="amount" 
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="pl-14 h-20 text-4xl font-bold bg-gray-50 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-emerald-700">Subtotal</span>
                          <span className="font-semibold text-emerald-900">${formData.amount || '0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-emerald-700">Tax (0%)</span>
                          <span className="font-semibold text-emerald-900">$0.00</span>
                        </div>
                        <div className="border-t border-emerald-200 my-2 pt-2 flex justify-between items-center">
                          <span className="font-bold text-emerald-900">Total</span>
                          <span className="font-bold text-xl text-emerald-900">${formData.amount || '0.00'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Summary / Actions */}
                <motion.div variants={itemVariants}>
                  <Card className="border-0 shadow-sm ring-1 ring-gray-100 bg-gray-50/50">
                    <CardContent className="p-6">
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                      >
                        Process Payment
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

export default PaymentCreate;
