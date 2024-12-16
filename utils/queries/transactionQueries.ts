import axios from "axios";
import { apiCall } from "../customApiCalls";
import { API_ENDPOINTS } from "../apiConfig";

// export const transactionsRecent = async (token: string): Promise<ITransactionResponse> => {
//     return await apiCall(
//         API_ENDPOINTS.TRANSACTIONS.GetRecentTransactions,
//         'GET',
//         undefined,
//         token,
//     )
// }

// export const transactionsRecentItems = async (token: string): Promise<ITransactionResponse> => {
//     return await apiCall(
//         API_ENDPOINTS.TRANSACTIONS.GetRecentTransactionsItems,
//         'GET',
//         undefined,
//         token,
//     )
// }

// interface ITransactionResponse {
//     id: number,
//     icon: string,
//     heading: string,
//     date: string,
//     price: string,
//     time: string,
//     productId: string,
// }
export const transactionHistory= async (token: string): Promise<ITransactionResponse> => {
    return await apiCall(
        API_ENDPOINTS.TRANSACTIONS.GetTransactionHistory,
        'GET',
        undefined,
        token,
    )
}
export const getTransactionByDepartment= async (token: string,id:number): Promise<ITransactionResponse> => {
    return await apiCall(
        `${API_ENDPOINTS.TRANSACTIONS.GetTransactionByDepartment}/${id}`,
        'GET',
        undefined,
        token,
    )
}
interface ITransactionCategory {
    title: string;
    id: number;
    image: string;
  }

// Interface for Department
interface IDepartment {
    title: string;
    icon: string;
    id: number;
  }
interface ITransactionData {
    id: number;
    amount: number;
    createdAt: string; 
    amountNaira: number;
    department: IDepartment;
    category: ITransactionCategory;
  }
  
  // Interface for API Response
  interface ITransactionResponse {
    status: string; 
    message: string;
    data: ITransactionData[];
  }
  