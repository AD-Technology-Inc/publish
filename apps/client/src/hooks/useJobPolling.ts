import { useState, useEffect, useCallback } from 'react';
import { socialApi } from '../api/client';
import type { JobStatusResponse } from '../api/types';

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'unknown']);

export const useJobPolling = (jobId: string | null) => {
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const resetJobStatus = useCallback(() => {
    setJobStatus(null);
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(async (id: string) => {
    setIsPolling(true);
    let attempts = 0;

    while (attempts < 60) {
      try {
        const status = await socialApi.getJobStatus(id);
        setJobStatus(status);

        if (TERMINAL_STATUSES.has(status.status)) {
          setIsPolling(false);
          return;
        }
      } catch {
        // swallow transient network errors and keep polling
      }

      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (jobId) {
      startPolling(jobId);
    }
  }, [jobId, startPolling]);

  return { jobStatus, isPolling, resetJobStatus };
};
