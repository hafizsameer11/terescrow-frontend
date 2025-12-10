// export const API_BASE_URL = 'https://46.202.154.203';
export const API_BASE_URL = 'http://10.230.141.151:8000';


export const API_DOMAIN = API_BASE_URL + '/api';
// `${API_BASE_URL}/api/auth`;
export const API_ENDPOINTS = {
  AUTH: {
    Login: API_DOMAIN + '/public/login',
    MarkAllRead: API_DOMAIN + '/public/mark-all-read',
    Register: API_DOMAIN + '/auth/customer/register',
    Logout: API_DOMAIN + '/auth/logout',
    VerifyEmailOtp: API_DOMAIN + '/auth/verify-email-otp',
    ResendOtp: API_DOMAIN + '/auth/resend-otp',
    ForgotPassword: API_DOMAIN + '/auth/forgot-password',
    VerifyPasswordOtp: API_DOMAIN + '/auth/verify-forgot-password-otp',
    ResetPassword: API_DOMAIN + '/auth/reset-password',
    EditProfile: API_DOMAIN + '/auth/edit-profile',
    KyCRequest: API_DOMAIN + '/auth/kyc-request',
    ChangePassword: API_DOMAIN + '/auth/change-password',
    Notifications: API_DOMAIN + '/auth/get-all-notifications',
    SetNewPassword: API_DOMAIN + '/auth/set-new-password',
    GetKycDetails: API_DOMAIN + '/auth/get-kyc-details',
    DeleteAccount: API_DOMAIN + '/auth/delete-customer',
    SetPin: API_DOMAIN + '/auth/set-pin',
    VerifyPin: API_DOMAIN + '/auth/verify-pin',
    UpdatePin: API_DOMAIN + '/auth/update-pin',
  },

  ACCOUNT_MANAGEMENT: {
    GetUserProfileData: API_DOMAIN + '/edit-profile-details',
    UpdatePassword: API_DOMAIN + '/update-password',
    DeleteAccount: API_DOMAIN + '/delete-account',
    UpdateProfile: API_DOMAIN + 'update-profile',
    GetNotifications: API_DOMAIN + '/unread-notifications',
    MarkAllNotificationsAsRead: API_DOMAIN + '/mark-all-read',
  },
  WALLETS: {
    GetWalletOverview: API_DOMAIN + '/v2/wallets/overview',
    GetWalletTransactions: API_DOMAIN + '/v2/wallets/transactions',
  },
  KYC: {
    GetKycStatus: API_DOMAIN + '/v2/kyc/status',
    GetTier2Status: API_DOMAIN + '/v2/kyc/tier2/status',
    SubmitTier2: API_DOMAIN + '/v2/kyc/tier2/submit',
    GetTier3Status: API_DOMAIN + '/v2/kyc/tier3/status',
    SubmitTier3: API_DOMAIN + '/v2/kyc/tier3/submit',
    GetTier4Status: API_DOMAIN + '/v2/kyc/tier4/status',
    SubmitTier4: API_DOMAIN + '/v2/kyc/tier4/submit',
  },
  PUBLIC: {
    GetCountries: API_DOMAIN + '/public/countries',
    ReadAllMessages: API_DOMAIN + '/customer/read-all-messages',
  },
  QUICK_ACTIONS: {
    GetActionCatagories: API_DOMAIN + '/public/categories', //with dept id parameter
    GetActionSubacategories: API_DOMAIN + '/public/subcategories', //inside query parameter, need dept id and cat id
    GetActionDepartments: API_DOMAIN + '/public/departments',
    GetKycLimits: API_DOMAIN + '/admin/operations/get-kyc-limits',
    GetBanner: API_DOMAIN + '/admin/operations/get-all-banners',
    PrivacyPageLinks: API_DOMAIN + '/admin/operations/privacy-page-links',
    GetUnreadMessageCount: API_DOMAIN + '/public/get-unread-count',
    GetAllWaysOfHearing: API_DOMAIN + '/admin/operations/get-all-ways-of-hearing',

  },

  CHATS: {
    GetAllChats: API_DOMAIN + '/customer/get-all-chats',
    GetChatDetails: API_DOMAIN + '/customer/get-chat', //with chatid parameter
    SendMessage: API_DOMAIN + '/customer/send-message',
  },

  TRANSACTIONS: {
    GetRecentTransactions: API_DOMAIN + '/transactions/get-recent',
    GetRecentTransactionsItems: API_DOMAIN + '/transactions/get-recent-items',
    GetTransactionHistory: API_DOMAIN + '/customer/utilities/get-transaction-group',
    GetTransactionByDepartment: API_DOMAIN + '/customer/utilities/get-transaction-by-department',
    GetTransactionOverview: API_DOMAIN + '/v2/transactions/overview',
  },
  BILL_PAYMENTS: {
    GetBillers: API_DOMAIN + '/v2/bill-payments/billers',
    GetItems: API_DOMAIN + '/v2/bill-payments/items',
    CreateOrder: API_DOMAIN + '/v2/bill-payments/create-order',
    VerifyAccount: API_DOMAIN + '/v2/bill-payments/verify-account',
    GetHistory: API_DOMAIN + '/v2/bill-payments/history',
    GetOrderStatus: API_DOMAIN + '/v2/bill-payments/order-status',
  },
  SUPPORT: {
    CreateChat: API_DOMAIN + '/v2/support/chats',
    GetChats: API_DOMAIN + '/v2/support/chats',
    GetChatById: API_DOMAIN + '/v2/support/chats',
    SendMessage: API_DOMAIN + '/v2/support/chats',
    MarkMessagesRead: API_DOMAIN + '/v2/support/chats',
  },
  GIFT_CARDS: {
    GetCategories: API_DOMAIN + '/v2/giftcards/categories',
    GetCountries: API_DOMAIN + '/v2/giftcards/countries',
    GetProducts: API_DOMAIN + '/v2/giftcards/products',
    GetProductById: API_DOMAIN + '/v2/giftcards/products', // + /{productId}
    GetProductCountries: API_DOMAIN + '/v2/giftcards/products', // + /{productId}/countries
    GetProductTypes: API_DOMAIN + '/v2/giftcards/products', // + /{productId}/types
    Purchase: API_DOMAIN + '/v2/giftcards/purchase',
    GetOrders: API_DOMAIN + '/v2/giftcards/orders',
    GetOrderById: API_DOMAIN + '/v2/giftcards/orders', // + /{orderId}
    GetCardDetails: API_DOMAIN + '/v2/giftcards/orders', // + /{orderId}/card-details
  },
  PAYMENTS: {
    GetBanks: API_DOMAIN + '/v2/payments/palmpay/banks',
    VerifyAccount: API_DOMAIN + '/v2/payments/palmpay/verify-account',
    InitiatePayout: API_DOMAIN + '/v2/payments/palmpay/payout/initiate',
    GetPayoutStatus: API_DOMAIN + '/v2/payments/palmpay/payout', // + /{transactionId}
    InitiateDeposit: API_DOMAIN + '/v2/payments/palmpay/deposit/initiate',
    GetDepositStatus: API_DOMAIN + '/v2/payments/palmpay/deposit', // + /{transactionId}
  },
  CRYPTO: {
    GetAssets: API_DOMAIN + '/v2/crypto/assets',
    GetAssetById: API_DOMAIN + '/v2/crypto/assets', // + /{id}
    GetBuyCurrencies: API_DOMAIN + '/v2/crypto/buy/currencies',
    GetSellCurrencies: API_DOMAIN + '/v2/crypto/sell/currencies',
    GetBuyQuote: API_DOMAIN + '/v2/crypto/buy/quote',
    ExecuteBuy: API_DOMAIN + '/v2/crypto/buy',
    GetSellQuote: API_DOMAIN + '/v2/crypto/sell/quote',
    GetSellPreview: API_DOMAIN + '/v2/crypto/sell/preview',
    ExecuteSell: API_DOMAIN + '/v2/crypto/sell',
    GetDepositAddress: API_DOMAIN + '/v2/crypto/deposit-address', // + /{currency}/{blockchain}
    GetReceiveAddress: API_DOMAIN + '/v2/crypto/receive', // + /{accountId}
    GetSwapCurrencies: API_DOMAIN + '/v2/crypto/swap/currencies',
    GetSwapQuote: API_DOMAIN + '/v2/crypto/swap/quote',
    GetSwapPreview: API_DOMAIN + '/v2/crypto/swap/preview',
    ExecuteSwap: API_DOMAIN + '/v2/crypto/swap',
    GetTransactions: API_DOMAIN + '/v2/crypto/transactions',
    GetTransactionById: API_DOMAIN + '/v2/crypto/transactions', // + /{transactionId}
    GetAllCryptoRates: API_DOMAIN + '/admin/crypto/rates',
  },
};
