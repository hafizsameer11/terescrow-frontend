const API_DOMAIN = "https://api.thecatapi.com/v1/";

export const API_ENDPOINTS = {
    AUTH: {
        Login: API_DOMAIN + '/auth/login',
        Register: API_DOMAIN + '/auth/register',
        Logout: API_DOMAIN + '/auth/logout',
        VerifyEmailOtp: API_DOMAIN + '/auth/verify-email',
        ResendOtp: API_DOMAIN + '/auth/resend-otp',
        ForgotPassword: API_DOMAIN + '/auth/forget-password',
        VerifyPasswordOtp: API_DOMAIN + '/auth/reset-password-otp-verification',
        ResetPassword: API_DOMAIN + '/auth/reset-password',
        CheckBvnStatus: API_DOMAIN + '/check-user-status',
        CheckBvnVerified: API_DOMAIN + '/check-bvn-status',
    },

    ACCOUNT_MANAGEMENT: {
        GetUserProfileData: API_DOMAIN + '/edit-profile-details',
        UpdatePassword: API_DOMAIN + '/update-password',
        DeleteAccount: API_DOMAIN + '/delete-account',
        UpdateProfile: API_DOMAIN + 'update-profile',
        GetNotifications: API_DOMAIN + '/unread-notifications',
        MarkAllNotificationsAsRead: API_DOMAIN + '/mark-all-read', 
    },

    QUICK_ACTIONS: {
        GetActionCatagories: API_DOMAIN + '/get-action-categories',
        GetActionItems: API_DOMAIN + '/get-action-items',
        GetActionItemDetails: API_DOMAIN + '/get-action-item-detials',
    },

    CHATS: {
        GetAllChats: API_DOMAIN + '/chat/get-all-chats',
    },

    TRANSACTIONS: {
        GetRecentTransactions: API_DOMAIN + '/transactions/get-recent',
        GetRecentTransactionsItems: API_DOMAIN + '/transactions/get-recent-items',
    },
}

export default API_DOMAIN;