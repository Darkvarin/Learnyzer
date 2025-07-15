import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useBattleWebSocket(battleId: string | number, userId: string | number | undefined) {
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    if (!battleId || !userId) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?battleId=${battleId}&userId=${userId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Battle WebSocket connected');
        setConnected(true);
        setReconnectAttempts(0);
        
        // Send authentication message
        sendMessage({
          type: 'auth',
          battleId,
          userId
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Battle WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectDelay * (reconnectAttempts + 1));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Battle WebSocket error:', error);
        setConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnected(false);
    }
  };

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'battle_update':
        // Handle battle state updates
        console.log('Battle update received:', data.payload);
        break;
        
      case 'participant_joined':
        toast({
          title: 'New participant joined',
          description: `${data.payload.name} joined the battle`,
        });
        break;
        
      case 'participant_left':
        toast({
          title: 'Participant left',
          description: `${data.payload.name} left the battle`,
          variant: 'destructive',
        });
        break;
        
      case 'battle_started':
        toast({
          title: 'Battle started!',
          description: 'The battle has begun. Good luck!',
        });
        break;
        
      case 'battle_ended':
        toast({
          title: 'Battle ended',
          description: 'Check the results to see how you performed',
        });
        break;
        
      case 'chat_message':
        // Handle chat messages
        console.log('Chat message received:', data.payload);
        break;
        
      case 'answer_submitted':
        toast({
          title: 'Answer submitted',
          description: 'Your answer has been recorded',
        });
        break;
        
      case 'power_up_activated':
        toast({
          title: 'Power-up activated!',
          description: `${data.payload.name} used ${data.payload.powerUp}`,
        });
        break;
        
      case 'connection_status':
        if (data.payload.status === 'authenticated') {
          console.log('Battle WebSocket authenticated successfully');
        }
        break;
        
      default:
        console.log('Unknown message type:', data.type, data.payload);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  };

  const sendChatMessage = (text: string) => {
    sendMessage({
      type: 'chat_message',
      battleId,
      userId,
      payload: {
        text,
        timestamp: new Date().toISOString()
      }
    });
  };

  const sendAnswer = (answer: string, questionId: string | number) => {
    sendMessage({
      type: 'submit_answer',
      battleId,
      userId,
      payload: {
        answer,
        questionId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const activatePowerUp = (powerUpId: string) => {
    sendMessage({
      type: 'activate_power_up',
      battleId,
      userId,
      payload: {
        powerUpId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const updateStatus = (status: string) => {
    sendMessage({
      type: 'status_update',
      battleId,
      userId,
      payload: {
        status,
        timestamp: new Date().toISOString()
      }
    });
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [battleId, userId]);

  return {
    connected,
    reconnectAttempts,
    sendMessage,
    sendChatMessage,
    sendAnswer,
    activatePowerUp,
    updateStatus
  };
}