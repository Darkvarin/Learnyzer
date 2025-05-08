import { useState, useEffect } from 'react';
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
import { Brain, Sword, Trophy } from 'lucide-react';

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

  // Use useEffect for navigation instead of early return
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
      name: "",
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
        name: data.name,
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
    <div className="min-h-screen flex flex-col lg:flex-row futuristic-bg relative overflow-hidden">
      {/* Cyberpunk-style background elements */}
      <div className="absolute inset-0 cyber-grid z-0"></div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-purple-500/20 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/3 right-1/5 w-96 h-96 rounded-full bg-blue-500/20 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      
      {/* Scanning line effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] cyber-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] cyber-scan-line"></div>
      </div>
      
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 z-20 relative">
        <div className="w-full max-w-md">
          <Card className="w-full neumorph-card border-primary/20 backdrop-blur-sm">
            <div className="absolute -right-3 -top-3 w-20 h-20 border border-primary/30 rounded-full opacity-30"></div>
            <div className="absolute -left-5 -bottom-5 w-28 h-28 border border-blue-500/20 rounded-full opacity-30"></div>
            
            <CardHeader className="text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <CardTitle className="text-3xl font-gaming gaming-text mb-2 relative inline-block">
                LearnityX
                <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </CardTitle>
              <CardDescription className="relative z-10">
                Your AI-powered companion for academic excellence
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4 cyberpunk-tabs">
                <TabsTrigger value="login" className="relative overflow-hidden cyberpunk-tab">
                  <span className="relative z-10">Login</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="relative overflow-hidden cyberpunk-tab">
                  <span className="relative z-10">Register</span>
                </TabsTrigger>
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
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                placeholder="Enter your username" 
                                {...field} 
                              />
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
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full animated-gradient-border relative overflow-hidden group"
                        disabled={loginMutation.isPending}
                      >
                        <span className="absolute inset-0.5 bg-background/95 rounded-md overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </span>
                        <span className="relative z-10">
                          {loginMutation.isPending ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Logging in...
                            </span>
                          ) : (
                            "Login"
                          )}
                        </span>
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
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                placeholder="Enter your full name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                placeholder="Choose a username" 
                                {...field} 
                              />
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
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                type="email" 
                                placeholder="you@example.com" 
                                {...field} 
                              />
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
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
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
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full animated-gradient-border relative overflow-hidden group"
                        disabled={registerMutation.isPending}
                      >
                        <span className="absolute inset-0.5 bg-background/95 rounded-md overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </span>
                        <span className="relative z-10">
                          {registerMutation.isPending ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating account...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </span>
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
      <div className="flex-1 relative z-10 p-8 flex flex-col justify-center items-center overflow-hidden">
        {/* Cyberpunk elements for hero side */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        {/* Circuit board pattern */}
        <div className="absolute inset-0 cyber-dots opacity-20"></div>
        
        {/* Features container */}
        <div className="max-w-md space-y-8 relative backdrop-blur-sm">
          <div className="relative">
            <div className="absolute -top-6 left-0 w-20 h-1 bg-gradient-to-r from-primary to-transparent"></div>
            <div className="absolute -top-3 left-0 w-10 h-1 bg-gradient-to-r from-primary to-transparent"></div>
            <h1 className="text-5xl font-gaming gaming-text mb-2">
              <span className="block gradient-text" style={{
                background: "linear-gradient(90deg, #7d27ff, #3b82f6, #7d27ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "gradient-animation 3s linear infinite"
              }}>Level Up</span>
              <span className="block">Your Learning!</span>
            </h1>
            <p className="text-gray-300 mt-4 italic border-l-2 border-primary/50 pl-4">
              India's first AI-powered educational platform with advanced gamification
            </p>
          </div>
          
          <div className="space-y-6 mt-10">
            <div className="feature-card neumorph-card p-4 transition-transform hover:translate-x-1 hover:translate-y-1 border border-primary/20">
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-primary/30 rounded-xl animate-pulse blur-sm"></div>
                  <div className="w-14 h-14 bg-background/80 rounded-xl flex items-center justify-center border border-primary/30 relative z-10">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI-Powered Tutor</h3>
                  <p className="text-sm text-gray-300">Voice-interactive teaching with whiteboard visualization</p>
                </div>
              </div>
            </div>
            
            <div className="feature-card neumorph-card p-4 transition-transform hover:translate-x-1 hover:translate-y-1 border border-primary/20">
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-primary/30 rounded-xl animate-pulse blur-sm"></div>
                  <div className="w-14 h-14 bg-background/80 rounded-xl flex items-center justify-center border border-primary/30 relative z-10">
                    <Sword className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Battle Zone</h3>
                  <p className="text-sm text-gray-300">Real-time competitive 1v1, 2v2, 3v3, or 4v4 matches</p>
                </div>
              </div>
            </div>
            
            <div className="feature-card neumorph-card p-4 transition-transform hover:translate-x-1 hover:translate-y-1 border border-primary/20">
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-primary/30 rounded-xl animate-pulse blur-sm"></div>
                  <div className="w-14 h-14 bg-background/80 rounded-xl flex items-center justify-center border border-primary/30 relative z-10">
                    <Trophy className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Rank Up System</h3>
                  <p className="text-sm text-gray-300">Progress from Bronze to Grandmaster with achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}