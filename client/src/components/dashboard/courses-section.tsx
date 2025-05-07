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
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-gaming">Continue Learning</h2>
          <Link href="/courses">
            <a className="text-primary-400 hover:text-primary-300 text-sm flex items-center">
              See All
              <i className="ri-arrow-right-s-line ml-1"></i>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-card rounded-lg overflow-hidden border border-dark-border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-8 h-8 rounded-lg" />
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
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : courses && courses.length > 0 ? (
            courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-dark-card rounded-lg overflow-hidden border border-dark-border hover:border-primary-600 transition-colors group"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 bg-${course.subject.toLowerCase()}-600/20 rounded-lg flex items-center justify-center`}>
                        <i className={`${getSubjectIcon(course.subject)} text-${course.subject.toLowerCase()}-400`}></i>
                      </div>
                      <span className="font-semibold">{course.title}</span>
                    </div>
                    <span className={`text-xs bg-${course.examType.toLowerCase()}-600/20 text-${course.examType.toLowerCase()}-400 px-2 py-0.5 rounded`}>
                      {course.examType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>{course.currentChapter}</span>
                    <span>{course.progress}% Complete</span>
                  </div>
                  
                  <div className="w-full bg-dark-surface rounded-full h-2 mb-4">
                    <div 
                      className={getProgressColor(course.subject)}
                      style={{ width: `${course.progress}%`, height: '8px', borderRadius: '4px' }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <i className="ri-time-line"></i>
                      <span>Last activity: {formatTimeSince(new Date(course.lastActivity))}</span>
                    </div>
                    <Button 
                      size="sm"
                      className={`text-xs bg-${course.subject.toLowerCase()}-600 hover:bg-${course.subject.toLowerCase()}-500 text-white`}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <i className="ri-book-open-line text-3xl mb-2"></i>
              <p>No courses in progress yet.</p>
              <Button className="mt-4 bg-primary-600 hover:bg-primary-500">
                <Link href="/courses">
                  <a>Browse Courses</a>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
