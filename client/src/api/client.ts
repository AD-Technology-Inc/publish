import axios from 'axios';
import type {
  PublishPostRequest,
  EnqueueResponse,
  JobStatusResponse,
  DlqResponse,
  Account,
  ConnectAccountRequest,
  User,
  Post,
} from './types';

export const apiClient = axios.create({
  baseURL: 'http://gateway.localhost',
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Identity / User
// ---------------------------------------------------------------------------
export const identityApi = {
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/identity/me');
    return data;
  },
};

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------
export const accountsApi = {
  list: async (): Promise<Account[]> => {
    const { data } = await apiClient.get<Account[]>('/accounts');
    return data;
  },

  connect: async (req: ConnectAccountRequest): Promise<Account> => {
    const { data } = await apiClient.post<Account>('/accounts', req);
    return data;
  },

  disconnect: async (accountId: string): Promise<void> => {
    await apiClient.delete(`/accounts/${accountId}`);
  },
};

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------
export const postsApi = {
  list: async (): Promise<Post[]> => {
    const { data } = await apiClient.get<Post[]>('/social/posts');
    return data;
  },
};

// ---------------------------------------------------------------------------
// Publish (enqueue)
// ---------------------------------------------------------------------------
export const socialApi = {
  publishPost: async (payload: PublishPostRequest): Promise<EnqueueResponse> => {
    const headers: Record<string, string> = {};
    if (payload.idempotency_key) {
      headers['x-idempotency-key'] = payload.idempotency_key;
    }
    const { data } = await apiClient.post<EnqueueResponse>(
      '/social/publish',
      payload,
      { headers }
    );
    return data;
  },

  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const { data } = await apiClient.get<JobStatusResponse>(
      `/social/publish/status/${jobId}`
    );
    return data;
  },

  getDlqJobs: async (): Promise<DlqResponse> => {
    const { data } = await apiClient.get<DlqResponse>('/social/publish/dlq');
    return data;
  },
};
