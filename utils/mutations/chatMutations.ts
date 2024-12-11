import { API_ENDPOINTS } from '../apiConfig';
import { apiCall, ApiResponse } from '../customApiCalls';

export const sendMessageController = async (
  data: ISendMessageReq,
  token: string
): Promise<ISendMessageResponse> => {
  console.log(data);
  return await apiCall(API_ENDPOINTS.CHATS.SendMessage, 'POST', data, token);
};

export interface ISendMessageReq {
  message: string;
  chatId: string;
}

interface ISendMessageResponse extends ApiResponse {
  data: IMessageRes;
}

export interface IMessageRes {
  message: string;
  id: number;
  senderId: number;
  receiverId: number;
  chatId: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum IChatType {
  customer_to_agent = 'customer_to_agent',
  team_chat = 'team_chat',
  group_chat = 'group_chat',
}
