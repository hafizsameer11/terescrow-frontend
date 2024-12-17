import { API_ENDPOINTS } from '../apiConfig';
import { apiCall, ApiResponse } from '../customApiCalls';

export const registerUser = async (data: IRegisterReq) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.Register, 'POST', data);
};
export const editUser = async (data: IRegisterReq, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.EditProfile, 'POST', data, token);
};
export const KyCRequest = async (data: IKycReques, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.KyCRequest, 'POST', data, token);
};
export const chnagePassword = async (data: IChangePasswordReq, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINTS.AUTH.ChangePassword, 'POST', data, token);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  return await apiCall(API_ENDPOINTS.AUTH.Login, 'POST', data);
};

export const verifyEmailOtp = async (token: string, otp: string) => {
  const data = { otp: otp };
  return await apiCall(API_ENDPOINTS.AUTH.VerifyEmailOtp, 'POST', data, token);
};

export const verifyPasswordOtp = async (email: string, otp: string) => {
  const data = {
    email: email,
    otp: otp,
  };
  return await apiCall(
    API_ENDPOINTS.AUTH.VerifyPasswordOtp,
    'POST',
    data,
    undefined
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
  admin = 'admin',
  customer = 'customer',
  agent = 'agent',
}

interface LoginResponse {
  message: string;
  data: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    role: UserRoles;
    profilePicture: string | undefined;
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
  password?: string;
  username: string;
  gender: string;
  country: string;
}

interface IKycReques{
  surName?: string;
  firstName?: string;
  bvn?: string;
dob?: string;
}

interface IChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}