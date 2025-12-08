import { apiCall } from '../customApiCalls';
import { API_ENDPOINTS } from '../apiConfig';
import { KycStateTwo } from '@/contexts/authContext';

export const getUserProfile = async (
  token?: string
): Promise<IUserProfileResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetUserProfileData,
    'GET',
    undefined,
    token
  );
};
export const deleteCustomer = async (token: string) => {
  return await apiCall(
    API_ENDPOINTS.AUTH.DeleteAccount,
    'GET',
    undefined,
    token
  );
};
export const getUnreadNotifications = async (
  token?: string
): Promise<INotificationResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetNotifications,
    'GET',
    undefined,
    token
  );
};

export const markAllRead = async (token: string) => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.MarkAllNotificationsAsRead,
    'GET',
    undefined,
    token
  );
};
export const getKycDetails = async (token: string): (Promise<KycStateTwoResponse>) => {
  return await apiCall(
    API_ENDPOINTS.AUTH.GetKycDetails,
    'GET',
    undefined,
    token
  );
};

export const getWalletOverview = async (
  token: string
): Promise<IWalletOverviewResponse> => {
  return await apiCall(
    API_ENDPOINTS.WALLETS.GetWalletOverview,
    'GET',
    undefined,
    token
  );
};

export interface IUserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  profilePicture?: string | null;
  gender: string;
  country: string;
  email: string;
  userName: string;
}

interface IUserProfileResponse {
  status: string;
  data: IUserProfileData;
}

interface INotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read: number;
  created_at: string;
  updated_at: string;
  icon: string;
  iconColor: string;
}

interface INotificationResponse {
  status: string;
  message: string;
  data: INotification[];
}

export interface KycStateTwoResponse {
  status: string;
  message: string;
  data: KycStateTwo;
}

export const getWalletTransactions = async (
  token: string,
  params?: {
    currency?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<IWalletTransactionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.currency) queryParams.append('currency', params.currency);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = queryParams.toString()
    ? `${API_ENDPOINTS.WALLETS.GetWalletTransactions}?${queryParams.toString()}`
    : API_ENDPOINTS.WALLETS.GetWalletTransactions;

  return await apiCall(url, 'GET', undefined, token);
};

export interface IWalletTransaction {
  id: number;
  amount: number;
  currency: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow for additional fields
}

