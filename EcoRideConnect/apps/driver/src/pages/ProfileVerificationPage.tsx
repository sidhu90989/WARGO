import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowLeft,
  User,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Shield,
  Car,
  FileText,
  IdCard,
  Award,
  Edit3,
  Save,
  Eye,
  Trash2,
  Plus,
  CreditCard,
  BookOpen,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ProfileVerificationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Mock driver profile data
  const driverProfile = {
    personalInfo: {
      fullName: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@email.com",
      address: "123, HSR Layout, Bangalore - 560102",
      dateOfBirth: "1985-06-15",
      emergencyContact: "+91 98765 43211",
      languages: ["English", "Hindi", "Kannada"]
    },
    verification: {
      photo: { status: 'approved' },
      license: { status: 'approved', number: 'KA03 20220012345', expiryDate: '2027-06-15' },
      rc: { status: 'pending', number: 'KA03 MZ 1234' },
      aadhar: { status: 'approved', number: '1234 5678 9012' }
    },
    vehicle: {
      type: 'sedan',
      make: 'Maruti Suzuki',
      model: 'Dzire',
      year: 2021,
      plateNumber: 'KA03 MZ 1234',
      color: 'White',
      ecoRating: 4.2,
      fuelType: 'petrol',
      images: ['/api/uploads/car1.jpg', '/api/uploads/car2.jpg']
    },
    safety: {
      trainingCompleted: true,
      trainingScore: 87,
      lastTrainingDate: '2024-01-15',
      emergencyTraining: true,
      firstAidCertified: false
    },
    performance: {
      rating: 4.8,
      totalRides: 842,
      totalEarnings: 125800,
      acceptanceRate: 92,
      cancellationRate: 3
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateVerificationProgress = () => {
    const items = Object.values(driverProfile.verification);
    const approved = items.filter((item: any) => item.status === 'approved').length;
    return (approved / items.length) * 100;
  };

  const handleFileUpload = (documentType: string) => {
    toast({
      title: "Upload Started",
      description: `Uploading ${documentType}. Please wait...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/driver")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold">Profile & Verification</h1>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Verification Progress */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Verification Status
            </h2>
            <Badge className={`${calculateVerificationProgress() === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {calculateVerificationProgress() === 100 ? 'Fully Verified' : 'Pending Verification'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Verification Progress</span>
              <span className="font-medium">{Math.round(calculateVerificationProgress())}% Complete</span>
            </div>
            <Progress value={calculateVerificationProgress()} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Complete all verification steps to start receiving ride requests
            </div>
          </div>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Personal</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{driverProfile.personalInfo.fullName}</h3>
                  <p className="text-muted-foreground">Driver ID: DRV001234</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={getStatusColor(driverProfile.verification.photo.status)}>
                      {getStatusIcon(driverProfile.verification.photo.status)}
                      <span className="ml-1 capitalize">{driverProfile.verification.photo.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={driverProfile.personalInfo.fullName}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={driverProfile.personalInfo.phone}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={driverProfile.personalInfo.email}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input 
                      id="dob" 
                      type="date"
                      value={driverProfile.personalInfo.dateOfBirth}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input 
                      id="emergency" 
                      value={driverProfile.personalInfo.emergencyContact}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="languages">Languages Known</Label>
                    <Input 
                      id="languages" 
                      value={driverProfile.personalInfo.languages.join(", ")}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={driverProfile.personalInfo.address}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Documents Verification */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* License */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-primary" />
                    Driving License
                  </h3>
                  <Badge className={getStatusColor(driverProfile.verification.license.status)}>
                    {getStatusIcon(driverProfile.verification.license.status)}
                    <span className="ml-1 capitalize">{driverProfile.verification.license.status}</span>
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>License Number</Label>
                    <Input value={driverProfile.verification.license.number} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input value={driverProfile.verification.license.expiryDate} disabled className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleFileUpload('License')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Re-upload
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Registration Certificate */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Registration Certificate
                  </h3>
                  <Badge className={getStatusColor(driverProfile.verification.rc.status)}>
                    {getStatusIcon(driverProfile.verification.rc.status)}
                    <span className="ml-1 capitalize">{driverProfile.verification.rc.status}</span>
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>RC Number</Label>
                    <Input value={driverProfile.verification.rc.number} disabled className="mt-1" />
                  </div>
                  <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Verification in progress. You'll be notified once approved.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleFileUpload('RC')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Re-upload
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Aadhar Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Aadhar Card
                  </h3>
                  <Badge className={getStatusColor(driverProfile.verification.aadhar.status)}>
                    {getStatusIcon(driverProfile.verification.aadhar.status)}
                    <span className="ml-1 capitalize">{driverProfile.verification.aadhar.status}</span>
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Aadhar Number</Label>
                    <Input value={driverProfile.verification.aadhar.number} disabled className="mt-1" />
                  </div>
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Verified successfully
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleFileUpload('Aadhar')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Re-upload
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Background Verification */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Background Check
                  </h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="ml-1">Cleared</span>
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Criminal Background Check</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Address Verification</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Previous Employment Check</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicle Information */}
          <TabsContent value="vehicle" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Car className="h-6 w-6 text-primary" />
                  Vehicle Details
                </h3>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{driverProfile.vehicle.ecoRating}</span>
                  <span className="text-sm text-muted-foreground">Eco Rating</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <Select value={driverProfile.vehicle.type} disabled={!isEditing}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Make & Model</Label>
                    <Input 
                      value={`${driverProfile.vehicle.make} ${driverProfile.vehicle.model}`}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input 
                      value={driverProfile.vehicle.year}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Plate Number</Label>
                    <Input 
                      value={driverProfile.vehicle.plateNumber}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input 
                      value={driverProfile.vehicle.color}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <Input 
                      value={driverProfile.vehicle.fuelType}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{driverProfile.performance.totalEarnings}</div>
                  <div className="text-xs text-muted-foreground">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{driverProfile.performance.totalRides}</div>
                  <div className="text-xs text-muted-foreground">Total Rides</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{driverProfile.performance.rating}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{driverProfile.performance.acceptanceRate}%</div>
                  <div className="text-xs text-muted-foreground">Acceptance Rate</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
