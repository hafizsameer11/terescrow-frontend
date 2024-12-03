import axios from "axios";
import { apiCall } from "../customApiCalls";
import { API_ENDPOINTS } from "../apiConfig";

export const getUserProfile = async (token?: string): Promise<IUserProfileResponse> => {
    return await apiCall(
        API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetUserProfileData,
        'GET',
        undefined,
        token,
    )
}

export const getUnreadNotifications = async (token?: string): Promise<INotificationResponse> => {
    return await apiCall(
        API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetNotifications,
        'GET',
        undefined,
        token,
    )
}

export const markAllRead = async (token: string) => {
    return await apiCall(
        API_ENDPOINTS.ACCOUNT_MANAGEMENT.MarkAllNotificationsAsRead,
        'GET',
        undefined,
        token,
    )
}



export interface IUserProfileData {
    firstName: string,
    lastName: string,
    phone: string,
    profilePicture?: string | null,
    gender: string | null,
    country: string | null,
    email: string,
    userName: string, 
}

interface IUserProfileResponse {
    status: string,
    data: IUserProfileData,
}

interface INotification {
    id: number,
    user_id: number,
    title: string,
    message: string,
    read: number,
    created_at: string,
    updated_at: string,
    icon: string,
    iconColor: string,
}

interface INotificationResponse {
    status: string,
    message: string,
    data: INotification[],
}