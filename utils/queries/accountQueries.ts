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

// Payment Queries
export const getBanks = async (
  token: string,
  businessType: number = 0
): Promise<IBanksResponse> => {
  const url = `${API_ENDPOINTS.PAYMENTS.GetBanks}?businessType=${businessType}`;
  return await apiCall(url, 'GET', undefined, token);
};

export const getPayoutStatus = async (
  token: string,
  transactionId: string
): Promise<IPayoutStatusResponse> => {
  const url = `${API_ENDPOINTS.PAYMENTS.GetPayoutStatus}/${transactionId}`;
  return await apiCall(url, 'GET', undefined, token);
};

export interface IBank {
  bankCode: string;
  bankName: string;
  bankUrl: string;
  bgUrl: string;
}

export interface IBanksResponse extends ApiResponse {
  statusCode: number;
  data: IBank[];
  message: string;
}

export interface IPayoutStatusResponse extends ApiResponse {
  statusCode: number;
  data: {
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

// Crypto Asset Queries
export const getCryptoAssets = async (
  token: string
): Promise<ICryptoAssetsResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetAssets, 'GET', undefined, token);
};

export const getCryptoAssetById = async (
  token: string,
  assetId: number
): Promise<ICryptoAssetDetailResponse> => {
  const url = `${API_ENDPOINTS.CRYPTO.GetAssetById}/${assetId}`;
  return await apiCall(url, 'GET', undefined, token);
};

export interface ICryptoAsset {
  id: number;
  currency: string;
  blockchain: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUsd: string;
  balanceNaira: string;
  price: string;
  nairaPrice: string;
  depositAddress: string;
  active: boolean;
  frozen: boolean;
}

export interface ICryptoAssetsResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    assets: ICryptoAsset[];
    totals: {
      totalUsd: string;
      totalNaira: string;
    };
    count: number;
  };
}

export interface ICryptoAssetDetail {
  id: number;
  currency: string;
  blockchain: string;
  symbol: string;
  name: string;
  accountCode: string;
  accountId: string;
  availableBalance: string;
  accountBalance: string;
  availableBalanceUsd: string;
  accountBalanceUsd: string;
  availableBalanceNaira: string;
  accountBalanceNaira: string;
  price: string;
  nairaPrice: string;
  active: boolean;
  frozen: boolean;
  depositAddresses: any[];
  primaryDepositAddress: string;
  transactions?: ICryptoTransaction[];
  transactionCount?: number;
  walletCurrency: any;
}

export interface ICryptoAssetDetailResponse extends ApiResponse {
  status: number;
  message: string;
  data: ICryptoAssetDetail;
}

// Crypto Buy/Sell Currency Queries
export interface ICryptoCurrency {
  id: number;
  currency: string;
  blockchain: string;
  name: string;
  symbol: string;
  price: string;
  nairaPrice: string;
  isToken: boolean;
  tokenType: string | null;
  blockchainName: string;
  displayName: string;
  availableBalance?: string;
  virtualAccountId?: number;
}

export interface IBuyCurrenciesResponse extends ApiResponse {
  status: string;
  message: string;
  data: {
    currencies: ICryptoCurrency[];
  };
}

export interface ISellCurrenciesResponse extends ApiResponse {
  status: string;
  message: string;
  data: {
    currencies: ICryptoCurrency[];
  };
}

export const getBuyCurrencies = async (
  token: string
): Promise<IBuyCurrenciesResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetBuyCurrencies, 'GET', undefined, token);
};

export const getSellCurrencies = async (
  token: string
): Promise<ISellCurrenciesResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetSellCurrencies, 'GET', undefined, token);
};

// Buy Quote
export interface IBuyQuoteRequest {
  amount: number;
  currency: string;
  blockchain: string;
}

export interface IBuyQuoteResponse extends ApiResponse {
  status: string;
  message: string;
  data: {
    amountCrypto: string;
    amountUsd: string;
    amountNgn: string;
    rateUsdToCrypto: string;
    rateNgnToUsd: string;
    currency: string;
    blockchain: string;
    currencyName: string;
    currencySymbol: string;
  };
}

export const getBuyQuote = async (
  token: string,
  data: IBuyQuoteRequest
): Promise<IBuyQuoteResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetBuyQuote, 'POST', data, token);
};

// Sell Preview
export interface ISellPreviewRequest {
  amount: number;
  currency: string;
  blockchain: string;
}

export interface ISellPreviewResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    currency: string;
    blockchain: string;
    currencyName: string;
    currencySymbol: string;
    amountCrypto: string;
    amountUsd: string;
    amountNgn: string;
    rateCryptoToUsd: string;
    rateUsdToNgn: string;
    cryptoBalanceBefore: string;
    fiatBalanceBefore: string;
    cryptoBalanceAfter: string;
    fiatBalanceAfter: string;
    hasSufficientBalance: boolean;
    canProceed: boolean;
    virtualAccountId: number;
    fiatWalletId: string;
  };
}

