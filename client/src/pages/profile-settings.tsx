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

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    localStorage.setItem("theme", newTheme);
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
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-gaming gaming-text mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account, preferences, and notification settings</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Profile Summary Card */}
          <div className="space-y-6">
            <Card className="game-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                    <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                  
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                      <span className="text-xs font-bold">{(user as any)?.level || 1}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Level {(user as any)?.level || 1}</p>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ 
                            width: `${Math.min(100, (((user as any)?.currentXp || 0) / ((user as any)?.nextLevelXp || 100)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                    {(user as any)?.rank || "Bronze"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <nav className="space-y-1">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile Information
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'security' ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'appearance' ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                {theme === 'dark' ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                Appearance
              </Button>
            </nav>

            <Button 
              variant="outline" 
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>

          {/* Main Content */}
          <div>
            <Card className="game-card">
              <CardContent className="pt-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="profileImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Image</FormLabel>
                                <div className="grid grid-cols-1 gap-4">
                                  <FormControl>
                                    <Input 
                                      placeholder="https://example.com/your-image.jpg" 
                                      {...field}
                                      className="mb-2" 
                                    />
                                  </FormControl>
                                  
                                  <div className="flex flex-col gap-4">
                                    <div className="flex gap-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => field.onChange("https://api.dicebear.com/7.x/avataaars/svg?seed=" + Math.random())}
                                        className="w-full"
                                      >
                                        Generate Random Avatar
                                      </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                      {["Warrior", "Mage", "Scholar", "Ninja"].map((avatar) => (
                                        <Button
                                          key={avatar}
                                          type="button"
                                          variant="outline"
                                          className={`p-2 h-auto aspect-square ${field.value?.includes(avatar.toLowerCase()) ? 'ring-2 ring-primary' : ''}`}
                                          onClick={() => field.onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.toLowerCase()}`)}
                                        >
                                          <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.toLowerCase()}`} 
                                            alt={avatar}
                                            className="w-full h-full object-contain"
                                          />
                                          <span className="text-xs mt-1">{avatar}</span>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <FormDescription>
                                  Enter a URL, generate a random avatar, or select from options
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="track"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Education Track</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(value)}
                                    value={field.value || undefined}
                                    defaultValue="school"
                                    disabled={!isHigherGrade}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={isHigherGrade 
                                          ? "Select your education track" 
                                          : "Available for Class 11 and above"} 
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
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
                                  <FormDescription>
                                    {isHigherGrade 
                                      ? "Choose your education track for personalized content" 
                                      : "Educational tracks are only available for students in Class 11 or above"}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="grade"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Grade/Class</FormLabel>
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
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select your grade/class" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
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
                                  <FormDescription>
                                    Select your current grade or class
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Button type="submit" className="game-button">
                          Save Profile Changes
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">Security Settings</h2>
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={securityForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 6 characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" className="game-button">
                          Update Password
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
                
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Email Notifications</FormLabel>
                                  <FormDescription>
                                    Receive notifications via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="battleReminders"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Battle Reminders</FormLabel>
                                  <FormDescription>
                                    Get notified about upcoming battles
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="streakReminders"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Streak Reminders</FormLabel>
                                  <FormDescription>
                                    Reminders to maintain your daily learning streak
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="newContentAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">New Content Alerts</FormLabel>
                                  <FormDescription>
                                    Get notified when new courses or content is added
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="marketingEmails"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Marketing Emails</FormLabel>
                                  <FormDescription>
                                    Receive promotional content and special offers
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" className="game-button">
                          Save Notification Preferences
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
                
                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">Appearance Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Theme</h3>
                        <p className="text-muted-foreground">Choose the theme for the application</p>
                        
                        <div className="flex space-x-4 mt-4">
                          <Card 
                            className={`relative cursor-pointer transition-all ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => {
                              setTheme('light');
                              document.documentElement.classList.remove('dark');
                              localStorage.setItem('theme', 'light');
                            }}
                          >
                            <CardContent className="p-4 flex flex-col items-center">
                              <Sun className="h-12 w-12 mb-2 text-orange-500" />
                              <p>Light</p>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className={`relative cursor-pointer transition-all ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => {
                              setTheme('dark');
                              document.documentElement.classList.add('dark');
                              localStorage.setItem('theme', 'dark');
                            }}
                          >
                            <CardContent className="p-4 flex flex-col items-center">
                              <Moon className="h-12 w-12 mb-2 text-indigo-400" />
                              <p>Dark</p>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className={`relative cursor-pointer transition-all ${theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => {
                              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                              setTheme('system');
                              
                              if (prefersDark) {
                                document.documentElement.classList.add('dark');
                              } else {
                                document.documentElement.classList.remove('dark');
                              }
                              
                              localStorage.setItem('theme', 'system');
                            }}
                          >
                            <CardContent className="p-4 flex flex-col items-center">
                              <div className="flex items-center h-12 mb-2">
                                <Sun className="h-6 w-6 text-orange-500" />
                                <span className="mx-1">/</span>
                                <Moon className="h-6 w-6 text-indigo-400" />
                              </div>
                              <p>System</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}