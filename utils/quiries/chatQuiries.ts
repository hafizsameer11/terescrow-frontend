import { apiCall } from "../customApiCalls";
import { API_ENDPOINTS } from "../apiConfig";

export const chats = async (token: string): Promise<IChatResponse> => {
    return await apiCall(
        API_ENDPOINTS.CHATS.GetAllChats,
        'GET',
        undefined,
        token,
    )
}

interface IChatResponse {
    id: number,
    icon: string,
    heading: string,
    price: string,
    categories: string[],
    time: string,
    productId: string,
}