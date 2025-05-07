import React, { useState } from 'react';
import { useRealTime } from '@/contexts/real-time-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { apiRequest } from '@/lib/queryClient';

export default function WebSocketTestPage() {
  const { user } = useAuth();
  const { connected, reconnecting, lastUpdate, notifications, clearNotification } = useRealTime();
  const [streakDays, setStreakDays] = useState('7');
  const [oldRank, setOldRank] = useState('Bronze');
  const [newRank, setNewRank] = useState('Silver');
  const [rankPoints, setRankPoints] = useState('2000');
  const [achievementName, setAchievementName] = useState('Study Streak Master');
  const [xpGained, setXpGained] = useState('100');
  const [newLevel, setNewLevel] = useState('');
  const [aiToolType, setAiToolType] = useState('notes');

  const sendTestNotification = async () => {
    try {
      await apiRequest('POST', '/api/notifications/test');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const simulateStreakUpdate = async () => {
    try {
      await apiRequest('POST', '/api/notifications/streak', { streakDays: parseInt(streakDays) });
    } catch (error) {
      console.error('Error simulating streak update:', error);
    }
  };

  const simulateRankPromotion = async () => {
    try {
      await apiRequest('POST', '/api/notifications/rank', { 
        oldRank, 
        newRank, 
        rankPoints: parseInt(rankPoints) 
      });
    } catch (error) {
      console.error('Error simulating rank promotion:', error);
    }
  };

  const simulateAchievement = async () => {
    try {
      await apiRequest('POST', '/api/notifications/achievement', { achievementName });
    } catch (error) {
      console.error('Error simulating achievement:', error);
    }
  };

  const simulateXpGained = async () => {
    try {
      const payload: any = { xpGained: parseInt(xpGained) };
      if (newLevel) {
        payload.newLevel = parseInt(newLevel);
      }
      await apiRequest('POST', '/api/notifications/xp', payload);
    } catch (error) {
      console.error('Error simulating XP gained:', error);
    }
  };

  const simulateAiToolCompletion = async () => {
    try {
      await apiRequest('POST', '/api/notifications/ai-tool', { toolType: aiToolType });
    } catch (error) {
      console.error('Error simulating AI tool completion:', error);
    }
  };

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Testing</CardTitle>
            <CardDescription>You need to be logged in to test WebSocket functionality</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-Time WebSocket Testing</CardTitle>
              <CardDescription>Send test notifications to verify WebSocket functionality</CardDescription>
            </div>
            <ConnectionStatus showTooltip={true} iconSize={20} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Connection Status</p>
              <div className="flex gap-2">
                <Badge variant={connected ? "success" : "destructive"}>
                  {connected ? "Connected" : "Disconnected"}
                </Badge>
                {reconnecting && <Badge variant="warning">Reconnecting...</Badge>}
              </div>
            </div>
            <Button onClick={sendTestNotification}>
              Send Test Notification
            </Button>
          </div>

          <Tabs defaultValue="streak">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="streak">Streak</TabsTrigger>
              <TabsTrigger value="rank">Rank</TabsTrigger>
              <TabsTrigger value="achievement">Achievement</TabsTrigger>
              <TabsTrigger value="xp">XP</TabsTrigger>
              <TabsTrigger value="ai">AI Tools</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="streak" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="streakDays">Streak Days</Label>
                  <Input 
                    id="streakDays" 
                    type="number" 
                    value={streakDays} 
                    onChange={(e) => setStreakDays(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={simulateStreakUpdate}>
                Simulate Streak Update
              </Button>
            </TabsContent>

            <TabsContent value="rank" className="space-y-4">
              <div className="grid gap-4 grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="oldRank">Old Rank</Label>
                  <Input 
                    id="oldRank" 
                    value={oldRank} 
                    onChange={(e) => setOldRank(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newRank">New Rank</Label>
                  <Input 
                    id="newRank" 
                    value={newRank} 
                    onChange={(e) => setNewRank(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rankPoints">Rank Points</Label>
                  <Input 
                    id="rankPoints" 
                    type="number"
                    value={rankPoints} 
                    onChange={(e) => setRankPoints(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={simulateRankPromotion}>
                Simulate Rank Promotion
              </Button>
            </TabsContent>

            <TabsContent value="achievement" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="achievementName">Achievement Name</Label>
                  <Input 
                    id="achievementName" 
                    value={achievementName} 
                    onChange={(e) => setAchievementName(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={simulateAchievement}>
                Simulate Achievement Completion
              </Button>
            </TabsContent>

            <TabsContent value="xp" className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="xpGained">XP Gained</Label>
                  <Input 
                    id="xpGained" 
                    type="number"
                    value={xpGained} 
                    onChange={(e) => setXpGained(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newLevel">New Level (optional)</Label>
                  <Input 
                    id="newLevel" 
                    type="number"
                    value={newLevel} 
                    onChange={(e) => setNewLevel(e.target.value)}
                    placeholder="Leave empty for regular XP gain"
                  />
                </div>
              </div>
              <Button onClick={simulateXpGained}>
                Simulate XP Gained
              </Button>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="aiToolType">AI Tool Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      variant={aiToolType === 'notes' ? 'default' : 'outline'}
                      onClick={() => setAiToolType('notes')}
                    >
                      Study Notes
                    </Button>
                    <Button 
                      variant={aiToolType === 'flashcards' ? 'default' : 'outline'}
                      onClick={() => setAiToolType('flashcards')}
                    >
                      Flashcards
                    </Button>
                    <Button 
                      variant={aiToolType === 'insights' ? 'default' : 'outline'}
                      onClick={() => setAiToolType('insights')}
                    >
                      Performance Insights
                    </Button>
                    <Button 
                      variant={aiToolType === 'answer_check' ? 'default' : 'outline'}
                      onClick={() => setAiToolType('answer_check')}
                    >
                      Answer Check
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={simulateAiToolCompletion}>
                Simulate AI Tool Completion
              </Button>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground">No notifications received yet</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex justify-between items-start border rounded-md p-3">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          notification.severity === 'error' ? 'destructive' :
                          notification.severity === 'warning' ? 'warning' :
                          notification.severity === 'info' ? 'secondary' :
                          'default'
                        }>
                          {notification.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="space-y-2 w-full">
            <h3 className="text-sm font-medium">Last Update Message</h3>
            <div className="bg-muted p-3 rounded-md overflow-auto">
              <pre className="text-xs">
                {lastUpdate ? JSON.stringify(lastUpdate, null, 2) : 'No updates received yet'}
              </pre>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}