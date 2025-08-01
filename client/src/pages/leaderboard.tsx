import { useState, useMemo } from 'react';
import { Medal, BarChart3, Search, ChevronUp, ChevronDown, Users, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
// Import PageHeader as a relative path since it might not be properly aliased
import PageHeader from '../components/layout/page-header';
import { Link } from 'wouter';

function LeaderboardTable({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  return (
    <div className="rounded-xl overflow-hidden bg-[#0C101F]/90 border border-purple-500/20 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 text-left">
              <th className="px-2 sm:px-4 py-3 font-medium text-white/80 text-xs sm:text-sm">Rank</th>
              <th className="px-2 sm:px-4 py-3 font-medium text-white/80 text-xs sm:text-sm">Student</th>
              <th 
                className="px-2 sm:px-4 py-3 font-medium text-white/80 text-xs sm:text-sm cursor-pointer"
                onClick={() => toggleSort('level')}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  Level
                  {sortField === 'level' && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th 
                className="px-2 sm:px-4 py-3 font-medium text-white/80 text-xs sm:text-sm cursor-pointer"
                onClick={() => toggleSort('xp')}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  XP
                  {sortField === 'xp' && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th 
                className="px-2 sm:px-4 py-3 font-medium text-white/80 text-xs sm:text-sm cursor-pointer"
                onClick={() => toggleSort('streak')}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  Streak
                  {sortField === 'streak' && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 font-medium text-white/80 text-xs sm:text-sm">Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {isLoading ? (
              Array(10).fill(0).map((_, idx) => (
                <tr key={idx} className="transition-colors hover:bg-purple-500/5">
                  <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                      <Skeleton className="h-4 w-20 sm:w-24" />
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-10 sm:w-12" /></td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-10 sm:w-12" /></td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-10 sm:w-12" /></td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-12 sm:w-16" /></td>
                </tr>
              ))
            ) : (
              sortedData.map((student, idx) => (
                <tr key={idx} className="transition-colors hover:bg-purple-500/5">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-sm sm:text-base font-bold">
                    {idx < 3 ? (
                      <div className={`inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full text-xs sm:text-sm
                        ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : 
                          idx === 1 ? 'bg-slate-500/20 text-slate-400' : 
                          'bg-amber-900/20 text-amber-700'}
                      `}>
                        {idx + 1}
                      </div>
                    ) : (
                      <span className="text-white/60 pl-2 sm:pl-3 text-xs sm:text-sm">{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={student.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600/30 to-purple-400/10 text-xs sm:text-sm">
                          {student.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white/90 text-xs sm:text-sm">{student.name}</p>
                        <p className="text-xs text-white/60">{student.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="inline-flex items-center px-1.5 sm:px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs sm:text-sm">
                      Lvl {student.level}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-cyan-400 text-xs sm:text-sm">{student.xp.toLocaleString()}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs sm:text-sm">
                      <span className="animate-pulse">●</span> {student.streak} days
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm
                      ${student.rank.toLowerCase().includes('bronze') ? 'bg-amber-900/20 text-amber-700' : 
                        student.rank.toLowerCase().includes('silver') ? 'bg-slate-500/20 text-slate-400' :
                        student.rank.toLowerCase().includes('gold') ? 'bg-amber-500/20 text-amber-400' :
                        student.rank.toLowerCase().includes('platinum') ? 'bg-cyan-500/20 text-cyan-400' :
                        student.rank.toLowerCase().includes('diamond') ? 'bg-blue-500/20 text-blue-400' :
                        student.rank.toLowerCase().includes('heroic') ? 'bg-purple-500/20 text-purple-400' :
                        student.rank.toLowerCase().includes('elite') ? 'bg-pink-500/20 text-pink-400' :
                        student.rank.toLowerCase().includes('master') ? 'bg-red-500/20 text-red-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      <Medal size={12} className="sm:w-4 sm:h-4" /> 
                      <span className="hidden sm:inline">{student.rank}</span>
                      <span className="sm:hidden">{student.rank.split(' ')[0]}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Create type for API response
  interface LeaderboardResponse {
    leaderboard: Array<{
      id: number;
      name: string;
      profileImage: string | null;
      grade: string | null;
      level: number;
      currentXp: number;
      streakDays: number;
      rank: string;
      track: string | null;
    }>;
    examFilter?: string;
  }

  // Fetch Indian leaderboard data
  const { 
    data: indianLeaderboardResponse, 
    isLoading: isIndianLoading 
  } = useQuery<LeaderboardResponse>({
    queryKey: ['/api/leaderboard'],
    // Using the real backend data from API
  });
  
  // Extract and transform the data for display
  const indianLeaderboardData = useMemo((): StudentData[] => {
    if (!indianLeaderboardResponse?.leaderboard) return [];
    
    return indianLeaderboardResponse.leaderboard.map((user) => ({
      id: user.id,
      name: user.name,
      profileImage: user.profileImage || '',
      grade: user.grade || '',
      level: user.level,
      xp: user.currentXp || 0,
      streak: user.streakDays || 0,
      rank: user.rank
    }));
  }, [indianLeaderboardResponse]);

  // Fetch friends leaderboard data
  const { 
    data: friendsLeaderboardResponse, 
    isLoading: isFriendsLoading 
  } = useQuery<LeaderboardResponse>({
    queryKey: ['/api/leaderboard/friends'],
    // Using the real backend data from API
  });
  
  // Extract and transform the data for display
  const friendsLeaderboardData = useMemo((): StudentData[] => {
    if (!friendsLeaderboardResponse?.leaderboard) return [];
    
    return friendsLeaderboardResponse.leaderboard.map((user) => ({
      id: user.id,
      name: user.name,
      profileImage: user.profileImage || '',
      grade: user.grade || '',
      level: user.level,
      xp: user.currentXp || 0,
      streak: user.streakDays || 0,
      rank: user.rank
    }));
  }, [friendsLeaderboardResponse]);

  // Create type for student data
  type StudentData = {
    id: number;
    name: string;
    profileImage: string;
    grade: string;
    level: number;
    xp: number;
    streak: number;
    rank: string;
  };

  // Student data type declaration used above

  const filteredIndianData = indianLeaderboardData.filter((student: StudentData) => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || student.grade === selectedCategory)
  );

  const filteredFriendsData = friendsLeaderboardData.filter((student: StudentData) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || student.grade === selectedCategory)
  );

  // Unique categories for filtering - use Array.from to handle iteration properly
  const categories = ['all', ...Array.from(new Set(indianLeaderboardData.map((item: StudentData) => item.grade).filter(Boolean)))];

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
      
      <main className="flex-1 container max-w-6xl mx-auto px-2 sm:px-4 pt-20 pb-16 md:pt-24 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <PageHeader
              title="Indian Leaderboard"
              description="Compete with students across India and rise to the top of the national rankings."
              icon={<BarChart3 className="h-6 w-6 text-purple-400" />}
            />
            {/* Exam Filter Display */}
            {(indianLeaderboardResponse?.examFilter || friendsLeaderboardResponse?.examFilter) && (
              <div className="flex mt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium text-sm">
                    {(indianLeaderboardResponse?.examFilter || friendsLeaderboardResponse?.examFilter)?.toUpperCase()} Locked - Exam-specific rankings
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Link href="/dashboard">
            <Button variant="outline" className="bg-background/40 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-400 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-6 mt-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              className="pl-10 bg-[#0C101F]/90 border-purple-500/20"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category, idx) => (
              <Button
                key={idx}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${
                  selectedCategory === category 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "bg-[#0C101F]/90 border-purple-500/20 text-white/80 hover:text-white"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All' : category}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="indian" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-[#0C101F]/90 border border-purple-500/20 grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="indian" className="data-[state=active]:bg-purple-500/20 text-xs sm:text-sm">
                <span className="hidden sm:inline">Indian Rankings</span>
                <span className="sm:hidden">Indian</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="data-[state=active]:bg-purple-500/20 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                <span>Friends</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="indian" className="mt-0">
            <LeaderboardTable data={filteredIndianData} isLoading={isIndianLoading} />
          </TabsContent>
          
          <TabsContent value="friends" className="mt-0">
            <LeaderboardTable data={filteredFriendsData} isLoading={isFriendsLoading} />
          </TabsContent>
        </Tabs>
      </div>
      </main>
    </div>
  );
}