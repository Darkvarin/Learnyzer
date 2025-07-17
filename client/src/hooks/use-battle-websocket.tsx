import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

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

interface ChatMessage {
  userId?: number;
  username?: string;
  content: string;
  timestamp: string;
}

export function useBattleWebSocket(battleId?: number) {
  const { user } = useAuth();
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Set<number>>(new Set());
  const [submissions, setSubmissions] = useState<Set<number>>(new Set());
  const [battleCompleted, setBattleCompleted] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!battleId || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = () => {
      setConnected(true);

      
      // Join the battle's virtual room
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'join_battle',
          battleId,
          userId: user.id,
          username: user.username,
          timestamp: new Date().toISOString()
        }));
      }
    };
    
    socketRef.current.onclose = () => {
      setConnected(false);

    };
    
    socketRef.current.onerror = (error) => {

    };
    
    socketRef.current.onmessage = (event) => {
      try {
        const data: BattleWebSocketMessage = JSON.parse(event.data);
        
        if (data.battleId !== battleId) return;
        
        switch (data.type) {
          case 'chat_message':
            if (data.content) {
              setMessages(prev => [...prev, {
                userId: data.userId,
                username: data.username || 'User',
                content: data.content || '',
                timestamp: data.timestamp
              }]);
            }
            break;
            
          case 'participant_joined':
            if (data.userId) {
              setParticipants(prev => {
                const newSet = new Set(prev);
                newSet.add(data.userId!);
                return newSet;
              });
              
              // Add a system message about user joining
              setMessages(prev => [...prev, {
                content: `${data.username || 'A user'} joined the battle`,
                timestamp: data.timestamp
              }]);
            }
            break;
            
          case 'answer_submitted':
            if (data.userId) {
              setSubmissions(prev => {
                const newSet = new Set(prev);
                newSet.add(data.userId!);
                return newSet;
              });
              
              // Add a system message about submission
              setMessages(prev => [...prev, {
                content: `${data.username || 'A user'} submitted their answer`,
                timestamp: data.timestamp
              }]);
            }
            break;
            
          case 'battle_completed':
            setBattleCompleted(true);
            
            // Add a system message about battle completion
            setMessages(prev => [...prev, {
              content: data.message || 'Battle completed! Results will be announced shortly.',
              timestamp: data.timestamp
            }]);
            break;
            
          default:

        }
      } catch (error) {

      }
    };
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [battleId, user]);
  
  // Send a chat message
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !battleId || !user) {
      return;
    }
    
    socketRef.current.send(JSON.stringify({
      type: 'chat_message',
      battleId,
      userId: user.id,
      username: user.username,
      content,
      timestamp: new Date().toISOString()
    }));
  }, [battleId, user]);
  
  // Notify about answer submission
  const submitAnswer = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !battleId || !user) {
      return;
    }
    
    socketRef.current.send(JSON.stringify({
      type: 'answer_submitted',
      battleId,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    }));
  }, [battleId, user]);
  
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