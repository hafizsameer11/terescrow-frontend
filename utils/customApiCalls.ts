import axios, { AxiosResponse, isAxiosError } from 'axios';

export class ApiError extends Error {
  data: any;
  statusCode: number;

  constructor(data: any, message: string, statusCode: number) {
    super(message);
    this.data = data;
    this.statusCode = statusCode;
  }
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
  token?: string;
}

export const apiCall = async (
  url: string,
  method: string,
  data?: any,
  token?: string
) => {
  let headers;
  headers = {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  if (data && data instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }

  try {
    let response: AxiosResponse | undefined;
    switch (method) {
      case 'GET':
        response = await axios.get(url, { headers });
        break;

      case 'POST':
        response = await axios.post(url, data, { headers });
        break;

      case 'PUT':
        response = await axios.put(url, data, { headers });
        break;

      case 'DELETE':
        response = await axios.delete(url, { headers });
        break;

      default:
        throw new Error('Unsupported HTTP method');
    }

    return response?.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error?.response?.data);
      throw new ApiError(
        error.response?.data,
        error.response.data?.message || 'Something went wrong',
        error.response.status || error.status || 500
      );
    } else {
      throw new ApiError(undefined, 'Network or server error occured', 500);
    }
  }
};
