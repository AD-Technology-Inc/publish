import { useState } from 'react';
import { socialApi } from '../api/client';
import type { PublishPostRequest } from '../api/types';
import { useJobPolling } from './useJobPolling';

export const usePublishPost = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { jobStatus, isPolling, resetJobStatus } = useJobPolling(jobId);

  const publish = async (payload: PublishPostRequest) => {
    setError(null);
    setJobId(null);
    resetJobStatus();

    try {
      const response = await socialApi.publishPost(payload);
      setJobId(response.job_id);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(err.response?.data?.detail ?? err.message ?? 'Failed to enqueue post');
    }
  };

  const isPending = !!jobId && isPolling;
  const isSuccess =
    jobStatus?.status === 'completed' || jobStatus?.status === 'unknown';
  const isFailed = jobStatus?.status === 'failed' || !!error;

  return {
    publish,
    jobId,
    jobStatus,
    isPending,
    isSuccess,
    isFailed,
    error,
  };
};
