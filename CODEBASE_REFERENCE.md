# Terescrow Frontend - Codebase Reference

## Overview
This is a React Native application built with Expo, using Expo Router for navigation, React Query for data fetching, and Socket.io for real-time features.

## Tech Stack
- **Framework**: React Native with Expo (~52.0.7)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API (Auth, Socket, Theme)
- **Data Fetching**: TanStack React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Form Handling**: Formik + Yup validation
- **Storage**: Expo SecureStore (tokens), AsyncStorage (general)
- **Notifications**: Expo Notifications
- **UI**: React Native components + custom components

## Project Structure

```
terescrow-frontend/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home tab
│   │   ├── chat.tsx       # Chat tab
│   │   ├── transactions.tsx
│   │   ├── support.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # Root layout with providers
│   ├── signin.tsx
│   ├── signup.tsx
│   └── ...                # Other screens
├── components/            # Reusable UI components
├── contexts/              # React Context providers
│   ├── authContext.tsx    # Authentication state
│   ├── socketContext.tsx  # Socket.io connection
│   └── themeContext.tsx   # Theme management
├── utils/
│   ├── apiConfig.ts       # API endpoint definitions
│   ├── customApiCalls.ts  # Axios wrapper (apiCall function)
│   ├── mutations/         # POST/PUT/DELETE operations
│   │   ├── authMutations.ts
│   │   └── chatMutations.ts
│   ├── queries/           # GET operations
│   │   ├── accountQueries.ts
│   │   ├── chatQueries.ts
│   │   ├── quickActionQueries.ts
│   │   └── transactionQueries.ts
│   ├── helpers.ts         # Utility functions
│   └── toastConfig.tsx    # Toast notification config
├── constants/             # Constants (colors, icons, etc.)
└── hooks/                 # Custom React hooks
```

## API Architecture

### 1. API Configuration (`utils/apiConfig.ts`)
- **Base URL**: `API_BASE_URL` (currently: `http://10.230.141.151:8000`)
- **API Domain**: `${API_BASE_URL}/api`
- **Endpoints organized by feature**:
  - `AUTH`: Authentication endpoints
  - `ACCOUNT_MANAGEMENT`: User profile management
  - `PUBLIC`: Public endpoints (no auth required)
  - `QUICK_ACTIONS`: Departments, categories, subcategories, etc.
  - `CHATS`: Chat-related endpoints
  - `TRANSACTIONS`: Transaction endpoints

### 2. API Call Function (`utils/customApiCalls.ts`)
- **Function**: `apiCall(url, method, data?, token?)`
- **Methods supported**: GET, POST, PUT, DELETE
- **Features**:
  - Automatic Bearer token injection
  - FormData support (multipart/form-data) - automatically detected
  - Error handling with `ApiError` class
  - Returns response data directly

**Example (JSON data)**:
```typescript
const response = await apiCall(
  API_ENDPOINTS.AUTH.Login,
  'POST',
  { email, password },
  undefined // token (optional)
);
```

**Example (FormData for file uploads)**:
```typescript
import * as ImagePicker from 'expo-image-picker';

const formData = new FormData();
formData.append('message', 'Hello');
formData.append('chatId', chatId);
if (imageUri) {
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  } as any);
}

const response = await apiCall(
  API_ENDPOINTS.CHATS.SendMessage,
  'POST',
  formData,  // FormData automatically sets Content-Type to multipart/form-data
  token
);
```

### 3. Mutations Pattern (`utils/mutations/`)
- **Purpose**: POST, PUT, DELETE operations
- **Structure**: 
  - Export async functions that call `apiCall`
  - Define TypeScript interfaces for request/response types
  - Functions accept data and token as parameters

**Example** (`authMutations.ts`):
```typescript
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.Login, 'POST', data);
};

interface LoginResponse {
  message: string;
  data: { ... };
  token: string;
}
```

### 4. Queries Pattern (`utils/queries/`)
- **Purpose**: GET operations
- **Structure**:
  - Export async functions that call `apiCall`
  - Define TypeScript interfaces for response types
  - Functions accept token and optional query parameters

