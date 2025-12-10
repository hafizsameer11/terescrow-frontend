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

// Gift Card Categories and Countries APIs
export const getGiftCardCategories = async (
  token: string
): Promise<IGiftCardCategoriesResponse> => {
  return await apiCall(API_ENDPOINTS.GIFT_CARDS.GetCategories, 'GET', undefined, token);
};

export const getGiftCardCountries = async (
  token: string
): Promise<IGiftCardCountriesResponse> => {
  return await apiCall(API_ENDPOINTS.GIFT_CARDS.GetCountries, 'GET', undefined, token);
};

// Gift Card Products APIs
export const getGiftCardProducts = async (
  token: string,
  page: number = 1,
  limit: number = 50,
  category?: string,
  countryCode?: string,
  search?: string
): Promise<IGiftCardProductsResponse> => {
  const params = new URLSearchParams({ 
    page: page.toString(), 
    limit: limit.toString() 
  });
  
  if (category) {
    params.append('category', category);
  }
  if (countryCode) {
    params.append('countryCode', countryCode);
  }
  if (search) {
    params.append('search', search);
  }
  
  const url = `${API_ENDPOINTS.GIFT_CARDS.GetProducts}?${params.toString()}`;
  return await apiCall(url, 'GET', undefined, token);
};

export const getGiftCardProductById = async (
  token: string,
  productId: number
): Promise<IGiftCardProductDetailResponse> => {
  const url = `${API_ENDPOINTS.GIFT_CARDS.GetProductById}/${productId}`;
  return await apiCall(url, 'GET', undefined, token);
};

export const getGiftCardProductCountries = async (
  token: string,
  productId: number
): Promise<IGiftCardProductCountriesResponse> => {
  const url = `${API_ENDPOINTS.GIFT_CARDS.GetProductCountries}/${productId}/countries`;
  return await apiCall(url, 'GET', undefined, token);
};

export const getGiftCardProductTypes = async (
  token: string,
  productId: number
): Promise<IGiftCardProductTypesResponse> => {
  const url = `${API_ENDPOINTS.GIFT_CARDS.GetProductTypes}/${productId}/types`;
  return await apiCall(url, 'GET', undefined, token);
};

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

// Gift Card Categories and Countries Interfaces
export interface IGiftCardCategory {
  id: number;
  name: string;
  value: string;
}

export interface IGiftCardCategoriesResponse extends ApiResponse {
  data: {
    categories: IGiftCardCategory[];
    total: number;
  };
}

export interface IGiftCardCountry {
  isoName: string;
  name: string;
  currencyCode: string;
  currencyName: string;
  flag: string | null;
}

export interface IGiftCardCountriesResponse extends ApiResponse {
  data: {
    countries: IGiftCardCountry[];
    total: number;
  };
}

// Gift Card Products Interfaces
export interface IGiftCardProduct {
  productId: number;
  id: string;
  productName: string;
  brandName: string | null;
  countryCode: string | null;
  minValue: number | null;
  maxValue: number | null;
  fixedValue: number | null;
  isVariableDenomination: boolean;
  imageUrl: string;
  category: string | null;
  status: string;
  description: string | null;
  redeemInstruction: {
    concise: string;
    verbose: string;
  } | null;
}

export interface IGiftCardProductsResponse extends ApiResponse {
  data: {
    products: IGiftCardProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      returned: number;
    };
  };
}

export interface IGiftCardProductDetailResponse extends ApiResponse {
  data: {
    productId: number;
    productName: string;
    imageUrl: string;
    redemptionInstructions: {
      concise: string;
      verbose: string;
    };
  };
}

export interface IGiftCardProductCountriesResponse extends ApiResponse {
  data: {
    countries: Array<{
      countryCode: string;
      countryName: string;
    }>;
  };
}

export interface IGiftCardProductType {
  type: string;
  description: string;
  available: boolean;
}

export interface IGiftCardProductTypesResponse extends ApiResponse {
  data: {
    cardTypes: IGiftCardProductType[];
  };
}