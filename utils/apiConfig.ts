// export const API_BASE_URL = 'https://46.202.154.203';
export const API_BASE_URL = 'http://192.168.1.9:8000';


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

  },
  BILL_PAYMENTS: {
    GetBillers: API_DOMAIN + '/v2/bill-payments/billers',
    GetItems: API_DOMAIN + '/v2/bill-payments/items',
    CreateOrder: API_DOMAIN + '/v2/bill-payments/create-order',
    VerifyAccount: API_DOMAIN + '/v2/bill-payments/verify-account',
  },
  SUPPORT: {
    CreateChat: API_DOMAIN + '/v2/support/chats',
    GetChats: API_DOMAIN + '/v2/support/chats',
    GetChatById: API_DOMAIN + '/v2/support/chats',
    SendMessage: API_DOMAIN + '/v2/support/chats',
    MarkMessagesRead: API_DOMAIN + '/v2/support/chats',
  },
};
