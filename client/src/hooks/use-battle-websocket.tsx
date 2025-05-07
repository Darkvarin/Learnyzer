import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface BattleWebSocketMessage {
  type: string;
  battleId: number;
  userId?: number;
  username?: string;
  content?: string;
  user?: {
    id: number;
    username: string;
    profileImage?: string;
  };
  team?: number;
  message?: string;
  timestamp: string;
}

export function useBattleWebSocket(battleId?: number) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<BattleWebSocketMessage[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Set<number>>(new Set());
  const [battleCompleted, setBattleCompleted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user || !user.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const webSocket = new WebSocket(wsUrl);

    webSocket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);

      // Authenticate with the WebSocket server
      webSocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));

      // Join battle if battleId is provided
      if (battleId) {
        webSocket.send(JSON.stringify({
          type: 'join_battle',
          userId: user.id,
          battleId: battleId
        }));
      }
    };

    webSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BattleWebSocketMessage;
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'user_joined':
            if (data.user && !participants.some(p => p.id === data.user?.id)) {
              setParticipants(prev => [...prev, data.user]);
              
              // Show toast notification
              toast({
                title: `${data.user.username} joined the battle`,
                duration: 3000
              });
            }
            break;
            
          case 'user_left':
            if (data.userId) {
              setParticipants(prev => prev.filter(p => p.id !== data.userId));
              
              // Show toast notification if we have the username
              if (data.username) {
                toast({
                  title: `${data.username} left the battle`,
                  duration: 3000
                });
              }
            }
            break;
            
          case 'message':
            setMessages(prev => [...prev, data]);
            break;
            
          case 'submission_update':
            if (data.userId) {
              setSubmissions(prev => new Set([...prev, data.userId]));
              
              // Show toast notification
              if (data.username) {
                toast({
                  title: `${data.username} submitted an answer`,
                  duration: 3000
                });
              }
            }
            break;
            
          case 'battle_completed':
            setBattleCompleted(true);
            
            // Show toast notification
            toast({
              title: 'Battle completed',
              description: data.message || 'All participants have submitted their answers.',
              duration: 5000
            });
            break;
        }
        
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    setSocket(webSocket);

    return () => {
      webSocket.close();
    };
  }, [user, battleId]);

  // Function to send messages
  const sendMessage = useCallback((content: string) => {
    if (socket && connected && battleId && user) {
      socket.send(JSON.stringify({
        type: 'battle_message',
        userId: user.id,
        battleId: battleId,
        content
      }));
    }
  }, [socket, connected, battleId, user]);

  // Function to notify about submission
  const submitAnswer = useCallback(() => {
    if (socket && connected && battleId && user) {
      socket.send(JSON.stringify({
        type: 'battle_submission',
        userId: user.id,
        battleId: battleId
      }));
    }
  }, [socket, connected, battleId, user]);

  return {
    connected,
    messages,
    participants,
    submissions,
    battleCompleted,
    sendMessage,
    submitAnswer
  };
}