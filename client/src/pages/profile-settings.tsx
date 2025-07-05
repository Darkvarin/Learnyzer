import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/contexts/user-context";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUploadCrop } from "@/components/ui/image-upload-crop";
import { User, UploadCloud, Shield, Bell, LogOut, Lock, GraduationCap, AlertTriangle } from "lucide-react";

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  mobile: z.string().optional(),
  profileImage: z.string().optional(),
  selectedExam: z.string().optional(),
});

const examSelectionSchema = z.object({
  selectedExam: z.string().min(1, "Please select an entrance exam"),
});

const securitySchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  battleReminders: z.boolean().default(true),
  streakReminders: z.boolean().default(true),
  newContentAlerts: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

type ProfileForm = z.infer<typeof profileSchema>;
type SecurityForm = z.infer<typeof securitySchema>;
type NotificationForm = z.infer<typeof notificationSchema>;
type ExamSelectionForm = z.infer<typeof examSelectionSchema>;

export default function ProfileSettings() {
  const { user, setUser } = useUser();
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedExamForConfirmation, setSelectedExamForConfirmation] = useState<string>("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobile: (user as any)?.mobile || "",
      profileImage: user?.profileImage || "",
      selectedExam: (user as any)?.selectedExam || "",
    },
  });

  // Exam selection form
  const examForm = useForm<ExamSelectionForm>({
    resolver: zodResolver(examSelectionSchema),
    defaultValues: {
      selectedExam: (user as any)?.selectedExam || "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      battleReminders: true,
      streakReminders: true,
      newContentAlerts: true,
      marketingEmails: false,
    },
  });

  // Handle profile update
  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      const updatedUser = await response.json();
      
      setUser({ ...user, ...updatedUser });
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle security update
  const onSecuritySubmit = async (data: SecurityForm) => {
    try {
      await apiRequest("POST", "/api/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      securityForm.reset();
    } catch (error) {
      toast({
        title: "Failed to update password",
        description: "The current password you entered may be incorrect.",
        variant: "destructive",
      });
    }
  };

  // Handle notification update
  const onNotificationSubmit = async (data: NotificationForm) => {
    try {
      await apiRequest("PATCH", "/api/user/notifications", data);
      
      toast({
        title: "Notification preferences saved",
        description: "Your notification settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to update notifications",
        description: "An error occurred while updating your notification preferences.",
        variant: "destructive",
      });
    }
  };

  // Theme toggle removed - dark theme enforced

  // Handle entrance exam selection
  const handleExamSelection = (examType: string) => {
    if ((user as any)?.examLocked) {
      toast({
        title: "Exam Selection Locked",
        description: "Your entrance exam selection is locked. Contact support to change it.",
        variant: "destructive",
      });
      return;
    }

    setSelectedExamForConfirmation(examType);
    setShowConfirmationDialog(true);
  };

  // Confirm exam selection with lock
  const confirmExamSelection = async () => {
    try {
      const updatedUser = await apiRequest("POST", "/api/user/confirm-exam", {
        selectedExam: selectedExamForConfirmation,
      });

      setUser(updatedUser as any);
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
      
      setShowConfirmationDialog(false);
      setSelectedExamForConfirmation("");
      
      toast({
        title: "Entrance Exam Confirmed",
        description: `${selectedExamForConfirmation?.toUpperCase()} has been set as your entrance exam. This selection is now locked.`,
      });
    } catch (error: any) {
      console.error("Exam confirmation error:", error);
      
      // Handle specific error cases
      if (error.message?.includes("already locked")) {
        toast({
          title: "Exam Already Locked",
          description: "Your entrance exam selection is already confirmed and locked.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to confirm exam",
          description: "An error occurred while confirming your exam selection.",
          variant: "destructive",
        });
      }
      
      // Close dialog and reset state
      setShowConfirmationDialog(false);
      setSelectedExamForConfirmation("");
    }
  };

  // Get exam details
  const getExamDetails = (examType: string) => {
    const examInfo: Record<string, { name: string; description: string; icon: string }> = {
      jee: {
        name: "JEE (Joint Entrance Examination)",
        description: "For engineering admissions in India",
        icon: "⚙️"
      },
      neet: {
        name: "NEET (National Eligibility cum Entrance Test)",
        description: "For medical admissions in India",
        icon: "🩺"
      },
      upsc: {
        name: "UPSC (Union Public Service Commission)",
        description: "For civil services examination",
        icon: "🏛️"
      },
      clat: {
        name: "CLAT (Common Law Admission Test)",
        description: "For law admissions in India",
        icon: "⚖️"
      },
      cuet: {
        name: "CUET (Common University Entrance Test)",
        description: "For undergraduate admissions",
        icon: "🎓"
      },
      cse: {
        name: "CSE (Computer Science Engineering)",
        description: "For computer science competitive exams",
        icon: "💻"
      },
      cgle: {
        name: "CGLE (Combined Graduate Level Examination)",
        description: "For government job recruitment at graduate level",
        icon: "🏢"
      }
    };
    return examInfo[examType] || { name: examType, description: "", icon: "📚" };
  };

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/auth");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 solo-bg relative overflow-hidden"
    >
      {/* Solo Leveling background elements */}
      <div className="absolute inset-0 solo-grid z-0 opacity-40"></div>
      
      {/* Power aura elements */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-primary/15 filter blur-[60px] animate-power-pulse z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-cyan-500/15 filter blur-[80px] animate-power-pulse z-0" style={{animationDelay: '1.5s'}}></div>
      
      {/* Solo Leveling scanning effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-[5]">
        <div className="absolute top-0 left-0 right-0 h-[2px] solo-scan-line"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back button */}
        <div className="mb-4">
          <BackButton fallbackPath="/dashboard" className="text-cyan-400 hover:text-cyan-300" />
        </div>
        
        <header className="mb-8 relative">
          <div className="absolute -left-4 top-6 w-2 h-12 monarch-energy-bar"></div>
          <h1 className="text-3xl font-gaming text-cyan-400 mb-2 border-l-2 border-cyan-500/50 pl-4">PROFILE & SETTINGS</h1>
          <p className="text-gray-400 ml-4">Manage your account, preferences, and notification settings</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Profile Summary Card with Solo Leveling Style */}
          <div className="space-y-6">
            <div className="relative group">
              {/* Shadow monarch energy bar */}
              <div className="absolute -left-4 top-10 w-2 h-24 monarch-energy-bar"></div>
              
              {/* Solo Leveling runic corner decorations */}
              <div className="absolute -top-3 -left-3 w-12 h-12 solo-rune-corner-tl"></div>
              <div className="absolute -top-3 -right-3 w-12 h-12 solo-rune-corner-tr"></div>
              <div className="absolute -bottom-3 -left-3 w-12 h-12 solo-rune-corner-bl"></div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 solo-rune-corner-br"></div>
              
              {/* Improved background opacity */}
              <div className="absolute inset-0 bg-cyan-900/50 group-hover:bg-cyan-800/60 transition-colors duration-500 rounded-xl"></div>
              
              {/* Profile card with enhanced opacity for better readability */}
              <div className="relative z-10 bg-black/90 rounded-xl shadow-glow-cyan border border-cyan-500/30 p-6">
                <div className="flex flex-col items-center">
                  {/* Hexagonal avatar with Solo Leveling style */}
                  <div className="relative w-28 h-28 mb-4 monarch-profile-frame">
                    <div className="absolute inset-0 hex-clip overflow-hidden border-2 border-cyan-500/50 shadow-glow-cyan">
                      <div className="w-full h-full overflow-hidden">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt={user?.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <span className="text-cyan-400 text-3xl font-gaming">{user?.name?.charAt(0) || "U"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 solo-energy-pulse opacity-30"></div>
                  </div>
                  
                  <h2 className="text-xl font-bold font-gaming text-cyan-300 mb-1">{user?.name}</h2>
                  <p className="text-sm text-gray-400 mb-3">{user?.email}</p>
                  
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-10 h-10 hex-clip bg-primary/20 flex items-center justify-center mr-3 border border-cyan-500/30">
                      <span className="text-sm font-bold text-cyan-300 font-gaming">{(user as any)?.level || 1}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-gaming">LEVEL {(user as any)?.level || 1}</p>
                      <div className="w-28 h-2 bg-gray-800 rounded-sm overflow-hidden mt-1 border border-cyan-500/20">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-700 to-cyan-400"
                          style={{ 
                            width: `${Math.min(100, (((user as any)?.currentXp || 0) / ((user as any)?.nextLevelXp || 100)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-1 rounded-sm bg-gradient-to-r from-cyan-900/60 to-cyan-700/40 text-cyan-400 text-sm font-gaming border border-cyan-500/30 shadow-glow-xs">
                    {(user as any)?.rank || "Bronze"}
                  </div>
                </div>
              </div>
            </div>

            {/* Solo Leveling styled navigation */}
            <div className="relative">
              {/* Energy bar for the menu */}
              <div className="absolute -left-4 top-10 w-2 h-24 monarch-energy-bar-blue"></div>
              
              {/* Background with improved opacity */}
              <div className="absolute inset-0 bg-blue-900/50 rounded-xl"></div>
              
              <nav className="relative z-10 space-y-2 bg-black/90 rounded-xl shadow-glow-blue border border-blue-500/20 p-2">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-gaming text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/50 ${
                    activeTab === 'profile' ? 'bg-cyan-950/50 text-cyan-400 border-l-2 border-cyan-500' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile Information
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-gaming text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/50 ${
                    activeTab === 'security' ? 'bg-cyan-950/50 text-cyan-400 border-l-2 border-cyan-500' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-gaming text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/50 ${
                    activeTab === 'notifications' ? 'bg-cyan-950/50 text-cyan-400 border-l-2 border-cyan-500' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
              </nav>
            </div>

            {/* Logout button with Solo Leveling style */}
            <div className="relative mt-6">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-black/90 shadow-glow-xs border border-red-500/30 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-gaming"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                LOGOUT
              </Button>
              {/* Solo Leveling corner accent */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 solo-rune-corner-logout"></div>
            </div>
          </div>

          {/* Main Content with Solo Leveling Styling */}
          <div className="relative group">
            {/* Energy bar for the content */}
            <div className="absolute -left-4 top-10 w-2 h-64 monarch-energy-bar-purple"></div>
            
            {/* Solo Leveling corner accents */}
            <div className="absolute -top-3 -right-3 w-12 h-12 solo-rune-corner-tr"></div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 solo-rune-corner-br"></div>
            
            {/* Improved background opacity */}
            <div className="absolute inset-0 bg-purple-900/50 rounded-xl"></div>
            
            {/* Content area with enhanced opacity for better readability */}
            <div className="relative z-10 bg-black/90 rounded-xl shadow-glow-purple border border-purple-500/30 p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-purple-500 mr-3"></div>
                    <h2 className="text-2xl font-gaming text-purple-400">PROFILE INFORMATION</h2>
                  </div>
                  
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="space-y-5">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">FULL NAME</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="Your full name" 
                                    {...field}
                                    className="pl-3 bg-black/90 border-purple-500/40 focus:border-purple-400 shadow-glow-xs focus:shadow-glow-purple" 
                                  />
                                  <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-purple-500/50"></div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming flex items-center gap-2">
                                EMAIL 
                                <Lock className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-amber-400">(Locked)</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="email" 
                                    placeholder="Your email address" 
                                    {...field}
                                    readOnly
                                    className="pl-3 bg-gray-800/50 border-amber-500/40 text-gray-300 cursor-not-allowed" 
                                  />
                                  <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-amber-500/50"></div>
                                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
                                </div>
                              </FormControl>
                              <FormDescription className="text-amber-200/70 text-xs">
                                Email cannot be changed as it was used for registration
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">MOBILE NUMBER</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="tel" 
                                    placeholder="Your mobile number (optional)" 
                                    {...field}
                                    className="pl-3 bg-black/90 border-purple-500/40 focus:border-purple-400 shadow-glow-xs focus:shadow-glow-purple" 
                                  />
                                  <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-purple-500/50"></div>
                                </div>
                              </FormControl>
                              <FormDescription className="text-gray-400 text-xs">
                                Optional: Add your mobile number for SMS notifications
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="profileImage"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">PROFILE IMAGE</FormLabel>
                              <FormControl>
                                <ImageUploadCrop
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-gray-400 mt-2">
                                Upload an image from your device and crop it to create your profile picture
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        {/* Entrance Exam Selection Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="w-6 h-6 text-purple-400" />
                            <h3 className="text-lg font-gaming text-purple-300">ENTRANCE EXAM SELECTION</h3>
                            {(user as any)?.examLocked && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/50 border border-yellow-500/30 rounded-lg">
                                <Lock className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs font-gaming text-yellow-300">LOCKED</span>
                              </div>
                            )}
                          </div>

                          {(user as any)?.selectedExam && (user as any)?.examLocked ? (
                            // Show locked exam selection
                            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{getExamDetails((user as any).selectedExam).icon}</span>
                                  <div>
                                    <h4 className="font-gaming text-purple-300">{getExamDetails((user as any).selectedExam).name}</h4>
                                    <p className="text-sm text-gray-400">{getExamDetails((user as any).selectedExam).description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Lock className="w-4 h-4 text-yellow-400" />
                                      <span className="text-xs text-yellow-300">
                                        Locked until next subscription cycle
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Show exam selection grid
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {["jee", "neet", "upsc", "clat", "cuet", "cse", "cgle"].map((examType) => {
                                const examInfo = getExamDetails(examType);
                                const isSelected = (user as any)?.selectedExam === examType;
                                
                                return (
                                  <div
                                    key={examType}
                                    onClick={() => handleExamSelection(examType)}
                                    className={`
                                      p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105
                                      ${isSelected 
                                        ? 'bg-purple-900/50 border-purple-400/50 shadow-glow-purple' 
                                        : 'bg-black/50 border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-950/30'
                                      }
                                    `}
                                  >
                                    <div className="flex flex-col items-center text-center space-y-3">
                                      <span className="text-3xl">{examInfo.icon}</span>
                                      <h4 className="font-gaming text-purple-300 text-sm leading-tight">
                                        {examInfo.name}
                                      </h4>
                                      <p className="text-xs text-gray-400 leading-relaxed">
                                        {examInfo.description}
                                      </p>
                                      {isSelected && (
                                        <div className="w-full text-center">
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded text-xs text-purple-300">
                                            ✓ Selected
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!(user as any)?.examLocked && (
                            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div className="space-y-2">
                                  <h4 className="font-gaming text-yellow-300 text-sm">Important Notice</h4>
                                  <p className="text-xs text-yellow-200 leading-relaxed">
                                    Once you confirm your entrance exam selection, it will be locked and cannot be changed until your next subscription cycle. 
                                    This ensures you receive focused, exam-specific content throughout your preparation.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-900 to-purple-700 hover:from-purple-800 hover:to-purple-600 text-purple-100 font-gaming shadow-glow-xs hover:shadow-glow-purple">
                        SAVE PROFILE
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-purple-500 mr-3"></div>
                    <h2 className="text-2xl font-gaming text-purple-400">SECURITY</h2>
                  </div>
                  
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      <div className="space-y-5">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">CURRENT PASSWORD</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="password" 
                                    placeholder="•••••••••••" 
                                    {...field}
                                    className="pl-3 bg-black/50 border-purple-500/40 focus:border-purple-400 shadow-glow-xs focus:shadow-glow-purple" 
                                  />
                                  <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-purple-500/50"></div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">NEW PASSWORD</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="password" 
                                    placeholder="•••••••••••" 
                                    {...field}
                                    className="pl-3 bg-black/50 border-purple-500/40 focus:border-purple-400 shadow-glow-xs focus:shadow-glow-purple" 
                                  />
                                  <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-purple-500/50"></div>
                                </div>
                              </FormControl>
                              <FormDescription className="text-gray-400">
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">CONFIRM PASSWORD</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="password" 
                                    placeholder="•••••••••••" 
                                    {...field}
                                    className="pl-3 bg-black/50 border-purple-500/40 focus:border-purple-400 shadow-glow-xs focus:shadow-glow-purple" 
                                  />
                                  <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-purple-500/50"></div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-900 to-purple-700 hover:from-purple-800 hover:to-purple-600 text-purple-100 font-gaming shadow-glow-xs hover:shadow-glow-purple">
                        UPDATE PASSWORD
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-purple-500 mr-3"></div>
                    <h2 className="text-2xl font-gaming text-purple-400">NOTIFICATIONS</h2>
                  </div>
                  
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/90">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-purple-300 font-gaming">EMAIL NOTIFICATIONS</FormLabel>
                                <FormDescription className="text-gray-400">
                                  Receive email notifications for important updates
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-500"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="battleReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/90">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-purple-300 font-gaming">BATTLE REMINDERS</FormLabel>
                                <FormDescription className="text-gray-400">
                                  Get reminded about upcoming battles you've joined
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-500"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="streakReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/90">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-purple-300 font-gaming">STREAK REMINDERS</FormLabel>
                                <FormDescription className="text-gray-400">
                                  Get daily reminders to maintain your streak
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-500"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="newContentAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/90">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-purple-300 font-gaming">NEW CONTENT ALERTS</FormLabel>
                                <FormDescription className="text-gray-400">
                                  Get notified when new courses or content is added
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-500"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/90">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-purple-300 font-gaming">MARKETING EMAILS</FormLabel>
                                <FormDescription className="text-gray-400">
                                  Receive promotional content and special offers
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-500"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-900 to-purple-700 hover:from-purple-800 hover:to-purple-600 text-purple-100 font-gaming shadow-glow-xs hover:shadow-glow-purple">
                        SAVE NOTIFICATION PREFERENCES
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exam Confirmation Dialog */}
      <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <AlertDialogContent className="bg-black/95 border-purple-500/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-gaming text-purple-300 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-purple-400" />
              Confirm Entrance Exam Selection
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 leading-relaxed">
              You're about to select <strong className="text-purple-300">{getExamDetails(selectedExamForConfirmation).name}</strong> as your entrance exam.
              <br /><br />
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 my-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-200 text-sm">
                    <strong>Important:</strong> Once confirmed, this selection will be locked and cannot be changed until your next subscription cycle.
                  </div>
                </div>
              </div>
              This ensures you receive focused, exam-specific content throughout your preparation journey.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 font-gaming">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExamSelection}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-gaming"
            >
              Confirm & Lock Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}