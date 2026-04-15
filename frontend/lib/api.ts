import axios from 'axios';

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra!') {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default api;
