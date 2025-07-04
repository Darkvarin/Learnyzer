import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Lightbulb, 
  Bug, 
  Brain, 
  BookOpen, 
  Palette, 
  Zap,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Filter,
  Plus,
  Send,
  TrendingUp
} from "lucide-react";

const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.number().min(1, "Please select a category"),
  type: z.enum(["feedback", "feature_request", "bug_report", "suggestion"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  rating: z.number().min(1).max(5).optional(),
  isAnonymous: z.boolean().default(false),
  userEmail: z.string().email().optional().or(z.literal("")),
  userName: z.string().optional()
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const iconMap = {
  MessageSquare,
  Lightbulb,
  Bug,
  Brain,
  BookOpen,
  Palette,
  Zap
};

const typeColors = {
  feedback: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  feature_request: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  bug_report: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  suggestion: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

export default function CustomerFeedback() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("browse");
  const [filters, setFilters] = useState({
    type: "all_types",
    status: "all_statuses",
    priority: "all_priorities",
    categoryId: "all_categories",
    page: 1
  });

  // Fetch feedback categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/feedback/categories"],
  });

  // Fetch category counts
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ["/api/feedback/categories/counts"],
  });

  // Fetch feedback with filters
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await apiRequest("GET", `/api/feedback?${params.toString()}`);
      return await response.json();
    },
  });

  // Fetch feedback statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/feedback/stats"],
  });

  // Form setup
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "feedback",
      priority: "medium",
      isAnonymous: false,
      userEmail: "",
      userName: ""
    },
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  // Vote on feedback
  const voteMutation = useMutation({
    mutationFn: async ({ feedbackId, voteType }: { feedbackId: number; voteType: string }) => {
      const response = await apiRequest("POST", `/api/feedback/${feedbackId}/vote`, { voteType });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    }
  });

  const handleVote = (feedbackId: number, voteType: "up" | "down") => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on feedback",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate({ feedbackId, voteType });
  };

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedback.mutate(data);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || MessageSquare;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Help us improve Learnyzer by sharing your thoughts and suggestions
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Submit Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>Submit Feedback</DialogTitle>
              <DialogDescription>
                Share your thoughts, report bugs, or suggest new features
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="feedback">General Feedback</SelectItem>
                            <SelectItem value="feature_request">Feature Request</SelectItem>
                            <SelectItem value="bug_report">Bug Report</SelectItem>
                            <SelectItem value="suggestion">Suggestion</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                <div className="flex items-center gap-2">
                                  {getIcon(category.icon)}
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of your feedback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed feedback, steps to reproduce (for bugs), or feature specifications"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Rate your experience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isAuthenticated && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitFeedback.isPending}>
                    {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Feedback</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_priorities">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, categoryId: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading feedback...</div>
            ) : feedbackData?.feedback?.length > 0 ? (
              feedbackData.feedback.map((feedback: any) => (
                <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {feedback.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={typeColors[feedback.type as keyof typeof typeColors]}>
                            {feedback.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={priorityColors[feedback.priority as keyof typeof priorityColors]}>
                            {feedback.priority}
                          </Badge>
                          <Badge className={statusColors[feedback.status as keyof typeof statusColors]}>
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{feedback.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {feedback.description}
                        </p>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {feedback.user ? (
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={feedback.user.profileImage} />
                              <AvatarFallback>
                                {(feedback.user.name || feedback.user.username || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs">A</span>
                            </div>
                          )}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feedback.user ? (feedback.user.name || feedback.user.username) : "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatDate(feedback.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(feedback.id, "up")}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {feedback.upvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(feedback.id, "down")}
                          className="flex items-center gap-1"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {feedback.downvotes}
                        </Button>
                        {feedback.comments?.length > 0 && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4" />
                            {feedback.comments.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {feedback.adminResponse && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Admin Response
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(feedback.adminResponseAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {feedback.adminResponse}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No feedback found matching your filters</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {feedbackData?.pagination && feedbackData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={feedbackData.pagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {feedbackData.pagination.page} of {feedbackData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(feedbackData.pagination.totalPages, prev.page + 1) }))}
                disabled={feedbackData.pagination.page === feedbackData.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Feedback</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Issues</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.open}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats?.byType && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.byType.map((item: any) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      <Badge className={typeColors[item.type as keyof typeof typeColors]}>
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Click on any category card to filter feedback by that category
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Card 
                key={category.id} 
                className={`hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 ${
                  filters.categoryId === category.id.toString() 
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "hover:shadow-md"
                }`}
                onClick={() => {
                  setFilters(prev => ({ 
                    ...prev, 
                    categoryId: category.id.toString(), 
                    page: 1 
                  }));
                  setSelectedTab("browse");
                  toast({
                    title: "Filter Applied",
                    description: `Showing feedback for ${category.name}`,
                  });
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getIcon(category.icon)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {(categoryCounts as any)[category.id] || 0} feedback
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View {(categoryCounts as any)[category.id] || 0} Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Clear Filter Button */}
          {filters.categoryId !== "all_categories" && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters(prev => ({ ...prev, categoryId: "all_categories", page: 1 }));
                  toast({
                    title: "Filter Cleared",
                    description: "Showing all feedback",
                  });
                }}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Category Filter
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}