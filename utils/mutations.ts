import { API_ENDPOINTS } from './apiConfig';
import { apiCall } from './customApiCalls';

export const registerUser = async (data: IRegisterReq) => {
  return await apiCall(API_ENDPOINTS.AUTH.Register, 'POST', data);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.Login, 'POST', data);
};

interface LoginResponse {
  message: string;
  data: any;
  token: string;
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
