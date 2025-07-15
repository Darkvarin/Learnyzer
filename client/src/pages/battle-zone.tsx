import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sword, Flame, Trophy } from "lucide-react";

export default function BattleZone() {
  const { toast } = useToast();

  // Fetch battles
  const { data: battles, isLoading } = useQuery({
    queryKey: ["/api/battles"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <MobileNavigation />
        <div className="pt-20 px-4">
          <div className="text-center py-12">
            <div className="text-white">Loading battles...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <MobileNavigation />
      
      <div className="pt-20 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Sword className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Battle Zone
          </h1>
        </div>

        {/* Active Battles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Active Battles
          </h2>
          
          {battles?.active?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.active.map((battle: any) => (
                <div key={battle.id} className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 p-6 rounded-lg border border-cyan-500/30">
                  <h3 className="font-bold text-white mb-2">{String(battle.title || 'Untitled Battle')}</h3>
                  <div className="text-sm text-gray-300 mb-2">
                    Type: {String(battle.type || 'Unknown')}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    Exam: {String(battle.examType || 'Unknown')}
                  </div>
                  <div className="text-sm text-gray-300 mb-4">
                    Subject: {String(battle.subject || 'Unknown')}
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                    Join Battle
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sword className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No active battles right now</p>
              <p className="text-sm text-gray-500">Create a new battle to start competing!</p>
            </div>
          )}
        </div>

        {/* Past Battles */}
        {battles?.past?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Battle History
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.past.slice(0, 6).map((battle: any) => (
                <div key={battle.id} className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 p-6 rounded-lg border border-purple-500/30">
                  <h3 className="font-bold text-white mb-2">{String(battle.title || 'Untitled Battle')}</h3>
                  <div className="text-sm text-gray-300 mb-2">
                    Type: {String(battle.type || 'Unknown')}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    Subject: {String(battle.subject || 'Unknown')}
                  </div>
                  <div className="text-sm text-gray-400">
                    Status: {String(battle.status || 'Unknown')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}