import { API_ENDPOINTS } from './apiConfig';
import { apiCall, ApiResponse } from './customApiCalls';

export const registerUser = async (data: IRegisterReq) => {
  return await apiCall(API_ENDPOINTS.AUTH.Register, 'POST', data);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.Login, 'POST', data);
};

export const verifyEmailOtp = async (token: string) => {
  return await apiCall(
    API_ENDPOINTS.AUTH.VerifyEmailOtp,
    'POST',
    undefined,
    token
  );
};

export const verifyPasswordOtp = async (token: string) => {
  return await apiCall(
    API_ENDPOINTS.AUTH.VerifyPasswordOtp,
    'POST',
    undefined,
    token
  );
};

export const forgotPassword = async (data: {
  email: string;
}): Promise<IForgotPasswordOtp> => {
  return await apiCall(API_ENDPOINTS.AUTH.ForgotPassword, 'POST', data);
};

export const resendOtp = async (token?: string, email?: string) => {
  if (token) {
    return await apiCall(API_ENDPOINTS.AUTH.ResendOtp, 'POST', { token });
  }
  if (email) {
    return await apiCall(API_ENDPOINTS.AUTH.ResendOtp, 'POST', { email });
  }
};

export enum UserRoles {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
}

interface LoginResponse {
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    role: UserRoles.CUSTOMER;
  };
  token: string;
}

interface IForgotPasswordOtp extends ApiResponse {
  data: {
    email: string;
  };
}
interface IRegisterReq {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  username: string;
  gender: string;
  country: string;
}
