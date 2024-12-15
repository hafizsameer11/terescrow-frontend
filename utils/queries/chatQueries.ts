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
    customer: IUser;
    recentMessage: string;
    recentMessageTimestamp: Date;
    chatStatus: ChatStatus;
    messagesCount: number;
  }[];
}

interface IChatDetailsResponse extends ApiResponse {
  data: {
    id: number;
    chatType: IChatType;
    receiverDetails: IUser;
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
