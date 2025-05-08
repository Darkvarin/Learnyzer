import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getProgressColor, getSubjectIcon, formatTimeSince } from "@/lib/utils";
import { Course } from "@shared/types";

export function CoursesSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses/recent'],
  });

  return (
    <div className="bg-background/70 rounded-xl overflow-hidden border border-cyan-500/30 shadow-glow-cyan">
      <div className="p-6 relative">
        {/* Solo Leveling style corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/70"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/70"></div>
        
        {/* Solo Leveling energy lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold font-gaming bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white" style={{
            textShadow: "0 0 10px rgba(6, 182, 212, 0.3)"
          }}>Continue Learning</h2>
          <Link href="/courses">
            <a className="text-cyan-500 hover:text-cyan-400 transition-colors duration-300 text-sm flex items-center group">
              See All
              <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="relative bg-background/60 rounded-lg overflow-hidden border border-cyan-500/30 shadow-sm shadow-cyan-500/20">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/60"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/60"></div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-9 h-9 rounded-lg" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  
                  <Skeleton className="w-full h-2 mb-4 rounded-full" />
                  
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : courses && courses.length > 0 ? (
            courses.map((course) => (
              <div 
                key={course.id} 
                className="relative bg-background/60 rounded-lg overflow-hidden border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 group shadow-sm hover:shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20"
              >
                {/* Solo Leveling corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/60 transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-cyan-400/80"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/60 transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-cyan-400/80"></div>
                
                {/* Solo Leveling energy line */}
                <div className="absolute -top-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Solo Leveling hexagonal subject icon */}
                      <div className="relative monarch-course-icon-frame">
                        <div className="hex-clip-sm overflow-hidden bg-gradient-to-br from-background via-background/90 to-background/80 border border-cyan-500/40 w-9 h-9 flex items-center justify-center">
                          <i className={`${getSubjectIcon(course.subject)} text-${course.subject.toLowerCase()}-400`}></i>
                        </div>
                        <div className="absolute inset-0 subject-icon-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <span className="font-semibold font-gaming">{course.title}</span>
                    </div>
                    <span className={`text-xs bg-${course.examType.toLowerCase()}-600/30 text-${course.examType.toLowerCase()}-400 px-2 py-1 rounded-sm border border-${course.examType.toLowerCase()}-500/30`}>
                      {course.examType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-cyan-400/80 mb-3">
                    <span>{course.currentChapter}</span>
                    <span className="font-mono">{course.progress}% Complete</span>
                  </div>
                  
                  {/* Solo Leveling style progress bar */}
                  <div className="w-full bg-background/50 rounded-sm h-2 mb-4 overflow-hidden border border-cyan-500/20 relative">
                    {/* Energy pulse animation */}
                    <div className="absolute inset-0 course-energy-pulse opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div 
                      className="h-full relative"
                      style={{ 
                        width: `${course.progress}%`,
                        background: `linear-gradient(to right, rgba(${course.subject === 'physics' ? '234, 179, 8' : course.subject === 'chemistry' ? '34, 197, 94' : '125, 39, 255'}, 0.6), rgba(${course.subject === 'physics' ? '234, 179, 8' : course.subject === 'chemistry' ? '34, 197, 94' : '125, 39, 255'}, 0.3))`
                      }}
                    >
                      {/* Glow effect at the edge of progress */}
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <i className="ri-time-line text-cyan-500/70"></i>
                      <span>Last activity: <span className="text-cyan-500/70">{formatTimeSince(new Date(course.lastActivity))}</span></span>
                    </div>
                    <Button 
                      size="sm"
                      className={`text-xs bg-background hover:bg-cyan-950 border border-cyan-500/50 hover:border-cyan-400/70 text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-glow-sm shadow-cyan-500/10`}
                    >
                      <span className="mr-1">Continue</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 relative">
              {/* Solo Leveling empty state energy effect */}
              <div className="absolute inset-0 empty-state-pulse opacity-20"></div>
              
              {/* Solo Leveling style corner accents */}
              <div className="absolute top-5 left-5 w-6 h-6 border-t border-l border-cyan-500/50"></div>
              <div className="absolute bottom-5 right-5 w-6 h-6 border-b border-r border-cyan-500/50"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 mb-3 hex-clip bg-gradient-to-br from-cyan-950 to-background border border-cyan-500/40 flex items-center justify-center">
                  <i className="ri-book-open-line text-3xl text-cyan-500/80"></i>
                </div>
                <p className="text-cyan-400/80 font-gaming mb-2">No courses in progress yet</p>
                <p className="text-sm text-gray-400 max-w-md mb-6">Start your learning journey by browsing available courses</p>
                <Button className="bg-background hover:bg-cyan-950 border border-cyan-500/50 hover:border-cyan-400/70 text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-glow-sm shadow-cyan-500/20 group">
                  <Link href="/courses">
                    <a className="flex items-center space-x-2">
                      <span>Browse Courses</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </a>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
