import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [pusher, setPusher] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (pusher) {
        pusher.disconnect();
        setPusher(null);
        setConnected(false);
      }
      return;
    }

    const pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER || 'ap2',
    });

    pusherInstance.connection.bind('connected', () => setConnected(true));
    pusherInstance.connection.bind('disconnected', () => setConnected(false));
    pusherInstance.connection.bind('error', () => setConnected(false));

    setPusher(pusherInstance);

    return () => {
      pusherInstance.disconnect();
    };
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SocketContext.Provider value={{ pusher, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export default SocketContext;
