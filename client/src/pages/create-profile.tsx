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
  email: z.string().email("Please enter a valid email address"),
  class: z.string().min(1, "Please select your class/grade"),
  track: z.string().min(1, "Please select your exam track"),
  referralCode: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CreateProfile() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  // Redirect to dashboard if already logged in and profile is complete
  if (user && user.grade) {
    navigate('/dashboard');
    return null;
  }
  
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      class: "",
      track: "",
      referralCode: "",
    }
  });
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    form.setValue('class', value);
  };
  
  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    
    try {
      // Convert class to proper format (e.g., "Class 6")
      const formattedGrade = data.class ? `Class ${data.class}` : null;
      
      // Send the profile data to the server
      const response = await apiRequest('POST', '/api/profile', {
        name: data.name,
        email: data.email,
        grade: formattedGrade,
        track: data.track,
        referralCode: data.referralCode || undefined,
      });
      
      if (response.ok) {
        // Invalidate the user query to refresh data
        queryClient.invalidateQueries(['/api/user']);
        
        toast({
          title: "Profile Created!",
          description: "Your profile has been set up successfully.",
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        toast({
          title: "Profile Creation Failed",
          description: errorData.message || "There was an error creating your profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Profile Creation Failed",
        description: "There was an error connecting to the server. Please check your internet connection.",
        variant: "destructive",
      });
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} />
                        </FormControl>
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
                            <SelectItem value="graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="track"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Track</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your exam track" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CUET">CUET</SelectItem>
                            <SelectItem value="JEE">JEE</SelectItem>
                            <SelectItem value="NEET">NEET</SelectItem>
                            <SelectItem value="CLAT">CLAT</SelectItem>
                            <SelectItem value="UPSC">UPSC</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter referral code if you have one" {...field} />
                        </FormControl>
                        <FormDescription>
                          If someone referred you, enter their code to get bonus rewards
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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