**Example** (`chatQueries.ts`):
```typescript
export const getAllChats = async (token: string): Promise<IChatResponse> => {
  return await apiCall(
    API_ENDPOINTS.CHATS.GetAllChats,
    'GET',
    undefined,
    token
  );
};
```

### 5. Using in Components
- **Mutations**: Use `useMutation` hook from React Query
- **Queries**: Use `useQuery` hook from React Query

**Example Mutation**:
```typescript
const { mutate, isPending } = useMutation({
  mutationFn: (data) => loginUser(data),
  mutationKey: ["login"],
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error: ApiError) => {
    showTopToast({
      type: "error",
      text1: "Error",
      text2: error.message,
    });
  },
});

// Call it:
mutate({ email, password });
```

**Example Query**:
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ["chats"],
  queryFn: () => getAllChats(token),
  enabled: !!token, // Only run if token exists
  refetchInterval: 1000, // Optional: auto-refetch
});
```

## Authentication Flow

### Auth Context (`contexts/authContext.tsx`)
- **State**: `token` and `userData`
- **Methods**:
  - `setToken(token)`: Saves token to SecureStore and updates state
  - `setUserData(userData)`: Updates user data in state
  - `logout()`: Clears all stored data and navigates to signin

### User Data Structure
```typescript
{
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  gender?: string;
  role?: string;
  country?: string;
  isVerified?: boolean;
  KycStateTwo?: KycStateTwo;
  unReadNotification?: number;
}
```

### Storage Keys
- `authToken`: Current session token (SecureStore)
- `USER_TOKEN`: Persistent token (SecureStore)
- `USER_DATA`: User data JSON (SecureStore)
- `LOGIN_TIMESTAMP`: Last login timestamp (SecureStore)
- `BIOMETRIC_AUTH`: Biometric auth enabled flag (SecureStore)

## Socket.io Integration

### Socket Context (`contexts/socketContext.tsx`)
- **Connection**: Connects to `API_BASE_URL` with token in query params
- **Events**:
  - `connect`: Socket connected
  - `onlineUsers`: Receives list of online agents/admin
  - `newAgentJoined`: New agent came online
  - `user-disconnected`: User disconnected
  - `requestAssignment`: Request agent assignment

### Usage
```typescript
const { socket, onlineAgents, requestAgentConnection } = useSocket();
```

## Error Handling

### ApiError Class
```typescript
class ApiError extends Error {
  data: any;
  statusCode: number;
}
```

### Toast Notifications
- **Helper**: `showTopToast({ type, text1, text2 })`
- **Types**: 'error' | 'success' | 'info'
- **Config**: Defined in `utils/toastConfig.tsx`

## Navigation

### Expo Router
- File-based routing
- Stack navigation in `_layout.tsx`
- Tab navigation in `(tabs)/_layout.tsx`
- Navigation hooks: `useRouter()`, `useNavigation()`

### Common Navigation Patterns
```typescript
import { router } from 'expo-router';
import { useNavigation } from 'expo-router';

// Navigate
router.push('/signin');
router.replace('/signin');

// With params
router.push({
  pathname: '/chatwithagent',
  params: { chatId: '123' }
});

// Reset navigation stack
reset({
  index: 0,
  routes: [{ name: "(tabs)" }],
});
```

## Adding New API Endpoints - Pattern to Follow

### Step 1: Add Endpoint to `apiConfig.ts`
```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  NEW_FEATURE: {
    GetData: API_DOMAIN + '/new-feature/get-data',
    CreateData: API_DOMAIN + '/new-feature/create',
  },
};
```

### Step 2: Create Mutation/Query Function

**For POST/PUT/DELETE** (in `utils/mutations/newFeatureMutations.ts`):
```typescript
import { API_ENDPOINTS } from '../apiConfig';
import { apiCall, ApiResponse } from '../customApiCalls';

export const createData = async (
  data: ICreateDataReq,
  token: string
): Promise<ICreateDataResponse> => {
  return await apiCall(
    API_ENDPOINTS.NEW_FEATURE.CreateData,
    'POST',
    data,
    token
  );
};

interface ICreateDataReq {
  field1: string;
  field2: number;
}

