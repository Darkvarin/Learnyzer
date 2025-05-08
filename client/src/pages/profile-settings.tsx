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
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UploadCloud, Shield, Bell, LogOut } from "lucide-react";

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  profileImage: z.string().optional(),
  track: z.string().optional(),
  grade: z.string().optional(),
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

export default function ProfileSettings() {
  const { user, setUser } = useUser();
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentGrade, setCurrentGrade] = useState((user as any)?.grade || "");
  const [isHigherGrade, setIsHigherGrade] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      profileImage: user?.profileImage || "",
      track: (user as any)?.track || "",
      grade: (user as any)?.grade || "",
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
                              <FormLabel className="text-purple-300 font-gaming">EMAIL</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="email" 
                                    placeholder="Your email address" 
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
                          name="profileImage"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel className="text-purple-300 font-gaming">PROFILE IMAGE</FormLabel>
                              <div className="grid grid-cols-1 gap-4">
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="https://example.com/your-image.jpg" 
                                      {...field}
                                      className="pl-3 bg-black/90 border-purple-500/40 focus:border-purple-400 shadow-glow-xs focus:shadow-glow-purple mb-2" 
                                    />
                                    <div className="absolute top-0 bottom-0 left-0 w-1 h-full bg-purple-500/50"></div>
                                  </div>
                                </FormControl>
                                
                                <div className="flex flex-col gap-4">
                                  <div className="flex gap-2">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => field.onChange("https://api.dicebear.com/7.x/avataaars/svg?seed=" + Math.random())}
                                      className="w-full bg-black/50 border-purple-500/30 text-purple-300 hover:bg-purple-950/30 font-gaming"
                                    >
                                      GENERATE RANDOM AVATAR
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-2">
                                    {["Warrior", "Mage", "Scholar", "Ninja"].map((avatar) => (
                                      <Button
                                        key={avatar}
                                        type="button"
                                        variant="outline"
                                        className={`p-2 h-auto aspect-square bg-black/60 border-purple-500/30 hover:bg-purple-950/30 
                                          ${field.value?.includes(avatar.toLowerCase()) ? 'ring-2 ring-purple-400 shadow-glow-xs' : ''}`}
                                        onClick={() => field.onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.toLowerCase()}`)}
                                      >
                                        <div className="flex flex-col items-center">
                                          <div className="w-12 h-12 hex-clip overflow-hidden border border-purple-500/30">
                                            <img 
                                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.toLowerCase()}`} 
                                              alt={avatar}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                          <span className="text-xs mt-1 font-gaming text-purple-300">{avatar}</span>
                                        </div>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <FormDescription className="text-gray-400 mt-2">
                                Enter a URL, generate a random avatar, or select from options
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="track"
                            render={({ field }) => (
                              <FormItem className="relative">
                                <FormLabel className="text-purple-300 font-gaming">EDUCATION TRACK</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(value)}
                                  value={field.value || undefined}
                                  defaultValue="school"
                                  disabled={!isHigherGrade}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-black/90 border-purple-500/40 shadow-glow-xs focus:shadow-glow-purple">
                                      <SelectValue placeholder={isHigherGrade 
                                        ? "Select your education track" 
                                        : "Available for Class 11 and above"} 
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-black/90 border-purple-500/40">
                                    {isHigherGrade ? (
                                      <>
                                        <SelectItem value="science">Science (11-12)</SelectItem>
                                        <SelectItem value="commerce">Commerce (11-12)</SelectItem>
                                        <SelectItem value="arts">Arts (11-12)</SelectItem>
                                        <SelectItem value="engineering">Engineering</SelectItem>
                                        <SelectItem value="medical">Medical</SelectItem>
                                        <SelectItem value="upsc">UPSC</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </>
                                    ) : (
                                      <SelectItem value="school" disabled>Available for Class 11 and above</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-gray-400">
                                  {isHigherGrade 
                                    ? "Choose your education track for personalized content" 
                                    : "Educational tracks are only available for students in Class 11 or above"}
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="grade"
                            render={({ field }) => (
                              <FormItem className="relative">
                                <FormLabel className="text-purple-300 font-gaming">GRADE/CLASS</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setCurrentGrade(value);
                                    
                                    // Check if grade is 11th or above (including undergraduate and postgraduate)
                                    const higherGrades = ["11", "12", "undergraduate", "postgraduate"];
                                    setIsHigherGrade(higherGrades.includes(value));
                                    
                                    // If changing to lower grade, reset track
                                    if (!higherGrades.includes(value)) {
                                      profileForm.setValue("track", "");
                                    }
                                  }}
                                  value={field.value || undefined}
                                  defaultValue="other"
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-black/90 border-purple-500/40 shadow-glow-xs focus:shadow-glow-purple">
                                      <SelectValue placeholder="Select your grade/class" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-black/90 border-purple-500/40">
                                    <SelectItem value="3">Class 3</SelectItem>
                                    <SelectItem value="4">Class 4</SelectItem>
                                    <SelectItem value="5">Class 5</SelectItem>
                                    <SelectItem value="6">Class 6</SelectItem>
                                    <SelectItem value="7">Class 7</SelectItem>
                                    <SelectItem value="8">Class 8</SelectItem>
                                    <SelectItem value="9">Class 9</SelectItem>
                                    <SelectItem value="10">Class 10</SelectItem>
                                    <SelectItem value="11">Class 11</SelectItem>
                                    <SelectItem value="12">Class 12</SelectItem>
                                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-gray-400">
                                  Select your current grade or class
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/50">
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/50">
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/50">
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/50">
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4 bg-black/50">
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
    </motion.div>
  );
}