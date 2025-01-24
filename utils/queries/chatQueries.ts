import { apiCall, ApiResponse } from '../customApiCalls';
import { API_ENDPOINTS } from '../apiConfig';
import { IChatType, IMessageRes } from '../mutations/chatMutations';

export const getAllChats = async (token: string): Promise<IChatResponse> => {
  return await apiCall(
    API_ENDPOINTS.CHATS.GetAllChats,
    'GET',
    undefined,
    token
  );
};

export const getChatDetails = async (
  chatId: string,
  token: string
): Promise<IChatDetailsResponse> => {
  return await apiCall(
    API_ENDPOINTS.CHATS.GetChatDetails + '/' + chatId,
    'GET',
    undefined,
    token
  );
};

interface IChatResponse extends ApiResponse {
  data: {
    id: number;
    agent: {
      id: number;
      firstname: string;
      lastname: string;
      username: string;
      profilePicture: string;
    };
    recentMessage: string;
    recentMessageTimestamp: string; // Using string because the API provides an ISO date string
    chatStatus: "pending" | "declined" | "successful" | "unsucessful";
    messagesCount: number;
    department: {
      id: number;
      title: string;
      description: string;
      icon: string | null;
      createdAt: string;
      updatedAt: string;
      status: "active" | "inactive";
      Type: string;
      niche: string;
    };
    transaction: {
      id: number;
      chatId: number;
      subCategoryId: number | null;
      countryId: number | null;
      cardType: string | null;
      departmentId: number;
      categoryId: number;
      cardNumber: string | null;
      amount: number;
      exchangeRate: number;
      amountNaira: number;
      cryptoAmount: number | null;
      fromAddress: string | null;
      toAddress: string | null;
      status: "pending" | "completed" | "failed"; // Update with relevant status options
      createdAt: string;
      updatedAt: string;
    } | null; // `transaction` can be null
    category: {
      id: number;
      title: string;
      subTitle: string;
      image: string;
      status: "active" | "inactive";
      createdAt: string;
      updatedAt: string;
    };
  }[];
}

interface IChatDetailsResponse extends ApiResponse {
  data: {
    id: number;
    chatType: IChatType;
    receiverDetails: IUser;
    status?: 'pending' | 'successful' | 'declined'| 'unsucessful';
    messages: IMessageRes[];
  };
}

export enum ChatStatus {
  pending = 'pending',
  successful = 'successful',
  declined = 'declined',
}

export enum ChatType {
  customer_to_agent = 'customer_to_agent',
  team_chat = 'team_chat',
  group_chat = 'group_chat',
}

export interface IUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profilePicture: string | null;
}
