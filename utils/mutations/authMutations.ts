import { API_ENDPOINTS } from '../apiConfig';
import { apiCall, ApiResponse } from '../customApiCalls';

export const registerUser = async (data: IRegisterReq) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.Register, 'POST', data);
};
export const editUser = async (data: IRegisterReq, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.EditProfile, 'POST', data, token);
};
export const KyCRequest = async (data: IKycReques, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.KyCRequest, 'POST', data, token);
};
export const chnagePassword = async (data: IChangePasswordReq, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.ChangePassword, 'POST', data, token);
};
export const setNewPassword = async (data: ISetNewPasswordReq, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.SetNewPassword, 'POST', data, token);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.Login, 'POST', data);
};

export const verifyEmailOtp = async (
  token: string,
  otp: string,
  userId?: number
): Promise<IVerifyEmailOtpResponse> => {
  const data: { otp: string; userId?: number } = { otp: otp };
  if (userId) {
    data.userId = userId;
  }
  const response = await apiCall(API_ENDPOINTS.AUTH.VerifyEmailOtp, 'POST', data, token);
  console.log('verifyEmailOtp response:', response);
  return response;
};

export const verifyPasswordOtp = async (email: string, otp: string) => {
  const data = {
    email: email,
    otp: otp,
  };
  return await apiCall(
    API_ENDPOINTS.AUTH.VerifyPasswordOtp,
    'POST',
    data,
    undefined
  );
};

export const forgotPassword = async (data: {
  email: string;
}): Promise<IForgotPasswordOtp> => {
  return await apiCall(API_ENDPOINTS.AUTH.ForgotPassword, 'POST', data);
};

export const resendOtp = async (token?: string, email?: string) => {
  if (token) {
    return await apiCall(API_ENDPOINTS.AUTH.ResendOtp, 'POST', { token });
  }
  if (email) {
    return await apiCall(API_ENDPOINTS.AUTH.ResendOtp, 'POST', { email });
  }
};

// notifications



export const getNotifications = async (
  token: string
): Promise<NotificationResponse> => {
  return await apiCall(
    API_ENDPOINTS.AUTH.Notifications ,
    'GET',
    undefined,
    token
  );
};
export const markAllRead = async (
  token: string
): Promise<NotificationResponse> => {
  return await apiCall(
    API_ENDPOINTS.AUTH.MarkAllRead ,
    'GET',
    undefined,
    token
  );
};

export const setPin = async (
  data: ISetPinReq,
  token: string
): Promise<ISetPinResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.SetPin, 'POST', data, token);
};
interface Notification {
  id: number;
  title: string;
  description: string;
  userId: number;
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  status: string;
  message: string;
  data: Notification[];
}

export enum UserRoles {
  admin = 'admin',
  customer = 'customer',
  agent = 'agent',
}

interface LoginResponse {
  message: string;
  data: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    role: UserRoles;
    profilePicture: string | undefined;
  };
  token: string;
}

interface IForgotPasswordOtp extends ApiResponse {
  data: {
    email: string;
  };
}
interface IRegisterReq {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  username: string;
  gender: string;
  country: string;
}

interface IKycReques{
  surName?: string;
  firstName?: string;
  bvn?: string;
dob?: string;
}

export const submitTier2Kyc = async (
  data: FormData,
  token: string
): Promise<ITier2KycResponse> => {
  return await apiCall(API_ENDPOINTS.KYC.SubmitTier2, 'POST', data, token);
};

interface ITier2KycResponse extends ApiResponse {
  data: {
    tier: string;
    status: string;
    message: string;
  };
}

export const submitTier3Kyc = async (
  data: FormData,
  token: string
): Promise<ITier3KycResponse> => {
  return await apiCall(API_ENDPOINTS.KYC.SubmitTier3, 'POST', data, token);
};

interface ITier3KycResponse extends ApiResponse {
  data: {
    tier: string;
    status: string;
    message: string;
  };
}

export const submitTier4Kyc = async (
  data: FormData,
  token: string
): Promise<ITier4KycResponse> => {
  return await apiCall(API_ENDPOINTS.KYC.SubmitTier4, 'POST', data, token);
};

interface ITier4KycResponse extends ApiResponse {
  data: {
    tier: string;
    status: string;
    message: string;
  };
}

interface IChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}
interface ISetNewPasswordReq {
  userId: number;
  password: string;
}

interface ISetPinReq {
  email: string;
  pin: string;
}

interface ISetPinResponse extends ApiResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    email: string;
    pinSet: boolean;
  };
}

interface IVerifyEmailOtpResponse extends ApiResponse {
  status: 'success' | 'error';
  message: string;
  data: null;
}

