export interface ReactQueryOptions<T = unknown> {
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
}
