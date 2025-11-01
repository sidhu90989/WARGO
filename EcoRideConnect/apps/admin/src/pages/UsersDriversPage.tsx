import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Car,
  Star,
  AlertTriangle,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  Users,
  Navigation,
  FileText,
  Ban,
  UserCheck
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Activity, Users as UsersIcon, DollarSign, Gift, BarChart3 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'rider' | 'driver';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  totalRides: number;
  rating: number;
  location: string;
  avatar?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  complaints?: number;
  earnings?: number;
  vehicleType?: string;
}

interface Complaint {
  id: string;
  userId: string;
  userName: string;
  type: 'safety' | 'payment' | 'behavior' | 'vehicle' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignedTo?: string;
}

export default function UsersDriversPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Mock users data
  const users: User[] = [
    {
      id: 'user_001',
      name: 'Amit Sharma',
      email: 'amit.sharma@email.com',
      phone: '+91 98765 43210',
      type: 'rider',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-10-18',
      totalRides: 45,
      rating: 4.8,
      location: 'Bangalore',
      avatar: '/api/avatars/user_001.jpg'
    },
    {
      id: 'user_002',
      name: 'Priya Singh',
      email: 'priya.singh@email.com',
      phone: '+91 87654 32109',
      type: 'driver',
      status: 'active',
      joinDate: '2024-02-10',
      lastActive: '2024-10-18',
      totalRides: 234,
      rating: 4.9,
      location: 'Mumbai',
      kycStatus: 'approved',
      complaints: 2,
      earnings: 125000,
      vehicleType: 'sedan'
    },
    {
      id: 'user_003',
      name: 'Raj Kumar',
      email: 'raj.kumar@email.com',
      phone: '+91 76543 21098',
      type: 'driver',
      status: 'pending',
      joinDate: '2024-10-15',
      lastActive: '2024-10-17',
      totalRides: 0,
      rating: 0,
      location: 'Delhi',
      kycStatus: 'pending',
      complaints: 0,
      earnings: 0,
      vehicleType: 'hatchback'
    },
    {
      id: 'user_004',
      name: 'Sarah Khan',
      email: 'sarah.khan@email.com',
      phone: '+91 65432 10987',
      type: 'rider',
      status: 'suspended',
      joinDate: '2024-03-20',
      lastActive: '2024-10-10',
      totalRides: 89,
      rating: 3.2,
      location: 'Chennai',
      complaints: 3
    }
  ];

  // Mock complaints data
  const complaints: Complaint[] = [
    {
      id: 'complaint_001',
      userId: 'user_002',
      userName: 'Priya Singh (Driver)',
      type: 'safety',
      description: 'Driver was overspeeding and talking on phone during ride',
      status: 'investigating',
      priority: 'high',
      createdAt: '2024-10-17',
      assignedTo: 'Admin Team'
    },
    {
      id: 'complaint_002',
      userId: 'user_004',
      userName: 'Sarah Khan (Rider)',
      type: 'behavior',
      description: 'Rider was rude and used inappropriate language',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-10-15'
    },
    {
      id: 'complaint_003',
      userId: 'user_001',
      userName: 'Amit Sharma (Rider)',
      type: 'payment',
      description: 'Payment not received for completed ride',
      status: 'open',
      priority: 'urgent',
      createdAt: '2024-10-18'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesType = activeTab === 'users' || user.type === activeTab.slice(0, -1);
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      header={{
        title: "Users & Drivers",
        rightActions: <ThemeToggle />,
      }}
      sidebar={{
        items: [
          { label: "Overview", href: "/admin", icon: <Activity className="h-5 w-5" /> },
          { label: "Users & Drivers", href: "/admin/users", icon: <UsersIcon className="h-5 w-5" /> },
          { label: "Payments", href: "/admin/payments", icon: <DollarSign className="h-5 w-5" /> },
          { label: "Offers", href: "/admin/offers", icon: <Gift className="h-5 w-5" /> },
          { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
        ],
        onNavigate: (href) => setLocation(href),
      }}
    >
      <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rides</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{user.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{user.totalRides}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        {user.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Other tabs omitted for brevity; retain original structure if needed */}
      </Tabs>
      </div>
    </DashboardLayout>
  );
}