interface ICreateDataResponse extends ApiResponse {
  data: {
    id: number;
    field1: string;
    // ... other fields
  };
}
```

**For GET** (in `utils/queries/newFeatureQueries.ts`):
```typescript
import { apiCall, ApiResponse } from '../customApiCalls';
import { API_ENDPOINTS } from '../apiConfig';

export const getData = async (
  token: string
): Promise<IGetDataResponse> => {
  return await apiCall(
    API_ENDPOINTS.NEW_FEATURE.GetData,
    'GET',
    undefined,
    token
  );
};

interface IGetDataResponse extends ApiResponse {
  data: {
    // ... response structure
  }[];
}
```

**For Path Parameters** (e.g., `/api/endpoint/:id`):
```typescript
export const getDataById = async (
  id: string,
  token: string
): Promise<IGetDataResponse> => {
  return await apiCall(
    API_ENDPOINTS.NEW_FEATURE.GetData + '/' + id,  // Append path param
    'GET',
    undefined,
    token
  );
};
```

**For Query Parameters** (e.g., `/api/endpoint?param1=value1&param2=value2`):
```typescript
export const getDataWithParams = async (
  param1: string,
  param2: string,
  token: string
): Promise<IGetDataResponse> => {
  return await apiCall(
    `${API_ENDPOINTS.NEW_FEATURE.GetData}?param1=${param1}&param2=${param2}`,  // Template literal with query string
    'GET',
    undefined,
    token
  );
};
```

**Real Examples from Codebase**:
- Path param: `API_ENDPOINTS.CHATS.GetChatDetails + '/' + chatId` (chatQueries.ts)
- Query params: `` `${API_ENDPOINTS.QUICK_ACTIONS.GetActionSubacategories}?departmentId=${departmentId}&categoryId=${categoryId}` `` (quickActionQueries.ts)

### Step 3: Use in Component
```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { createData } from '@/utils/mutations/newFeatureMutations';
import { getData } from '@/utils/queries/newFeatureQueries';
import { useAuth } from '@/contexts/authContext';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';

const MyComponent = () => {
  const { token } = useAuth();

  // Query example
  const { data, isLoading } = useQuery({
    queryKey: ['newFeatureData'],
    queryFn: () => getData(token),
    enabled: !!token,
  });

  // Mutation example
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => createData(data, token),
    mutationKey: ['createData'],
    onSuccess: (data) => {
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Data created successfully',
      });
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    },
  });

  return (
    // ... component JSX
  );
};
```

## Key Patterns & Conventions

1. **TypeScript Interfaces**: Always define interfaces for API requests/responses
2. **Error Handling**: Use `ApiError` class and `showTopToast` for user feedback
3. **Token Management**: Always pass token to authenticated endpoints
4. **Query Keys**: Use descriptive, consistent query keys (e.g., `["chats"]`, `["notifications"]`)
5. **Loading States**: Use `isPending` (mutations) or `isLoading` (queries)
6. **Conditional Queries**: Use `enabled: !!token` to prevent queries without auth
7. **Auto-refetch**: Use `refetchInterval` for real-time data (e.g., chat messages)
8. **Query Invalidation**: Use `queryClient.invalidateQueries()` after mutations

## Common Utilities

### `showTopToast(props)`
- Shows toast notification at top of screen
- Types: 'error', 'success', 'info'

### `getImageUrl(imageName)`
- Returns full URL for uploaded images
- Format: `${API_BASE_URL}/uploads/${imageName}`

### `checkOnlineStatus(agentId, onlineUsers)`
- Checks if an agent is online
- Returns boolean

## File Organization Rules

1. **Mutations**: Group by feature (auth, chat, etc.)
2. **Queries**: Group by feature (account, chat, transactions, etc.)
3. **Components**: Organize by feature or type
4. **Screens**: Follow Expo Router file-based routing
5. **Types**: Define interfaces in the same file as the function, or export from mutations/queries

## Notes

- API base URL can be changed in `utils/apiConfig.ts`
- SecureStore is used for sensitive data (tokens)
- AsyncStorage is used for general app data
- Socket connection is automatically established when user is authenticated
- Notifications are handled via Expo Notifications
- Form validation uses Formik + Yup schemas (in `utils/validation.ts`)

