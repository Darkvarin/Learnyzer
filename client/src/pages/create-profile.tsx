import { useLocation, Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

// Validation schema for user profile
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num < 100;
  }, { message: "Please enter a valid age" }),
  gender: z.string().min(1, "Please select your gender"),
  class: z.string().min(1, "Please select your class"),
  stream: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CreateProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStreamField, setShowStreamField] = useState(false);
  const [currentGrade, setCurrentGrade] = useState("");
  const [isHigherGrade, setIsHigherGrade] = useState(false);

  // If not logged in, redirect to auth page
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Profile form
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      class: "",
      stream: "",
    },
  });

  // Handle class selection to conditionally show stream field
  const handleClassChange = (value: string) => {
    form.setValue("class", value);
    setCurrentGrade(value);
    
    // Check if grade is 11th or above (including undergraduate and postgraduate)
    const higherGrades = ["11", "12", "undergraduate", "postgraduate"];
    const isHigher = higherGrades.includes(value);
    
    setIsHigherGrade(isHigher);
    setShowStreamField(value === "11" || value === "12");
    
    if (!isHigher) {
      form.setValue("stream", "");
    }
  };

  // Form submit handler
  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/user/profile", {
        ...data,
        age: parseInt(data.age)
      });

      // Update user data in cache
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Profile created successfully",
        description: "Welcome to LearnityX! Your learning journey begins now.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Profile creation failed",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-small-white/[0.2]"></div>
      
      {/* Glow effects */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="absolute top-1/3 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl"></div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-24 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Create Your Profile</h1>
          
          <Link href="/auth">
            <Button variant="outline" className="bg-background/40 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-400">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md game-card bg-background/90 border-cyan-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-gaming gaming-text mb-2">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us more about yourself so we can personalize your learning experience
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Your age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class/Grade</FormLabel>
                    <Select 
                      onValueChange={handleClassChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your class/grade" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isHigherGrade && (
                <FormField
                  control={form.control}
                  name="stream"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream/Track</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!isHigherGrade}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isHigherGrade 
                              ? (showStreamField ? "Select your stream" : "Select your education track") 
                              : "Available for Class 11 and above"} 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {showStreamField ? (
                            // Stream options for 11th and 12th
                            <>
                              <SelectItem value="medical">Medical (PCB)</SelectItem>
                              <SelectItem value="non_medical">Non-Medical (PCM)</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="humanities">Humanities/Arts</SelectItem>
                            </>
                          ) : (
                            // Track options for undergraduate and above
                            <>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                              <SelectItem value="upsc">UPSC</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {showStreamField 
                          ? "Your stream helps us recommend appropriate courses and study materials" 
                          : "Your education track helps us personalize your learning content"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full game-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
        </div>
      </main>
    </div>
  );
}