import axios, { AxiosResponse, isAxiosError } from "axios";

export class ApiError extends Error {
  data: any;
  statusText: string = "";
  statusCode?: number;

  constructor(
    data: any,
    message: string,
    statusText: string,
    statusCode?: number
  ) {
    super(message);
    this.data = data;
    this.statusText = statusText;
    this.statusCode = statusCode;
  }
}

export const apiCall = async (
  url: string,
  method: string,
  data?: any,
  token?: string
) => {
  let headers;
  headers = {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  if (data && data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  try {
    let response: AxiosResponse | undefined;
    switch (method) {
      case "GET":
        response = await axios.get(url, { headers });
        break;

      case "POST":
        response = await axios.post(url, data, { headers });
        break;

      case "PUT":
        response = await axios.put(url, data, { headers });
        break;

      case "DELETE":
        response = await axios.delete(url, { headers });
        break;

      default:
        throw new Error("Unsupported HTTP method");
    }

    return response?.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(
        error.message,
        error.response.data?.status || error.response.statusText,
        error.response.data?.message || "Something went wrong",
        error.response.status
      );
    } else {
      throw new ApiError(
        undefined,
        "Network or server error occured",
        "Something went wrong"
      );
    }
  }
};
