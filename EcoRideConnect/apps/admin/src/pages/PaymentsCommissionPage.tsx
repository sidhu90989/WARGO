import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  CreditCard, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Calendar, 
  Download, 
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  Wallet
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'ride_payment' | 'driver_payout' | 'refund' | 'commission' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  riderId?: string;
  driverId?: string;
  rideId?: string;
  description: string;
  paymentMethod: string;
}

interface DriverPayout {
  id: string;
  driverId: string;
  driverName: string;
  totalEarnings: number;
  commission: number;
  netPayout: number;
  ridesCompleted: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutDate: string;
  bankAccount: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  totalRefunds: number;
  netProfit: number;
  growthRate: number;
}

export default function PaymentsCommissionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Mock financial data
  const financialSummary: FinancialSummary = {
    totalRevenue: 125430.50,
    totalCommission: 25086.10,
    totalPayouts: 87801.85,
    pendingPayouts: 12642.55,
    totalRefunds: 3240.75,
    netProfit: 37388.65,
    growthRate: 15.8
  };

  // Mock transactions data
  const transactions: Transaction[] = [
    {
      id: "TXN-001",
      type: "ride_payment",
      amount: 25.50,
      status: "completed",
      date: "2024-01-15 14:30",
      riderId: "R001",
      driverId: "D001",
      rideId: "RIDE-001",
      description: "Downtown to Airport",
      paymentMethod: "Credit Card"
    },
    {
      id: "TXN-002",
      type: "driver_payout",
      amount: 380.75,
      status: "completed",
      date: "2024-01-15 12:00",
      driverId: "D002",
      description: "Weekly payout - Driver John Smith",
      paymentMethod: "Bank Transfer"
    },
    {
      id: "TXN-003",
      type: "refund",
      amount: 18.20,
      status: "completed",
      date: "2024-01-15 10:15",
      riderId: "R003",
      rideId: "RIDE-003",
      description: "Cancelled ride refund",
      paymentMethod: "Credit Card"
    },
    {
      id: "TXN-004",
      type: "commission",
      amount: 5.10,
      status: "completed",
      date: "2024-01-15 14:30",
      rideId: "RIDE-001",
      description: "20% commission from ride",
      paymentMethod: "Internal"
    },
    {
      id: "TXN-005",
      type: "bonus",
      amount: 15.00,
      status: "pending",
      date: "2024-01-15 16:45",
      driverId: "D001",
      description: "Eco-friendly driving bonus",
      paymentMethod: "Wallet Credit"
    }
  ];

  // Mock driver payouts data
  const driverPayouts: DriverPayout[] = [
    {
      id: "PAYOUT-001",
      driverId: "D001",
      driverName: "John Smith",
      totalEarnings: 485.30,
      commission: 97.06,
      netPayout: 388.24,
      ridesCompleted: 23,
      status: "completed",
      payoutDate: "2024-01-15",
      bankAccount: "****-1234"
    },
    {
      id: "PAYOUT-002",
      driverId: "D002",
      driverName: "Maria Garcia",
      totalEarnings: 562.15,
      commission: 112.43,
      netPayout: 449.72,
      ridesCompleted: 28,
      status: "processing",
      payoutDate: "2024-01-16",
      bankAccount: "****-5678"
    },
    {
      id: "PAYOUT-003",
      driverId: "D003",
      driverName: "Ahmed Hassan",
      totalEarnings: 325.80,
      commission: 65.16,
      netPayout: 260.64,
      ridesCompleted: 18,
      status: "pending",
      payoutDate: "2024-01-17",
      bankAccount: "****-9012"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      processing: "outline",
      failed: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ride_payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'driver_payout':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <ArrowRightLeft className="h-4 w-4 text-orange-500" />;
      case 'commission':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case 'bonus':
        return <Wallet className="h-4 w-4 text-emerald-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayouts = driverPayouts.filter(payout =>
    payout.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Commission</h1>
          <p className="text-muted-foreground">
            Manage transactions, payouts, and financial operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{financialSummary.growthRate}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.totalCommission.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((financialSummary.totalCommission / financialSummary.totalRevenue) * 100).toFixed(1)}% of total revenue
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Payouts</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.totalPayouts.toLocaleString()}</div>
            <div className="text-xs text-yellow-600">
              ${financialSummary.pendingPayouts.toLocaleString()} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.netProfit.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              After payouts & refunds
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commission Breakdown</CardTitle>
          <CardDescription>Revenue distribution across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Driver Earnings (70%)</span>
              <span className="text-sm font-medium">${(financialSummary.totalRevenue * 0.7).toLocaleString()}</span>
            </div>
            <Progress value={70} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Platform Commission (20%)</span>
              <span className="text-sm font-medium">${(financialSummary.totalRevenue * 0.2).toLocaleString()}</span>
            </div>
            <Progress value={20} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Processing Fees (5%)</span>
              <span className="text-sm font-medium">${(financialSummary.totalRevenue * 0.05).toLocaleString()}</span>
            </div>
            <Progress value={5} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Refunds & Adjustments (5%)</span>
              <span className="text-sm font-medium">${(financialSummary.totalRevenue * 0.05).toLocaleString()}</span>
            </div>
            <Progress value={5} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Driver Payouts</TabsTrigger>
          <TabsTrigger value="refunds">Refunds & Adjustments</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Track all payment activities and financial transactions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{txn.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(txn.type)}
                          <span className="capitalize">{txn.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>${txn.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell className="truncate max-w-[240px]" title={txn.description}>{txn.description}</TableCell>
                      <TableCell>{txn.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Refund</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
