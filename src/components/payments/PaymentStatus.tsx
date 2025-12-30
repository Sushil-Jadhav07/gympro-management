import React, { useState, useEffect } from 'react';
import { Member, Payment, PaymentStatus as PaymentStatusType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  CreditCard,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

const PaymentStatus: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: '1',
        memberId: '1',
        amount: 59.99,
        status: PaymentStatusType.COMPLETED,
        paymentDate: new Date('2024-08-01'),
        dueDate: new Date('2024-08-01'),
        method: 'Credit Card',
        description: 'Monthly Membership - Gym + Cardio',
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-01')
      },
      {
        id: '2',
        memberId: '2',
        amount: 39.99,
        status: PaymentStatusType.OVERDUE,
        paymentDate: null,
        dueDate: new Date('2024-07-15'),
        method: 'Credit Card',
        description: 'Monthly Membership - Gym',
        createdAt: new Date('2024-07-15'),
        updatedAt: new Date('2024-07-15')
      },
      {
        id: '3',
        memberId: '3',
        amount: 89.99,
        status: PaymentStatusType.PENDING,
        paymentDate: null,
        dueDate: new Date('2024-09-01'),
        method: 'Bank Transfer',
        description: 'Monthly Membership - Full Package',
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-08-15')
      }
    ];

    const mockMembers: Member[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        membershipType: 'Gym + Cardio',
        isActive: true
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@email.com',
        membershipType: 'Gym',
        isActive: true
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        membershipType: 'Gym + Cardio + Crossfit',
        isActive: true
      }
    ] as Member[];

    setPayments(mockPayments);
    setMembers(mockMembers);
  }, []);

  const getStatusColor = (status: PaymentStatusType) => {
    switch (status) {
      case PaymentStatusType.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case PaymentStatusType.PENDING:
        return 'bg-indigo-100 text-indigo-800';
      case PaymentStatusType.OVERDUE:
        return 'bg-violet-100 text-violet-800';
      case PaymentStatusType.FAILED:
        return 'bg-blue-300 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PaymentStatusType) => {
    switch (status) {
      case PaymentStatusType.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case PaymentStatusType.PENDING:
        return <Clock className="h-4 w-4" />;
      case PaymentStatusType.OVERDUE:
        return <AlertTriangle className="h-4 w-4" />;
      case PaymentStatusType.FAILED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown Member';
  };

  const getMemberEmail = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.email : '';
  };

  const filteredPayments = payments.filter(payment => {
    const memberName = getMemberName(payment.memberId).toLowerCase();
    const memberEmail = getMemberEmail(payment.memberId).toLowerCase();
    
    const matchesSearch = 
      memberName.includes(searchTerm.toLowerCase()) ||
      memberEmail.includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === PaymentStatusType.COMPLETED).length,
    pendingPayments: payments.filter(p => p.status === PaymentStatusType.PENDING).length,
    overduePayments: payments.filter(p => p.status === PaymentStatusType.OVERDUE).length,
    totalRevenue: payments
      .filter(p => p.status === PaymentStatusType.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0)
  };

  const processPayment = (paymentId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: PaymentStatusType.COMPLETED, 
            paymentDate: new Date(),
            updatedAt: new Date()
          }
        : payment
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Status Dashboard</h2>
          <p className="text-muted-foreground">Monitor all member payment statuses and transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completedPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">{stats.overduePayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status Overview</CardTitle>
          <CardDescription>
            Track and manage all member payment statuses
          </CardDescription>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={PaymentStatusType.COMPLETED}>Completed</SelectItem>
                <SelectItem value={PaymentStatusType.PENDING}>Pending</SelectItem>
                <SelectItem value={PaymentStatusType.OVERDUE}>Overdue</SelectItem>
                <SelectItem value={PaymentStatusType.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {getMemberName(payment.memberId).split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{getMemberName(payment.memberId)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getMemberEmail(payment.memberId)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.description}</div>
                      <div className="text-sm text-muted-foreground">{payment.method}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${payment.amount.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {payment.dueDate.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payment.status)}
                        <span>{payment.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {payment.paymentDate ? payment.paymentDate.toLocaleDateString() : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {payment.status === PaymentStatusType.PENDING && (
                        <Button 
                          size="sm" 
                          onClick={() => processPayment(payment.id)}
                        >
                          Process Payment
                        </Button>
                      )}
                      {payment.status === PaymentStatusType.OVERDUE && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => processPayment(payment.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatus;