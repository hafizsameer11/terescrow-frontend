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

interface IChatResponse {
  id: number;
  icon: string;
  heading: string;
  price: string;
  categories: string[];
  time: string;
  productId: string;
}

interface IChatDetailsResponse extends ApiResponse {
  data: {
    id: number;
    chatType: IChatType;
    receiverDetails: {
      id: number;
      username: string;
      firstname: string;
      lastname: string;
      profilePicture: string | null;
    };
    messages: IMessageRes[];
  };
}