export const createBillPaymentOrder = async (
  data: ICreateBillPaymentOrderReq,
  token: string
): Promise<ICreateBillPaymentOrderResponse> => {
  // Ensure all required fields are present and properly formatted
  const requestData = {
    sceneCode: data.sceneCode,
    billerId: data.billerId,
    itemId: data.itemId || '', // Send empty string if not provided (required by backend)
    rechargeAccount: data.rechargeAccount,
    amount: data.amount,
    pin: data.pin,
  };

  console.log('Creating bill payment order:', {
    sceneCode: requestData.sceneCode,
    billerId: requestData.billerId,
    itemId: requestData.itemId || '(empty)',
    rechargeAccount: requestData.rechargeAccount,
    amount: requestData.amount,
    pin: '****',
  });

  return await apiCall(API_ENDPOINTS.BILL_PAYMENTS.CreateOrder, 'POST', requestData, token);
};

export interface ICreateBillPaymentOrderReq {
  sceneCode: 'airtime' | 'data' | 'betting';
  billerId: string;
  itemId?: string; // Optional in request, but always sent to API (empty string if not provided)
  rechargeAccount: string; // Phone number for airtime/data, user ID for betting
  amount: number;
  pin: string;
}

export interface ICreateBillPaymentOrderResponse extends ApiResponse {
  data: {
    transactionId: string;
    billPaymentId: string;
    orderNo: string;
    outOrderNo: string;
    sceneCode: string;
    billerId: string;
    itemId?: string;
    rechargeAccount: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export const verifyBillPaymentAccount = async (
  data: IVerifyBillPaymentAccountReq,
  token: string
): Promise<IVerifyBillPaymentAccountResponse> => {
  return await apiCall(API_ENDPOINTS.BILL_PAYMENTS.VerifyAccount, 'POST', data, token);
};

export interface IVerifyBillPaymentAccountReq {
  sceneCode: 'airtime' | 'data' | 'betting';
  rechargeAccount: string;
  billerId: string;
  itemId?: string; // Optional, required for betting
}

export interface IVerifyBillPaymentAccountResponse extends ApiResponse {
  data: {
    valid: boolean;
    biller?: string;
  };
}

// Support Chat Mutations
export const createSupportChat = async (
  data: ICreateSupportChatReq,
  token: string
): Promise<ICreateSupportChatResponse> => {
  return await apiCall(API_ENDPOINTS.SUPPORT.CreateChat, 'POST', data, token);
};

export interface ICreateSupportChatReq {
  subject: string;
  category: string;
  initialMessage: string;
}

export interface ICreateSupportChatResponse extends ApiResponse {
  data: {
    id: number;
    subject: string;
    category: string;
    status: 'pending' | 'processing' | 'completed';
    createdAt: string;
    updatedAt: string;
  };
}

export const sendSupportMessage = async (
  chatId: number,
  data: ISendSupportMessageReq,
  token: string
): Promise<ISendSupportMessageResponse> => {
  return await apiCall(`${API_ENDPOINTS.SUPPORT.SendMessage}/${chatId}/messages`, 'POST', data, token);
};

export interface ISendSupportMessageReq {
  message: string;
  senderType: 'user' | 'support';
}

export interface ISendSupportMessageResponse extends ApiResponse {
  data: {
    id: number;
    message: string;
    senderType: 'user' | 'support';
    createdAt: string;
  };
}

export const markSupportMessagesRead = async (
  chatId: number,
  token: string
): Promise<ApiResponse> => {
  return await apiCall(`${API_ENDPOINTS.SUPPORT.MarkMessagesRead}/${chatId}/messages/read`, 'PUT', undefined, token);
}

// Verify PIN Mutation
export interface IVerifyPinReq {
  pin: string;
}

export interface IVerifyPinResponse extends ApiResponse {
  data: {
    verified: boolean;
    email: string;
  };
}

export const verifyPin = async (
  data: IVerifyPinReq,
  token: string
): Promise<IVerifyPinResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.VerifyPin, 'POST', data, token);
};

// Gift Card Purchase Mutation
export interface IPurchaseGiftCardReq {
  productId: number;
  quantity: number;
  unitPrice: number;
  senderName: string;
  pin: string;
}

export interface IPurchaseGiftCardResponse extends ApiResponse {
  data: {
    transactionId: number;
    amount: number;
    discount: number;
    currencyCode: string;
    fee: number;
    totalFee: number;
    recipientEmail: string;
    customIdentifier: string;
    status: string;
    product: {
      productId: number;
      productName: string;
      countryCode: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      currencyCode: string;
      brand: {
        brandId: number;
        brandName: string;
      };
    };
    transactionCreatedTime: string;
    preOrdered: boolean;
    balanceInfo: {
      oldBalance: number;
      newBalance: number;
      cost: number;
      currencyCode: string;
      currencyName: string;
      updatedAt: string;
    };
    orderId: string;
  };
}

