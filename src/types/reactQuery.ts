export interface ReactQueryOptions<T = any> {
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
}
