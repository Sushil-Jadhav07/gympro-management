import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Payment, PaymentType, PaymentMethod, PaymentStatus, Invoice, PromoCode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Send,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PaymentStatusComponent from './PaymentStatus';

const PaymentSystem: React.FC = () => {
  const { hasRole } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: '1',
        memberId: '1',
        amount: 79.99,
        currency: 'USD',
        type: PaymentType.MEMBERSHIP,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.COMPLETED,
        description: 'Premium Membership - January 2024',
        transactionId: 'txn_1234567890',
        invoiceId: 'INV-001',
        paidDate: new Date('2024-01-15'),
        dueDate: new Date('2024-01-15')
      },
      {
        id: '2',
        memberId: '2',
        amount: 20.00,
        currency: 'USD',
        type: PaymentType.CLASS,
        method: PaymentMethod.PAYPAL,
        status: PaymentStatus.COMPLETED,
        description: 'HIIT Training Class',
        transactionId: 'pp_9876543210',
        paidDate: new Date('2024-01-18')
      },
      {
        id: '3',
        memberId: '3',
        amount: 129.99,
        currency: 'USD',
        type: PaymentType.MEMBERSHIP,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
        description: 'VIP Membership - January 2024',
        dueDate: new Date('2024-01-20')
      },
      {
        id: '4',
        memberId: '1',
        amount: 15.00,
        currency: 'USD',
        type: PaymentType.CLASS,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.FAILED,
        description: 'Yoga Class',
        dueDate: new Date('2024-01-19')
      },
      {
        id: '5',
        memberId: '2',
        amount: 49.99,
        currency: 'USD',
        type: PaymentType.MEMBERSHIP,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.OVERDUE,
        description: 'Basic Membership - February 2024',
        dueDate: new Date('2024-01-10')
      }
    ];

    const mockPromoCodes: PromoCode[] = [
      {
        id: '1',
        code: 'NEWYEAR2024',
        description: 'New Year Special - 20% off',
        type: 'percentage',
        value: 20,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-01-31'),
        usageLimit: 100,
        usedCount: 45,
        isActive: true,
        applicableServices: ['membership', 'class']
      },
      {
        id: '2',
        code: 'FIRST10',
        description: '$10 off first payment',
        type: 'fixed',
        value: 10,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        usageLimit: 500,
        usedCount: 123,
        isActive: true,
        applicableServices: ['membership']
      }
    ];

    setPayments(mockPayments);
    setPromoCodes(mockPromoCodes);
  }, []);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case PaymentStatus.PENDING:
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
      case PaymentStatus.FAILED:
        return 'bg-blue-300/10 text-blue-600 border-blue-200';
      case PaymentStatus.OVERDUE:
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      case PaymentStatus.REFUNDED:
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
      case PaymentStatus.CANCELLED:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case PaymentStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case PaymentStatus.FAILED:
      case PaymentStatus.OVERDUE:
        return <XCircle className="h-4 w-4" />;
      case PaymentStatus.REFUNDED:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.STRIPE:
        return 'bg-violet-500/10 text-violet-700 border-violet-200';
      case PaymentMethod.PAYPAL:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case PaymentMethod.CASH:
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
      case PaymentMethod.BANK_TRANSFER:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const ProcessPaymentForm = () => {
    const [formData, setFormData] = useState({
      memberId: '',
      amount: '',
      type: PaymentType.MEMBERSHIP,
      method: PaymentMethod.STRIPE,
      description: '',
      promoCode: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Processing payment:', formData);
      
      // Create new payment record
      const newPayment: Payment = {
        id: Date.now().toString(),
        memberId: formData.memberId,
        amount: parseFloat(formData.amount),
        currency: 'USD',
        type: formData.type,
        method: formData.method,
        status: PaymentStatus.COMPLETED,
        description: formData.description,
        transactionId: `txn_${Date.now()}`,
        paidDate: new Date(),
        dueDate: new Date()
      };

      setPayments(prev => [newPayment, ...prev]);
      setIsPaymentDialogOpen(false);
      
      // Reset form
      setFormData({
        memberId: '',
        amount: '',
        type: PaymentType.MEMBERSHIP,
        method: PaymentMethod.STRIPE,
        description: '',
        promoCode: ''
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="memberId">Member ID</Label>
            <Input
              id="memberId"
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              placeholder="Enter member ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Payment Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as PaymentType })}>
              <SelectTrigger>
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
            <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value as PaymentMethod })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentMethod.STRIPE}>Stripe</SelectItem>
                <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Payment description"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promoCode">Promo Code (Optional)</Label>
          <Input
            id="promoCode"
            value={formData.promoCode}
            onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
            placeholder="Enter promo code"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Process Payment</Button>
        </div>
      </form>
    );
  };

  const CreatePromoCodeForm = () => {
    const [formData, setFormData] = useState({
      code: '',
      description: '',
      type: 'percentage' as 'percentage' | 'fixed',
      value: '',
      validFrom: '',
      validTo: '',
      usageLimit: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Creating promo code:', formData);
      
      const newPromoCode: PromoCode = {
        id: Date.now().toString(),
        code: formData.code,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usedCount: 0,
        isActive: true,
        applicableServices: ['membership', 'class']
      };

      setPromoCodes(prev => [newPromoCode, ...prev]);
      setIsPromoDialogOpen(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Promo Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="PROMO2024"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Discount Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'percentage' | 'fixed' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Special discount for new members"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="value">
              {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
            </Label>
            <Input
              id="value"
              type="number"
              step={formData.type === 'percentage' ? '1' : '0.01'}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={formData.type === 'percentage' ? '20' : '10.00'}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validFrom">Valid From</Label>
            <Input
              id="validFrom"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validTo">Valid To</Label>
            <Input
              id="validTo"
              type="date"
              value={formData.validTo}
              onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage Limit</Label>
          <Input
            id="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            placeholder="100"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsPromoDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create Promo Code</Button>
        </div>
      </form>
    );
  };

  const stats = {
    totalRevenue: payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0),
    completedPayments: payments.filter(p => p.status === PaymentStatus.COMPLETED).length,
    pendingPayments: payments.filter(p => p.status === PaymentStatus.PENDING).length,
    overduePayments: payments.filter(p => p.status === PaymentStatus.OVERDUE).length,
    failedPayments: payments.filter(p => p.status === PaymentStatus.FAILED).length
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet-600" />
            Payment System
          </h2>
          <p className="text-muted-foreground">Manage payments, invoices, and promo codes</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-full border-2 h-11 px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Promo Code
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Promo Code</DialogTitle>
                <DialogDescription>
                  Create a new promotional discount code
                </DialogDescription>
              </DialogHeader>
              <CreatePromoCodeForm />
            </DialogContent>
          </Dialog>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Process Payment
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Process Payment</DialogTitle>
                <DialogDescription>
                  Process a new payment for a member
                </DialogDescription>
              </DialogHeader>
              <ProcessPaymentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, gradient: 'from-blue-500 to-indigo-500', delay: 0.1 },
          { label: 'Completed', value: stats.completedPayments, icon: CheckCircle, gradient: 'from-blue-500 to-cyan-500', delay: 0.2 },
          { label: 'Pending', value: stats.pendingPayments, icon: Clock, gradient: 'from-indigo-500 to-blue-500', delay: 0.3 },
          { label: 'Overdue', value: stats.overduePayments, icon: AlertCircle, gradient: 'from-violet-500 to-indigo-500', delay: 0.4 },
          { label: 'Failed', value: stats.failedPayments, icon: XCircle, gradient: 'from-blue-300 to-blue-500', delay: 0.5 },
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

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Payment Status</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <PaymentStatusComponent />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={PaymentStatus.OVERDUE}>Overdue</SelectItem>
                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                    <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionId || 'N/A'}
                      </TableCell>
                      <TableCell>{payment.memberId}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="font-medium">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getMethodColor(payment.method)}>
                          {payment.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.paidDate?.toLocaleDateString() || payment.dueDate?.toLocaleDateString() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage and send invoices to members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
                <p className="text-sm">Invoices will appear here when created</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promo-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Codes</CardTitle>
              <CardDescription>Manage discount codes and promotions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promoCodes.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {promo.code}
                        </code>
                        <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {promo.type === 'percentage' ? `${promo.value}% off` : `$${promo.value} off`} • 
                        Used {promo.usedCount}/{promo.usageLimit || '∞'} times • 
                        Valid until {promo.validTo.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSystem;