import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getProgressColor, getSubjectIcon } from "@/lib/utils";
import { useState } from "react";
import { Course } from "@shared/types";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Get the currently authenticated user to access their grade
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Categories have been removed as per requirement
  
  // Filter courses based on user's selected exam if locked
  const userExam = (user as any)?.selectedExam;
  const examLocked = (user as any)?.examLocked;
  
  // If exam is locked, only show that exam's content
  const examFilter = examLocked && userExam ? userExam : selectedExam;
  
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: [`/api/courses?exam=${examFilter}&subject=${selectedSubject}&grade=${user?.grade || ''}`],
    enabled: !!user, // Only run the query when user data is available
  });
  
  // Function to open AI tutor with specific entrance exam content
  const openAITutorWithChapter = (course: Course, chapterTitle: string) => {
    // Navigate to AI Tutor page with state via URL params
    navigate(`/ai-tutor?subject=${encodeURIComponent(course.subject)}&chapter=${encodeURIComponent(chapterTitle)}&exam=${encodeURIComponent(course.examType)}&course=${encodeURIComponent(course.title)}`);
  };
  
  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-gaming">Entrance Exam Courses</h1>
          <p className="text-gray-400 mt-1">Prepare for JEE, NEET, UPSC, CLAT and CUET with our specialized study materials</p>
        </div>

        <div className="flex flex-col space-y-6">
          {/* Filters Section */}
          <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
            <h3 className="text-lg font-bold mb-3">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Exam Type {examLocked && userExam && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-2">
                      Locked: {userExam.toUpperCase()}
                    </span>
                  )}
                </label>
                <Select
                  value={examLocked && userExam ? userExam : selectedExam}
                  onValueChange={examLocked ? () => {} : setSelectedExam}
                  disabled={examLocked && userExam}
                >
                  <SelectTrigger className={`bg-dark-card border-dark-border ${examLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-surface border-dark-border">
                    <SelectItem value="all">All Exams</SelectItem>
                    <SelectItem value="jee">JEE Main</SelectItem>
                    <SelectItem value="jee_advanced">JEE Advanced</SelectItem>
                    <SelectItem value="neet">NEET</SelectItem>
                    <SelectItem value="upsc">UPSC</SelectItem>
                    <SelectItem value="upsc_prelims">UPSC Prelims</SelectItem>
                    <SelectItem value="upsc_mains">UPSC Mains</SelectItem>
                    <SelectItem value="clat">CLAT</SelectItem>
                    <SelectItem value="cuet">CUET</SelectItem>
                    <SelectItem value="cse">CSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">Subject</label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger className="bg-dark-card border-dark-border">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-surface border-dark-border">
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                    <SelectItem value="polity">Indian Polity</SelectItem>
                    <SelectItem value="economy">Indian Economy</SelectItem>
                    <SelectItem value="aptitude">Logical Reasoning & Aptitude</SelectItem>
                    <SelectItem value="legal">Legal Aptitude</SelectItem>
                    <SelectItem value="general_knowledge">General Knowledge</SelectItem>
                    <SelectItem value="current_affairs">Current Affairs</SelectItem>
                    <SelectItem value="computer_science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Search and Tabs */}
          <div>
            <div className="mb-6">
              <Input
                placeholder="Search JEE, NEET, UPSC, CLAT, CUET, CSE preparation materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-card border-dark-border pl-8"
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-dark-card border border-dark-border w-full justify-start mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary-600">All Entrance Exams</TabsTrigger>
                <TabsTrigger value="in_progress" className="data-[state=active]:bg-primary-600">In Preparation</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-primary-600">Exam Mastery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {coursesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
                        <div className="h-40 bg-dark-card">
                          <Skeleton className="h-full w-full" />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-full mb-3" />
                          <Skeleton className="h-4 w-3/4 mb-5" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-9 w-24 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCourses && filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map(course => (
                      <div key={course.id} className="bg-dark-surface border border-dark-border hover:border-primary-600 rounded-lg overflow-hidden transition-all duration-300">
                        <div 
                          className="h-40 bg-dark-card bg-cover bg-center" 
                          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${course.coverImage})` }}
                        >
                          <div className="p-4 h-full flex flex-col justify-end">
                            <span className={`inline-block rounded-full px-2 py-1 text-xs bg-${course.examType.toLowerCase()}-600/70 text-white mb-2 self-start`}>
                              {course.examType}
                            </span>
                            <h3 className="text-xl font-bold font-gaming">{course.title}</h3>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-300 mb-4">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 bg-${course.subject.toLowerCase()}-600/20 rounded-lg flex items-center justify-center`}>
                                <i className={`${getSubjectIcon(course.subject)} text-${course.subject.toLowerCase()}-400`}></i>
                              </div>
                              <span className="text-sm">{course.subject}</span>
                            </div>
                            <Button 
                              className={`bg-${course.subject.toLowerCase()}-600 hover:bg-${course.subject.toLowerCase()}-500 text-white`}
                              onClick={() => {
                                setSelectedCourse(course);
                                setIsDialogOpen(true);
                              }}
                            >
                              {course.progress > 0 ? 'Continue' : 'View Chapters'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-search-line text-5xl mb-3"></i>
                    <p className="text-lg mb-2">No entrance exam materials found</p>
                    <p className="text-sm mb-4">Try selecting a different exam type like JEE, NEET, UPSC, CLAT or CUET</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="in_progress" className="space-y-4">
                {coursesLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : filteredCourses?.filter(c => c.progress > 0 && c.progress < 100).length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses
                      .filter(c => c.progress > 0 && c.progress < 100)
                      .map(course => (
                        <div key={course.id} className="bg-dark-surface border border-dark-border hover:border-primary-600 rounded-lg overflow-hidden transition-all duration-300">
                          <div 
                            className="h-40 bg-dark-card bg-cover bg-center" 
                            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${course.coverImage})` }}
                          >
                            <div className="p-4 h-full flex flex-col justify-end">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs bg-${course.examType.toLowerCase()}-600/70 text-white mb-2 self-start`}>
                                {course.examType}
                              </span>
                              <h3 className="text-xl font-bold font-gaming">{course.title}</h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between text-sm text-gray-400 mb-3">
                              <span>{course.currentChapter}</span>
                              <span>{course.progress}% Complete</span>
                            </div>
                            
                            <div className="w-full bg-dark-card rounded-full h-2 mb-4">
                              <div 
                                className={getProgressColor(course.subject)}
                                style={{ width: `${course.progress}%`, height: '8px', borderRadius: '4px' }}
                              ></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 bg-${course.subject.toLowerCase()}-600/20 rounded-lg flex items-center justify-center`}>
                                  <i className={`${getSubjectIcon(course.subject)} text-${course.subject.toLowerCase()}-400`}></i>
                                </div>
                                <span className="text-sm">{course.subject}</span>
                              </div>
                              <Button 
                                className={`bg-${course.subject.toLowerCase()}-600 hover:bg-${course.subject.toLowerCase()}-500 text-white`}
                                onClick={() => setSelectedCourse(course)}
                              >
                                Continue
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-book-open-line text-5xl mb-3"></i>
                    <p className="text-lg mb-2">No active entrance exam preparation</p>
                    <p className="text-sm mb-4">Start your JEE, NEET, UPSC, CLAT or CUET preparation journey to track progress here</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                {coursesLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : filteredCourses?.filter(c => c.progress === 100).length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses
                      .filter(c => c.progress === 100)
                      .map(course => (
                        <div key={course.id} className="bg-dark-surface border border-dark-border hover:border-primary-600 rounded-lg overflow-hidden transition-all duration-300">
                          <div 
                            className="h-40 bg-dark-card bg-cover bg-center" 
                            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${course.coverImage})` }}
                          >
                            <div className="p-4 h-full flex flex-col justify-end">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs bg-${course.examType.toLowerCase()}-600/70 text-white mb-2 self-start`}>
                                {course.examType}
                              </span>
                              <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold font-gaming">{course.title}</h3>
                                <div className="bg-success-600/70 rounded-full p-1">
                                  <i className="ri-check-double-line"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="mb-3 flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 bg-${course.subject.toLowerCase()}-600/20 rounded-lg flex items-center justify-center`}>
                                  <i className={`${getSubjectIcon(course.subject)} text-${course.subject.toLowerCase()}-400`}></i>
                                </div>
                                <span className="text-sm">{course.subject}</span>
                              </div>
                              <span className="text-xs bg-success-600/20 text-success-400 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                Completed {new Date(course.completedAt || Date.now()).toLocaleDateString()}
                              </div>
                              <Button variant="outline" className="bg-dark-card border-dark-border">
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-medal-line text-5xl mb-3"></i>
                    <p className="text-lg mb-2">No mastered entrance exam topics yet</p>
                    <p className="text-sm mb-4">Complete your JEE, NEET, UPSC, CLAT or CUET preparation modules to earn mastery badges</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Chapter Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-dark-surface border-dark-border text-white max-w-3xl">
          {selectedCourse && (
            <div>
              <DialogTitle className="text-xl font-bold font-gaming mb-2">{selectedCourse.title}</DialogTitle>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-${selectedCourse.subject.toLowerCase()}-600/20 rounded-lg flex items-center justify-center`}>
                  <i className={`${getSubjectIcon(selectedCourse.subject)} text-${selectedCourse.subject.toLowerCase()}-400 text-xl`}></i>
                </div>
                <div>
                  <p className="text-sm text-gray-400">{selectedCourse.subject}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <DialogDescription className="text-sm text-gray-300 mb-4">{selectedCourse.description}</DialogDescription>
                {selectedCourse.progress > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{selectedCourse.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-card rounded-full h-2 mb-4">
                      <div 
                        className={getProgressColor(selectedCourse.subject)}
                        style={{ width: `${selectedCourse.progress}%`, height: '8px', borderRadius: '4px' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-dark-border pt-4">
                <h3 className="text-lg font-semibold mb-3">Chapters</h3>
                
                {selectedCourse.chapterDetails ? (
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(JSON.parse(selectedCourse.chapterDetails as string)).map(([unit, chapters], index) => (
                      <AccordionItem key={index} value={`unit-${index}`} className="border-dark-border">
                        <AccordionTrigger className="text-left font-medium py-3">
                          {unit}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-2">
                            {Array.isArray(chapters) && chapters.map((chapter: string, chapterIndex: number) => (
                              <div 
                                key={chapterIndex}
                                className="p-3 rounded-lg bg-dark-card hover:bg-dark-hover flex justify-between items-center cursor-pointer transition-colors"
                                onClick={() => openAITutorWithChapter(selectedCourse, chapter)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-primary-700/20 flex items-center justify-center">
                                    <i className="ri-book-2-line text-primary-400"></i>
                                  </div>
                                  <span>{chapter}</span>
                                </div>
                                <i className="ri-arrow-right-line text-gray-400"></i>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <i className="ri-file-list-line text-4xl mb-2"></i>
                    <p>No chapter details available for this course</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
