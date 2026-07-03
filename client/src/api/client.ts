import axios from 'axios';
import type {
  PublishPostRequest,
  EnqueueResponse,
  JobStatusResponse,
  DlqResponse,
  Account,
  ConnectAccountRequest,
} from './types';

export const apiClient = axios.create({
  baseURL: 'http://gateway.localhost',
  headers: { 'Content-Type': 'application/json' },
});

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
// Social posts
// ---------------------------------------------------------------------------
export const socialApi = {
  publishPost: async (payload: PublishPostRequest): Promise<EnqueueResponse> => {
    const { data } = await apiClient.post<EnqueueResponse>('/social/posts', payload);
    return data;
  },

  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const { data } = await apiClient.get<JobStatusResponse>(`/jobs/${jobId}`);
    return data;
  },

  getDlqJobs: async (serviceName = 'social-post'): Promise<DlqResponse> => {
    const { data } = await apiClient.get<DlqResponse>(`/dlq/${serviceName}`);
    return data;
  },

  replayDlqJob: async (serviceName: string, messageId: string) => {
    const { data } = await apiClient.post(`/dlq/${serviceName}/${messageId}/replay`);
    return data;
  },
};
