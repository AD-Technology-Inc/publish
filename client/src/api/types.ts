// Job types
export interface EnqueueResponse {
  status: string;
  job_id: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'unknown';
  result?: string | null;
}

// Account types
export interface Account {
  id: string;
  provider: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  name: string;
  page_id: string;
  status: 'connected' | 'expired' | 'processing';
  connected_at: string;
}

export interface ConnectAccountRequest {
  provider: string;
  name: string;
  page_id: string;
  access_token: string;
}

// Post types
export interface PublishPostRequest {
  page_id: string;
  provider: string;
  message: string;
  media_url?: string;
  platforms?: string[];
}

// DLQ types
export interface DlqJob {
  message_id: string;
  payload: string;
  error: string;
  retry_count: string;
}

export interface DlqResponse {
  dlq_jobs: DlqJob[];
}
