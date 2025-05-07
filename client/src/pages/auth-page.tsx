import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    navigate("/");
    return null;
  }

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submit handlers
  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Login successful",
        description: "Welcome back to LearnityX!",
      });
      navigate("/");
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast({
        title: "Registration successful",
        description: "Let's create your profile!",
      });
      navigate("/create-profile");
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="w-full game-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-gaming gaming-text mb-2">LearnityX</CardTitle>
              <CardDescription>
                Your AI-powered companion for academic excellence
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full game-button" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full game-button" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-primary/20 to-primary/10 p-8 flex flex-col justify-center items-center">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-4xl font-gaming gaming-text">Level Up Your Learning!</h1>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="ri-brain-line text-2xl text-primary"></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold">AI-Powered Tutor</h3>
                <p className="text-sm opacity-80">Get personalized assistance 24/7 from your AI companion</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="ri-sword-line text-2xl text-primary"></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold">Battle Zone</h3>
                <p className="text-sm opacity-80">Challenge other students and prove your mastery</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="ri-trophy-line text-2xl text-primary"></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold">Rank Up System</h3>
                <p className="text-sm opacity-80">Climb from Bronze to Grandmaster with your academic achievements</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="ri-calendar-check-line text-2xl text-primary"></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold">Daily Streaks</h3>
                <p className="text-sm opacity-80">Build daily learning habits and earn exclusive rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}