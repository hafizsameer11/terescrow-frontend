import axios from 'axios';
import { apiCall, ApiResponse } from '../customApiCalls';
import { API_ENDPOINTS } from '../apiConfig';

export const getDepartments = async (
  token: string
): Promise<IDepartmentResponse> => {
  return await apiCall(
    API_ENDPOINTS.QUICK_ACTIONS.GetActionDepartments,
    'GET',
    undefined,
    token
  );
};

export const getCategories = async (
  token: string,
  departmentId: string
): Promise<ICategoryResponse> => {
  return await apiCall(
    API_ENDPOINTS.QUICK_ACTIONS.GetActionCatagories + '/' + departmentId,
    'GET',
    undefined,
    token
  );
};

export const getSubCategories = async (
  token: string,
  departmentId: string,
  categoryId: string
): Promise<ISubCategoryResponse> => {
  return await apiCall(
    `${API_ENDPOINTS.QUICK_ACTIONS.GetActionSubacategories}?departmentId=${departmentId}&categoryId=${categoryId}`,
    'GET',
    undefined,
    token
  );
};

// department quick actions
export interface IDepartmentResponse extends ApiResponse {
  data: { id: number; icon: string; title: string; description: string }[];
}

export interface ICategoryResponse extends ApiResponse {
  data: {
    departmentId: number;
    categories: {
      category: {
        id: number;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        subTitle: string | null;
        image: string | null;
      };
    }[];
  };
}

export interface ISubCategoryResponse extends ApiResponse {
  data: {
    departmentId: string;
    categoryId: string;
    subCategories: [
      {
        subCategory: {
          id: number;
          title: string;
          createdAt: Date;
          updatedAt: Date;
          price: number;
        };
      }
    ];
  };
}