export const getSellPreview = async (
  token: string,
  data: ISellPreviewRequest
): Promise<ISellPreviewResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetSellPreview, 'POST', data, token);
};

// Sell Quote
export interface ISellQuoteRequest {
  amount: number;
  currency: string;
  blockchain: string;
}

export interface ISellQuoteResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    amountCrypto: string;
    amountUsd: string;
    amountNgn: string;
    rateCryptoToUsd: string;
    rateUsdToNgn: string;
    currency: string;
    blockchain: string;
    currencyName: string;
    currencySymbol: string;
  };
}

export const getSellQuote = async (
  token: string,
  data: ISellQuoteRequest
): Promise<ISellQuoteResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetSellQuote, 'POST', data, token);
};

// Get Deposit Address
export interface IReceiveAddressResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    address: string;
    blockchain: string;
    currency: string;
    accountCurrency?: string;
    accountBlockchain?: string;
    virtualAccountId: number;
    balance: string;
    balanceUsd: string;
    balanceNaira: string;
    symbol: string;
    currencyName?: string;
    addressShared?: boolean;
  };
}

export const getReceiveAddress = async (
  token: string,
  accountId: number
): Promise<IReceiveAddressResponse> => {
  const url = `${API_ENDPOINTS.CRYPTO.GetReceiveAddress}/${accountId}`;
  return await apiCall(url, 'GET', undefined, token);
};

// Swap Queries
export interface ISwapCurrency {
  id: number;
  currency: string;
  blockchain: string;
  name: string;
  symbol: string;
  price: string;
  nairaPrice: string;
  isToken: boolean;
  tokenType: string | null;
  blockchainName: string;
  availableBalance: string;
  virtualAccountId: number;
  displayName: string;
}

export interface ISwapCurrenciesResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    currencies: ISwapCurrency[];
  };
}

export const getSwapCurrencies = async (
  token: string
): Promise<ISwapCurrenciesResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetSwapCurrencies, 'GET', undefined, token);
};

export interface ISwapQuoteRequest {
  fromAmount: number;
  fromCurrency: string;
  fromBlockchain: string;
  toCurrency: string;
  toBlockchain: string;
}

export interface ISwapQuoteResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    fromAmount: string;
    fromAmountUsd: string;
    toAmount: string;
    toAmountUsd: string;
    gasFee: string;
    gasFeeUsd: string;
    totalAmount: string;
    totalAmountUsd: string;
    rateFromToUsd: string;
    rateToToUsd: string;
    fromCurrency: string;
    fromBlockchain: string;
    toCurrency: string;
    toBlockchain: string;
    fromCurrencyName: string;
    fromCurrencySymbol: string;
    toCurrencyName: string;
    toCurrencySymbol: string;
  };
}

export const getSwapQuote = async (
  token: string,
  data: ISwapQuoteRequest
): Promise<ISwapQuoteResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetSwapQuote, 'POST', data, token);
};

export interface ISwapPreviewRequest {
  fromAmount: number;
  fromCurrency: string;
  fromBlockchain: string;
  toCurrency: string;
  toBlockchain: string;
}

export interface ISwapPreviewResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    fromAmount: string;
    fromAmountUsd: string;
    toAmount: string;
    toAmountUsd: string;
    gasFee: string;
    gasFeeUsd: string;
    totalAmount: string;
    totalAmountUsd: string;
    rateFromToUsd: string;
    rateToToUsd: string;
    fromCurrency: string;
    fromBlockchain: string;
    toCurrency: string;
    toBlockchain: string;
    fromBalanceBefore: string;
    toBalanceBefore: string;
    fromBalanceAfter: string;
    toBalanceAfter: string;
    hasSufficientBalance: boolean;
    canProceed: boolean;
    fromVirtualAccountId: number;
    toVirtualAccountId: number;
  };
}

export const getSwapPreview = async (
  token: string,
  data: ISwapPreviewRequest
): Promise<ISwapPreviewResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetSwapPreview, 'POST', data, token);
};

// Crypto Transactions Queries
export interface ICryptoTransaction {
  id: string;
  type: string; // BUY, SELL, SWAP, etc.
  status: string;
  amount: string;
  currency: string;
  fromCurrency?: string;
  toCurrency?: string;
  fromAmount?: string;
  toAmount?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For additional fields
}

export interface ICryptoTransactionsResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    transactions: ICryptoTransaction[];
    total: number;
    limit: number;
    offset: number;
    isMockData?: boolean;
  };
}

export interface ICryptoTransactionDetailResponse extends ApiResponse {
  status: number;
  message: string;
  data: ICryptoTransaction;
}

export const getCryptoTransactions = async (
  token: string,
  params?: {
    type?: string; // BUY, SELL, SWAP
    limit?: number;
    offset?: number;
  }
): Promise<ICryptoTransactionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const url = queryParams.toString()
    ? `${API_ENDPOINTS.CRYPTO.GetTransactions}?${queryParams.toString()}`
    : API_ENDPOINTS.CRYPTO.GetTransactions;

  return await apiCall(url, 'GET', undefined, token);
};

