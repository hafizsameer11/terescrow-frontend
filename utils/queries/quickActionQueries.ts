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

export const getAllCountries = async (): Promise<ICountriesRes> => {
  return await apiCall(API_ENDPOINTS.PUBLIC.GetCountries, 'GET');
};
export const getKycLimits = async (token: string): Promise<KycLimitsResponse> => {
  return await apiCall(API_ENDPOINTS.QUICK_ACTIONS.GetKycLimits, 'GET', undefined, token);
}
export const getAllBanners = async (token: string): Promise<BannersResponse> => {
  return await apiCall(API_ENDPOINTS.QUICK_ACTIONS.GetBanner, 'GET', undefined, token);
}
export const getPrivacyPageLinks = async (): Promise<ApiResponse> => {
  return await apiCall(API_ENDPOINTS.QUICK_ACTIONS.PrivacyPageLinks, 'GET', undefined, undefined);
}
export const getunreadMessageCount = async (token: string): Promise<ApiResponse> => {
  return await apiCall(API_ENDPOINTS.QUICK_ACTIONS.GetUnreadMessageCount, 'GET', undefined, token)
}
export const getWaysOfHearing = async (): Promise<WaysOfHearingResponse> => {
  return await apiCall(`${API_ENDPOINTS.QUICK_ACTIONS.GetAllWaysOfHearing}`, 'GET', undefined)
}

interface WayOfHearing {
  id: number
  means: string
  createdAt: string
}

interface GroupedWayOfHearing {
  name: string
  count: number
}

export interface WaysOfHearingResponse {
  status: 'success' | 'error'
  message: string
  data: {
    list: WayOfHearing[]
    grouped: GroupedWayOfHearing[]
  }
}


// department quick actions
export interface IDepartmentResponse extends ApiResponse {
  data: { id: number; icon: string; title: string; description: string }[];
}
export interface KycLimitsResponse extends ApiResponse {
  data: {
    id: number | string;
    tier: string;
    cryptoBuyLimit: string;
    cryptoSellLimit: string;
    giftCardBuyLimit: string;
    giftCardSellLimit: string;
  }

}
export interface KycLimit {
  id: number | string;
  tier: string;
  cryptoBuyLimit: string;
  cryptoSellLimit: string;
  giftCardBuyLimit: string;
  giftCardSellLimit: string;
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

interface ICountriesRes extends ApiResponse {
  data: { id: number; title: string }[];
}
export interface BannersResponse extends ApiResponse {
  data: {
    id: number;
    image: string;
    createdAt: Date;
  }[]
}