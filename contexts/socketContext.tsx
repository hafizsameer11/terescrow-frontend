import { API_BASE_URL } from '@/utils/apiConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';

interface SocketContextType {
  socket: Socket | null;
  connectToSocket: (
    departmentId: string,
    categoryId: string,
    subCategoryId: string
  ) => void;
  disconnectFromSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();

  const connectToSocket = async (
    departmentId: string,
    categoryId: string,
    subCategoryId: string
  ) => {
    if (socket) {
      socket.disconnect(); // Clean up existing socket connection
    }
    const newSocket = io(API_BASE_URL, {
      query: {
        token: token,
        departmentId,
        categoryId,
        subCategoryId,
      },
    }); // Replace with your server URL
    newSocket.on('connect', () => {
      setSocket(newSocket);
      console.log('Connected to Socket.io server');
    });
    newSocket.on('connect_error', (error) => {
      console.error('Error Connecting toSocket : ', error);
    });
  };

  const disconnectFromSocket = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
    }
  };

  //   useEffect(() => {
  //     // Initialize the socket connection
  //     const newSocket = io(API_BASE_URL); // Replace with your server URL
  //     setSocket(newSocket);

  //     // socket?.on('connect', () => {

  //     // })

  //     // Cleanup on unmount
  //     return () => {
  //         if(newSocket){
  //             newSocket.disconnect();
  //         }
  //     };
  //   }, []);

  return (
    <SocketContext.Provider
      value={{ socket, connectToSocket, disconnectFromSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the SocketContext
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
