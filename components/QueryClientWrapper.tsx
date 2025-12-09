import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { ApiError } from '@/utils/customApiCalls';

interface QueryClientWrapperProps {
  children: React.ReactNode;
}

export const QueryClientWrapper: React.FC<QueryClientWrapperProps> = ({ children }) => {
  const { logout } = useAuth();

  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // Don't retry on authentication errors
              if (error instanceof ApiError) {
                const errorMessage = (error.message?.toLowerCase() || '') + 
                  (error.data?.message?.toLowerCase() || '');
                if (
                  errorMessage.includes('you are not logged in') ||
                  errorMessage.includes('unauthorized') ||
                  error.statusCode === 401
                ) {
                  // Logout and redirect to login
                  logout();
                  return false;
                }
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            onError: (error, query) => {
              // Skip logout for public queries (signup/signin related)
              const queryKey = query?.queryKey?.[0];
              const isPublicQuery = 
                queryKey === 'get-countries' || 
                queryKey === 'waysOfHearing' || 
                queryKey === 'privacy';
              
              if (isPublicQuery) {
                // Don't logout for public queries - they're expected to work without auth
                return;
              }
              
              // Check for authentication errors
              if (error instanceof ApiError) {
                const errorMessage = (error.message?.toLowerCase() || '') + 
                  (error.data?.message?.toLowerCase() || '');
                if (
                  errorMessage.includes('you are not logged in') ||
                  errorMessage.includes('unauthorized') ||
                  error.statusCode === 401
                ) {
                  // Logout and redirect to login
                  logout();
                  return;
                }
              }
              // Also check if error is a plain object with message
              if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = String((error as any).message || '').toLowerCase();
                if (
                  errorMessage.includes('you are not logged in') ||
                  errorMessage.includes('unauthorized')
                ) {
                  logout();
                }
              }
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry on authentication errors
              if (error instanceof ApiError) {
                const errorMessage = (error.message?.toLowerCase() || '') + 
                  (error.data?.message?.toLowerCase() || '');
                if (
                  errorMessage.includes('you are not logged in') ||
                  errorMessage.includes('unauthorized') ||
                  error.statusCode === 401
                ) {
                  // Logout and redirect to login
                  logout();
                  return false;
                }
              }
              // Don't retry mutations by default
              return false;
            },
            onError: (error) => {
              // Check for authentication errors
              if (error instanceof ApiError) {
                const errorMessage = (error.message?.toLowerCase() || '') + 
                  (error.data?.message?.toLowerCase() || '');
                if (
                  errorMessage.includes('you are not logged in') ||
                  errorMessage.includes('unauthorized') ||
                  error.statusCode === 401
                ) {
                  // Logout and redirect to login
                  logout();
                  return;
                }
              }
              // Also check if error is a plain object with message
              if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = String((error as any).message || '').toLowerCase();
                if (
                  errorMessage.includes('you are not logged in') ||
                  errorMessage.includes('unauthorized')
                ) {
                  logout();
                }
              }
            },
          },
        },
      }),
    [logout]
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

