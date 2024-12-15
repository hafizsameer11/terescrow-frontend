import { API_BASE_URL } from '@/utils/apiConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';
import { showTopToast } from '@/utils/helpers';
import { UserRoles } from '@/utils/mutations/authMutations';

export interface Agent {
  userId: string;
  socketId: string;
  assignedDepartments: {
    id: string;
  };
}

export interface NonAgentUser {
  userId: string;
  socketId: string;
}

interface SocketContextType {
  socket: Socket | null;
  requestAgentConnection: (
    departmentId: string,
    categoryId: string,
    subCategoryId: string
  ) => void;
  connectToSocket: () => void;
  onlineAgents: NonAgentUser[];
  disconnectFromSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineAgents, setOnlineAgents] = useState<Agent[]>([]);
  const [isAdminOnline, setIsAdminOnline] = useState<
    | {
        userId: string;
        socketId: string;
      }
    | false
  >(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      connectToSocket();
    }

    return () => {
      console.log('disconnecting from socket');
      disconnectFromSocket();
    };
  }, [token]);

  const connectToSocket = async () => {
    if (socket) {
      console.log('cleaning up previous socket');
      socket.disconnect(); // Clean up existing socket connection
    }
    if (token) {
      const newSocket = io(API_BASE_URL, {
        query: {
          token: token,
        },
      }); // Replace with your server URL
      newSocket.on('connect', () => {
        setSocket(newSocket);
        console.log('Connected to Socket.io server');
      });

      newSocket.on(
        'onlineUsers',
        ({ agents, admin }: { agents: Agent[]; admin: NonAgentUser }) => {
          if (agents.length > 0) {
            setOnlineAgents((previous) => {
              return [...previous, ...agents];
            });
          }
          if (admin) {
            setIsAdminOnline({
              userId: admin.userId,
              socketId: admin.socketId,
            });
          }
        }
      );

      newSocket.on('newAgentJoined', (agent: Agent) => {
        console.log(agent);
        setOnlineAgents((prevOnlineAgents) => [...prevOnlineAgents, agent]);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Error Connecting toSocket : ', error);
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to connect to Socket server',
        });
      });

      newSocket.on(
        'user-disconnected',
        ({ id, role }: { id: number; role: UserRoles }) => {
          if (role == UserRoles.admin) {
            setIsAdminOnline(false);
          }
          if (role == UserRoles.agent) {
            setOnlineAgents((prevOnlineAgents) =>
              prevOnlineAgents.filter((agent) => +agent.userId !== id)
            );
          }

          showTopToast({
            type: 'error',
            text1: 'Alert!',
            text2: `A ${role} has been disconnected`,
          });
        }
      );

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.io server');
        console.log(reason);
        setSocket(null);
      });
    }
  };

  const requestAgentConnection = async (
    departmentId: string,
    categoryId: string,
    subCategoryId: string
  ) => {
    if (socket) {
      socket.emit('requestAssignment', {
        departmentId: departmentId,
        categoryId: categoryId,
        subCategoryId: subCategoryId,
      });
    } else {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to connect to Socket server',
      });
    }
  };

  const disconnectFromSocket = () => {
    if (socket) {
      socket.removeAllListeners();
      console.log('socket disconnecting');
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectToSocket,
        requestAgentConnection,
        onlineAgents,
        disconnectFromSocket,
      }}
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
