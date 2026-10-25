import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';
import type { AuthPayload } from './types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api/v1';

export const http = axios.create({ baseURL, withCredentials: true });
const bare = axios.create({ baseURL, withCredentials: true }); // no interceptors, used only for refresh

// Called when a refresh fails, so AuthContext can drop the user.
let onAuthFailure: () => void = () => {};
export const setAuthFailureHandler = (fn: () => void) => {
  onAuthFailure = fn;
};

// ONE refresh at a time. Parallel callers share the same promise.
let inflight: Promise<AuthPayload> | null = null;

export function refreshSession(): Promise<AuthPayload> {
  inflight ??= bare
    .post('/auth/refresh')
    .then((res) => {
      const payload = res.data.data as AuthPayload;
      setAccessToken(payload.accessToken);
      return payload;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type Retryable = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as Retryable | undefined;
    const isAuthRoute = original?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      try {
        await refreshSession();
        return http(original); // retry once with the new token
      } catch {
        setAccessToken(null);
        onAuthFailure();
      }
    }
    return Promise.reject(error);
  },
);

// Turns any axios error into a message we can show in a toast.
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) return err.response?.data?.error?.message ?? err.message;
  return 'Something went wrong';
}