import axios from "axios";
import { apiCall } from "../customApiCalls";
import { API_ENDPOINTS } from "../apiConfig";

export const department = async (token: string): Promise<IDepartmentResponse> => {
    return await apiCall(
        API_ENDPOINTS.QUICK_ACTIONS.GetActionCatagories,
        'GET',
        undefined,
        token,
    )
}

export const subDepartments = async (token: string): Promise<ISubDepartmentResponse> => {
    return await apiCall(
        API_ENDPOINTS.QUICK_ACTIONS.GetActionItems,
        'GET',
        undefined,
        token,
    )
}

export const subDepartmentsDetails = async (token: string): Promise<IQuickActionDetails> => {
    return await apiCall(
        API_ENDPOINTS.QUICK_ACTIONS.GetActionItemDetails,
        'GET',
        undefined,
        token,
    )
}

// department quick actions
interface IDepartmentResponse {
    id: number,
    icon: string,
    heading: string,
    text: string,
    route?: string,
}
interface genericResponse {
    status: string,
    message: string,
}

// sub department quick actions
interface ISubDepartmentResponse {
    id: number,
    icon: string,
    heading: string,
    subHeading?: string,
}

// quick action details
interface IQuickActionDetails {
    id: number,
    catagories: string[],
}