export interface IWalletTransactionsResponse {
  statusCode: number;
  data: {
    transactions: IWalletTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export const getKycStatus = async (
  token: string
): Promise<IKycStatusResponse> => {
  return await apiCall(
    API_ENDPOINTS.KYC.GetKycStatus,
    'GET',
    undefined,
    token
  );
};

export const getTier2Status = async (
  token: string
): Promise<ITier2StatusResponse> => {
  return await apiCall(
    API_ENDPOINTS.KYC.GetTier2Status,
    'GET',
    undefined,
    token
  );
};

export interface IKycTier {
  tier: string;
  status: 'verified' | 'pending' | 'unverified';
  limits: {
    deposit: {
      daily: string;
      monthly: string;
    };
    withdrawal: {
      daily: string;
      monthly: string;
    };
  };
  canUpgrade: boolean;
}

export interface IKycStatusResponse {
  statusCode: number;
  data: {
    currentTier: string;
    tiers: IKycTier[];
  };
  message: string;
}

export interface ITier2StatusResponse {
  statusCode: number;
  data: {
    tier: string;
    status: 'verified' | 'pending' | 'rejected' | 'unverified';
    submission: {
      [key: string]: any;
    };
  };
  message: string;
}

export const getTier3Status = async (token: string): Promise<ITier3StatusResponse> => {
  return await apiCall(API_ENDPOINTS.KYC.GetTier3Status, 'GET', undefined, token);
};

export interface ITier3StatusResponse {
  statusCode: number;
  data: {
    tier: string;
    status: 'verified' | 'pending' | 'rejected' | 'unverified';
    submission: {
      [key: string]: any;
    };
  };
  message: string;
}

export const getTier4Status = async (token: string): Promise<ITier4StatusResponse> => {
  return await apiCall(API_ENDPOINTS.KYC.GetTier4Status, 'GET', undefined, token);
};

export interface ITier4StatusResponse {
  statusCode: number;
  data: {
    tier: string;
    status: 'verified' | 'pending' | 'rejected' | 'unverified';
    submission: {
      [key: string]: any;
    };
  };
  message: string;
}

export const getBillers = async (
  token: string,
  sceneCode: 'airtime' | 'data' | 'betting'
): Promise<IBillersResponse> => {
  const query = new URLSearchParams({ sceneCode }).toString();
  const url = `${API_ENDPOINTS.BILL_PAYMENTS.GetBillers}?${query}`;
  return await apiCall(url, 'GET', undefined, token);
};

export interface IBiller {
  billerId: string;
  billerName: string;
  billerIcon: string;
  minAmount: number | null;
  maxAmount: number | null;
  status: number;
}

export interface IBillersResponse {
  statusCode: number;
  data: {
    sceneCode: string;
    billers: {
      respCode: string;
      respMsg: string;
      data: IBiller[];
      status: boolean;
    };
  };
  message: string;
}

export const getBillPaymentItems = async (
  token: string,
  sceneCode: 'airtime' | 'data' | 'betting',
  billerId: string
): Promise<IBillPaymentItemsResponse> => {
  const query = new URLSearchParams({ sceneCode, billerId }).toString();
  const url = `${API_ENDPOINTS.BILL_PAYMENTS.GetItems}?${query}`;
  return await apiCall(url, 'GET', undefined, token);
};

export interface IBillPaymentItem {
  billerId: string;
  itemId: string;
  itemName: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
  isFixAmount: number; // 0 or 1
  status: number;
}

export interface IBillPaymentItemsResponse {
  statusCode: number;
  data: {
    sceneCode: string;
    billerId: string;
    items: {
      respCode: string;
      respMsg: string;
      data: IBillPaymentItem[] | null;
      status: boolean;
    };
  };
  message: string;
}

// Support Chat Queries
export const getSupportChats = async (
  token: string,
  params?: { status?: 'pending' | 'processing' | 'completed'; page?: number; limit?: number }
): Promise<ISupportChatsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = queryParams.toString() 
    ? `${API_ENDPOINTS.SUPPORT.GetChats}?${queryParams.toString()}`
    : API_ENDPOINTS.SUPPORT.GetChats;
  return await apiCall(url, 'GET', undefined, token);
};

export const getSupportChatById = async (
  token: string,
  chatId: number,
  params?: { page?: number; limit?: number }
): Promise<ISupportChatResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = queryParams.toString()
    ? `${API_ENDPOINTS.SUPPORT.GetChatById}/${chatId}?${queryParams.toString()}`
    : `${API_ENDPOINTS.SUPPORT.GetChatById}/${chatId}`;
  return await apiCall(url, 'GET', undefined, token);
};

export interface ISupportChat {
  id: number;
  subject: string;
  category: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: number;
    message: string;
    senderType: 'user' | 'support';
    createdAt: string;
  };
  agent?: {
    id: number;
    name: string;
    profilePicture?: string;
  };
}

export interface ISupportChatsResponse {
  statusCode: number;
  data: {
    chats: ISupportChat[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface ISupportMessage {
  id: number;
  message: string;
  senderType: 'user' | 'support';
  createdAt: string;
  isRead?: boolean;
}

export interface ISupportChatResponse {
  statusCode: number;
  data: {
    chat: ISupportChat;
    messages: ISupportMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface IWalletOverviewResponse {
  statusCode: number;
  data: {
    wallets: any[];
    totalBalance: number;
    currency: string;
  };
  message: string;
}