export const purchaseGiftCard = async (
  data: IPurchaseGiftCardReq,
  token: string
): Promise<IPurchaseGiftCardResponse> => {
  return await apiCall(API_ENDPOINTS.GIFT_CARDS.Purchase, 'POST', data, token);
}

// Payment Mutations
export const verifyBankAccount = async (
  data: IVerifyBankAccountReq,
  token: string
): Promise<IVerifyBankAccountResponse> => {
  return await apiCall(API_ENDPOINTS.PAYMENTS.VerifyAccount, 'POST', data, token);
};

export const initiatePayout = async (
  data: IInitiatePayoutReq,
  token: string
): Promise<IInitiatePayoutResponse> => {
  return await apiCall(API_ENDPOINTS.PAYMENTS.InitiatePayout, 'POST', data, token);
};

export interface IVerifyBankAccountReq {
  bankCode: string;
  accountNumber: string;
}

export interface IVerifyBankAccountResponse extends ApiResponse {
  statusCode: number;
  data: {
    accountName: string;
    accountStatus: number;
    isValid: boolean;
  };
  message: string;
}

export interface IInitiatePayoutReq {
  amount: number;
  currency: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  phoneNumber: string;
}

export interface IInitiatePayoutResponse extends ApiResponse {
  statusCode: number;
  data: {
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
  };
  message: string;
}

// Crypto Buy Mutation
export interface IBuyCryptoRequest {
  amount: number;
  currency: string;
  blockchain: string;
}

export interface IBuyCryptoResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    transactionId: string;
    amountCrypto: string;
    amountUsd: string;
    amountNgn: string;
    rateUsdToCrypto: string;
    rateNgnToUsd: string;
    fiatWalletId: string;
    virtualAccountId: number;
    balanceBefore: string;
    balanceAfter: string;
    cryptoBalanceBefore: string;
    cryptoBalanceAfter: string;
  };
}

export const buyCrypto = async (
  token: string,
  data: IBuyCryptoRequest
): Promise<IBuyCryptoResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.ExecuteBuy, 'POST', data, token);
};

// Crypto Sell Mutation
export interface ISellCryptoRequest {
  amount: number;
  currency: string;
  blockchain: string;
}

export interface ISellCryptoResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    transactionId: string;
    amountCrypto: string;
    amountUsd: string;
    amountNgn: string;
    rateCryptoToUsd: string;
    rateUsdToNgn: string;
    fiatWalletId: string;
    virtualAccountId: number;
    cryptoBalanceBefore: string;
    cryptoBalanceAfter: string;
    balanceBefore: string;
    balanceAfter: string;
  };
}

export const sellCrypto = async (
  token: string,
  data: ISellCryptoRequest
): Promise<ISellCryptoResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.ExecuteSell, 'POST', data, token);
};

// Crypto Swap Mutation
export interface ISwapCryptoRequest {
  fromAmount: number;
  fromCurrency: string;
  fromBlockchain: string;
  toCurrency: string;
  toBlockchain: string;
}

export interface ISwapCryptoResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    transactionId: string;
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
    fromVirtualAccountId: number;
    toVirtualAccountId: number;
    fromBalanceBefore: string;
    fromBalanceAfter: string;
    toBalanceBefore: string;
    toBalanceAfter: string;
  };
}

export const swapCrypto = async (
  token: string,
  data: ISwapCryptoRequest
): Promise<ISwapCryptoResponse> => {
  return await apiCall(API_ENDPOINTS.CRYPTO.ExecuteSwap, 'POST', data, token);
};

// Deposit Mutations
export interface IInitiateDepositRequest {
  amount: number;
  currency: string;
}

export interface IInitiateDepositResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    transactionId: string;
    checkoutUrl: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface IGetDepositStatusResponse extends ApiResponse {
  status: number;
  message: string;
  data: {
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export const initiateDeposit = async (
  data: IInitiateDepositRequest,
  token: string
): Promise<IInitiateDepositResponse> => {
  return await apiCall(API_ENDPOINTS.PAYMENTS.InitiateDeposit, 'POST', data, token);
};

export const getDepositStatus = async (
  transactionId: string,
  token: string
): Promise<IGetDepositStatusResponse> => {
  return await apiCall(`${API_ENDPOINTS.PAYMENTS.GetDepositStatus}/${transactionId}`, 'GET', undefined, token);
};