export const getCryptoTransactionById = async (
  token: string,
  transactionId: string
): Promise<ICryptoTransactionDetailResponse> => {
  const url = `${API_ENDPOINTS.CRYPTO.GetTransactionById}/${transactionId}`;
  return await apiCall(url, 'GET', undefined, token);
};

// Crypto Rates Interfaces
export interface ICryptoRate {
  id: number;
  transactionType: string;
  minAmount: string;
  maxAmount: string | null;
  rate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICryptoRatesResponse {
  status: number;
  message: string;
  data: {
    BUY: ICryptoRate[];
    SELL: ICryptoRate[];
    SWAP: ICryptoRate[];
    SEND: ICryptoRate[];
    RECEIVE: ICryptoRate[];
  };
}

// Get all crypto rates
export const getAllCryptoRates = async (
  token: string
): Promise<ICryptoRatesResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.GetAllCryptoRates, 'GET', undefined, token);
};

// Transaction Overview Interfaces
export interface ITransactionOverviewType {
  type: string;
  totalUsd: string;
  totalNgn: string;
  percentage: number;
  count: number;
  latestDate: string | null;
  icon: string;
}

export interface ITransactionOverviewChart {
  totalUsd: string;
  totalNgn: string;
  types: ITransactionOverviewType[];
}

export interface ITransactionOverviewResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    chart: ITransactionOverviewChart;
    history: ITransactionOverviewType[];
  };
}

// Get transaction overview
export const getTransactionOverview = async (
  token: string
): Promise<ITransactionOverviewResponse> => {
  return await apiCall(API_ENDPOINTS.TRANSACTIONS.GetTransactionOverview, 'GET', undefined, token);
};

// Gift Card Orders Interfaces
export interface IGiftCardOrder {
  orderId: string;
  reloadlyOrderId?: number;
  reloadlyTransactionId?: number;
  status: string;
  productName: string;
  brandName: string;
  productImage?: string;
  faceValue: number;
  totalAmount: number;
  fees: number;
  currencyCode: string;
  quantity: number;
  cardType?: string;
  countryCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  recipientEmail?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  [key: string]: any;
}

export interface IGiftCardOrdersResponse {
  status: number;
  message: string;
  data: {
    orders: IGiftCardOrder[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Get gift card orders
export const getGiftCardOrders = async (
  token: string,
  params?: {
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<IGiftCardOrdersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = queryParams.toString()
    ? `${API_ENDPOINTS.GIFT_CARDS.GetOrders}?${queryParams.toString()}`
    : API_ENDPOINTS.GIFT_CARDS.GetOrders;

  return await apiCall(url, 'GET', undefined, token);
};

// Get single gift card order by orderId
export interface IGiftCardOrderDetailResponse {
  status: number;
  message: string;
  data: IGiftCardOrder;
}

export const getGiftCardOrderById = async (
  token: string,
  orderId: string
): Promise<IGiftCardOrderDetailResponse> => {
  const url = `${API_ENDPOINTS.GIFT_CARDS.GetOrderById}/${orderId}`;
  return await apiCall(url, 'GET', undefined, token);
};

// Bill Payment History Interfaces
export interface IBillPaymentHistoryItem {
  id: string;
  transactionId?: string;
  sceneCode: string;
  billType: string;
  billerId: string;
  billerName: string;
  itemId?: string;
  itemName?: string;
  rechargeAccount?: string;
  amount: string;
  currency: string;
  status: string;
  palmpayOrderId?: string;
  palmpayOrderNo?: string;
  palmpayStatus?: string;
  billReference?: string;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  [key: string]: any;
}

export interface IBillPaymentHistoryResponse {
  status: number;
  message: string;
  data: {
    transactions: IBillPaymentHistoryItem[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Get bill payment history
export const getBillPaymentHistory = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    sceneCode?: string;
    billerId?: string;
    status?: string;
  }
): Promise<IBillPaymentHistoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sceneCode) queryParams.append('sceneCode', params.sceneCode);
  if (params?.billerId) queryParams.append('billerId', params.billerId);
  if (params?.status) queryParams.append('status', params.status);

  const url = queryParams.toString()
    ? `${API_ENDPOINTS.BILL_PAYMENTS.GetHistory}?${queryParams.toString()}`
    : API_ENDPOINTS.BILL_PAYMENTS.GetHistory;

  return await apiCall(url, 'GET', undefined, token);
};

// Get single bill payment detail
export interface IBillPaymentDetailResponse {
  status: number;
  message: string;
  data: {
    orderStatus?: any;
    billPayment: IBillPaymentHistoryItem;
  };
}

export const getBillPaymentById = async (
  token: string,
  billPaymentId: string
): Promise<IBillPaymentDetailResponse> => {
  const url = `${API_ENDPOINTS.BILL_PAYMENTS.GetOrderStatus}?billPaymentId=${billPaymentId}`;
  return await apiCall(url, 'GET', undefined, token);
};