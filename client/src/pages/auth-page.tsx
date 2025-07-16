import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Brain, Sword, Trophy, Phone, Shield } from 'lucide-react';
import { registerSchema } from '@shared/schema';

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // OTP verification state
  const [otpStep, setOtpStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [sessionId, setSessionId] = useState<string>("");
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  


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
      mobile: "",
      password: "",
      confirmPassword: "",
      otp: "",
      acceptTerms: false,
    },
  });

  // Timer effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Send OTP function
  const sendOTP = async (mobile: string) => {
    console.log('Sending OTP to:', mobile);
    setIsOtpSending(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile }),
      });

      console.log('OTP Response status:', response.status);
      const result = await response.json();
      console.log('OTP Result:', result);

      if (result.success) {
        setSessionId(result.sessionId);
        setOtpStep(2);
        setResendTimer(30);
        toast({
          title: "OTP Sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Failed to send OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOtpSending(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (otp: string) => {
    setIsOtpVerifying(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, otp }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Mobile Verified",
          description: "Your mobile number has been verified successfully!",
        });
        return true;
      } else {
        toast({
          title: "Invalid OTP",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsOtpVerifying(false);
    }
  };



  // Form submit handlers
  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Login successful",
        description: "Welcome back to Learnyzer!",
      });
      navigate("/");
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    if (otpStep === 1) {
      // Step 1: Validate form and send OTP to mobile number
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(data.mobile)) {
        toast({
          title: "Invalid Mobile Number",
          description: "Please enter a valid 10-digit Indian mobile number starting with 6-9",
          variant: "destructive",
        });
        return;
      }
      
      if (!data.acceptTerms) {
        toast({
          title: "Terms Required",
          description: "Please accept the terms and conditions to continue",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Form data:', data);
      await sendOTP(data.mobile);
    } else if (otpStep === 2) {
      // Step 2: Verify OTP and complete registration
      if (!data.otp || data.otp.length !== 6) {
        toast({
          title: "Invalid OTP",
          description: "Please enter the 6-digit OTP",
          variant: "destructive",
        });
        return;
      }
      
      const isOtpValid = await verifyOTP(data.otp);
      if (isOtpValid) {
        try {
          // Remove OTP and mobile verification fields before sending to backend
          const { otp, acceptTerms, confirmPassword, ...registrationData } = data;
          await registerMutation.mutateAsync({
            ...registrationData,
            mobileVerified: true
          });
          toast({
            title: "Registration successful",
            description: "Welcome to Learnyzer! Your account has been created.",
          });
          navigate("/");
        } catch (error) {
          // Error handling is done in the mutation callbacks
        }
      }
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
      
      {/* Left side - Auth form with Solo Leveling style */}
      <div className="flex-1 flex items-center justify-center p-8 z-20 relative">
        <div className="w-full max-w-md">
          <Card className="w-full solo-leveling-card border-primary/20 backdrop-blur-sm">
            {/* Solo Leveling hexagonal corners */}
            <div className="absolute -top-3 -right-3 w-32 h-32 solo-leveling-corner-tr"></div>
            <div className="absolute -bottom-3 -left-3 w-32 h-32 solo-leveling-corner-bl"></div>
            
            <CardHeader className="text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <CardTitle className="text-3xl font-gaming gaming-text mb-2 relative inline-block hex-title">
                Learnyzer
                <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </CardTitle>
              <CardDescription className="relative z-10 text-cyan-300/90">
                Your AI-powered companion for academic excellence
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4 solo-leveling-tabs">
                <TabsTrigger value="login" className="relative overflow-hidden solo-leveling-tab">
                  <span className="relative z-10">Login</span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500/70 transform scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                </TabsTrigger>
                <TabsTrigger value="register" className="relative overflow-hidden solo-leveling-tab">
                  <span className="relative z-10">Register</span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500/70 transform scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
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
                            <FormLabel className="text-cyan-300/90 flex items-center">
                              <div className="w-1 h-4 bg-cyan-500/50 mr-2"></div>
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="solo-leveling-input bg-background/40 border-primary/30 focus:border-cyan-500 transition-colors" 
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

                      {/* Mobile Number Field */}
                      <FormField
                        control={registerForm.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary-foreground/90 flex items-center">
                              <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                              <Phone className="w-4 h-4 mr-1" />
                              Mobile Number
                            </FormLabel>
                            <FormControl>
                              <Input 
                                className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors" 
                                placeholder="9876543210" 
                                {...field} 
                                disabled={otpStep === 2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* OTP Field - Only visible in step 2 */}
                      {otpStep === 2 && (
                        <FormField
                          control={registerForm.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-primary-foreground/90 flex items-center">
                                <div className="w-1 h-4 bg-primary/50 mr-2"></div>
                                <Shield className="w-4 h-4 mr-1" />
                                Enter OTP
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  className="cyber-input bg-background/40 border-primary/30 focus:border-primary transition-colors text-center tracking-widest" 
                                  placeholder="000000" 
                                  maxLength={6}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="text-sm text-cyan-300/70 mt-2">
                                OTP sent to +91{registerForm.getValues().mobile}
                                {resendTimer > 0 ? (
                                  <span className="block">Resend OTP in {resendTimer}s</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => sendOTP(registerForm.getValues().mobile)}
                                    className="text-primary hover:text-primary/80 underline ml-2"
                                    disabled={isOtpSending}
                                  >
                                    Resend OTP
                                  </button>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Password fields - Only visible in step 1 */}
                      {otpStep === 1 && (
                        <>
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
                      
                          {/* Terms and Conditions - Only visible in step 1 */}
                          <FormField
                            control={registerForm.control}
                            name="acceptTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-background/20">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm text-primary-foreground/90 cursor-pointer">
                                    I agree to the{" "}
                                    <a 
                                      href="/terms" 
                                      target="_blank" 
                                      className="text-primary hover:text-primary/80 underline font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Terms and Conditions
                                    </a>{" "}
                                    and{" "}
                                    <a 
                                      href="/privacy" 
                                      target="_blank" 
                                      className="text-primary hover:text-primary/80 underline font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Privacy Policy
                                    </a>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="w-full space-y-3">
                        {otpStep === 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setOtpStep(1);
                              setSessionId("");
                              registerForm.setValue("otp", "");
                            }}
                            className="w-full border-primary/30 text-primary hover:bg-primary/10"
                          >
                            ← Back to Mobile Number
                          </Button>
                        )}
                        
                        <Button 
                          type="submit" 
                          className="w-full animated-gradient-border relative overflow-hidden group"
                          disabled={registerMutation.isPending || isOtpSending || isOtpVerifying}
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
                            ) : isOtpSending ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending OTP...
                              </span>
                            ) : isOtpVerifying ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying OTP...
                              </span>
                            ) : otpStep === 1 ? (
                              <span className="flex items-center justify-center">
                                <Phone className="mr-2 h-4 w-4" />
                                Send OTP
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                <Shield className="mr-2 h-4 w-4" />
                                Verify & Register
                              </span>
                            )}
                          </span>
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </Card>
          
          {/* Hidden reCAPTCHA container for Firebase */}
          <div id="recaptcha-container" style={{ display: 'none' }}></div>
        </div>
      </div>

      {/* Right side - Hero section with Solo Leveling style */}
      <div className="flex-1 relative z-10 p-8 flex flex-col justify-center items-center overflow-hidden">
        {/* Solo Leveling + Cyberpunk background elements */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        
        {/* Solo Leveling corner decorations */}
        <div className="absolute top-10 right-10 w-40 h-40 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 border-b-2 border-l-2 border-primary/30 rounded-bl-lg"></div>
        
        {/* Circuit board pattern with lower opacity */}
        <div className="absolute inset-0 cyber-dots opacity-10"></div>
        
        {/* Features container */}
        <div className="max-w-md space-y-8 relative backdrop-blur-sm">
          <div className="relative">
            <div className="absolute -top-6 left-0 w-20 h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
            <div className="absolute -top-3 left-0 w-10 h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
            <h1 className="text-5xl font-gaming gaming-text mb-2">
              <span className="block gradient-text relative" style={{
                background: "linear-gradient(90deg, #06b6d4, #7d27ff, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "gradient-animation 3s linear infinite"
              }}>
                Level Up
                <div className="absolute -left-3 -top-3 w-6 h-6 border-l-2 border-t-2 border-cyan-500/40"></div>
              </span>
              <span className="block relative text-white font-gaming text-glow">
                <span className="relative z-10 inline-block">Your Learning!</span>
                <div className="absolute -right-4 -bottom-1 w-10 h-10 border-r-2 border-b-2 border-cyan-500/40"></div>
              </span>
            </h1>
            <p className="text-cyan-100/80 mt-4 border-l-2 border-cyan-500/50 pl-4">
              India's premier AI-powered educational platform with Solo Leveling gamification
            </p>
          </div>
          
          <div className="space-y-6 mt-10">
            <div className="feature-card solo-feature-card p-4 transition-transform hover:translate-y-[-2px] border border-cyan-500/20 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500/60"></div>
              
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-xl animate-pulse blur-sm"></div>
                  <div className="w-14 h-14 bg-background/80 rounded-xl flex items-center justify-center border border-cyan-500/30 relative z-10">
                    <Brain className="h-7 w-7 text-cyan-400 solo-icon" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cyan-100">AI-Powered Tutor</h3>
                  <p className="text-sm text-cyan-100/70">Voice-interactive teaching with whiteboard visualization</p>
                </div>
              </div>
            </div>
            
            <div className="feature-card solo-feature-card p-4 transition-transform hover:translate-y-[-2px] border border-fuchsia-500/20 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-fuchsia-500/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-fuchsia-500/60"></div>
              
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-fuchsia-500/20 rounded-xl animate-pulse blur-sm"></div>
                  <div className="w-14 h-14 bg-background/80 rounded-xl flex items-center justify-center border border-fuchsia-500/30 relative z-10">
                    <Sword className="h-7 w-7 text-fuchsia-400 solo-icon" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-fuchsia-100">Battle Zone</h3>
                  <p className="text-sm text-fuchsia-100/70">Real-time competitive 1v1, 2v2, 3v3, or 4v4 matches</p>
                </div>
              </div>
            </div>
            
            <div className="feature-card solo-feature-card p-4 transition-transform hover:translate-y-[-2px] border border-amber-500/20 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-amber-500/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-amber-500/60"></div>
              
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-xl animate-pulse blur-sm"></div>
                  <div className="w-14 h-14 bg-background/80 rounded-xl flex items-center justify-center border border-amber-500/30 relative z-10">
                    <Trophy className="h-7 w-7 text-amber-400 solo-icon" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-100">Rank Up System</h3>
                  <p className="text-sm text-amber-100/70">Progress from Bronze to Grandmaster with achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}