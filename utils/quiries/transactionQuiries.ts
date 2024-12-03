import axios from "axios";
import { apiCall } from "../customApiCalls";
import { API_ENDPOINTS } from "../apiConfig";

export const transactionsRecent = async (token: string): Promise<ITransactionResponse> => {
    return await apiCall(
        API_ENDPOINTS.TRANSACTIONS.GetRecentTransactions,
        'GET',
        undefined,
        token,
    )
}

export const transactionsRecentItems = async (token: string): Promise<ITransactionResponse> => {
    return await apiCall(
        API_ENDPOINTS.TRANSACTIONS.GetRecentTransactionsItems,
        'GET',
        undefined,
        token,
    )
}

interface ITransactionResponse {
    id: number,
    icon: string,
    heading: string,
    date: string,
    price: string,
    time: string,
    productId: string,
}