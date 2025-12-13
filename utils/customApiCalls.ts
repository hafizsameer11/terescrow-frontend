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
  let headers: any = {};
  
  // Always set Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // For FormData, don't set Content-Type at all - let axios set it with boundary
  // For other data, set Content-Type to application/json
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  // For FormData, explicitly don't set Content-Type - axios will handle it

  try {
    let response: AxiosResponse | undefined;
    switch (method) {
      case 'GET':
        response = await axios.get(url, { headers });
        break;

      case 'POST':
        // For FormData in React Native, we need special handling
        const postConfig: any = {
          timeout: 120000, // 120 second timeout for file uploads
        };
        
        // Only set these for FormData (file uploads)
        if (data instanceof FormData) {
          postConfig.maxContentLength = Infinity;
          postConfig.maxBodyLength = Infinity;
          // Create new headers object without Content-Type for FormData
          // Axios will automatically set Content-Type with boundary
          const formDataHeaders = { ...headers };
          delete formDataHeaders['Content-Type'];
          postConfig.headers = formDataHeaders;
        } else {
          postConfig.headers = headers;
        }
        
        response = await axios.post(url, data, postConfig);
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
    if (isAxiosError(error)) {
      // If there's a response, it's an HTTP error
      if (error.response) {
        console.log('API Error Response:', error?.response?.data);
        throw new ApiError(
          error.response?.data,
          error.response.data?.message || 'Something went wrong',
          error.response.status || error.status || 500
        );
      } 
      // If there's no response but there's a request, it's a network error
      else if (error.request) {
        console.log('Network Error - No response received:', error.message);
        throw new ApiError(undefined, 'Network error. Please check your connection.', 0);
      }
      // Other axios errors
      else {
        console.log('Axios Error:', error.message);
        throw new ApiError(undefined, error.message || 'Network or server error occurred', 500);
      }
    } else {
      // Non-axios errors
      console.log('Non-Axios Error:', error);
      throw new ApiError(undefined, 'Network or server error occurred', 500);
    }
  }
};
