import { useCallback } from "react";
import { useNavigate, useSearch, useLocation } from "@tanstack/react-router";

type SetStateAction<T> = T | ((prev: T) => T);

interface UseSearchParamsStateOptions<T> {
  /** Key to use in search params */
  key: string;
  /** Default value when param is not present */
  defaultValue: T;
  /** Serialize value to string */
  serialize?: (value: T) => string;
  /** Deserialize string to value */
  deserialize?: (value: string) => T;
}

/**
 * Hook để quản lý state thông qua URL search params
 * Giúp persist state khi reload trang
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useSearchParamsState({
 *   key: 'department',
 *   defaultValue: undefined,
 * });
 * ```
 */
export function useSearchParamsState<T = string | undefined>(
  options: UseSearchParamsStateOptions<T>
): [T, (value: SetStateAction<T>) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, any>;

  const {
    key,
    defaultValue,
    serialize = (v) => String(v),
    deserialize = (v) => v as T,
  } = options;

  // Get current value from search params
  const currentValue: T =
    search[key] !== undefined ? deserialize(search[key]) : defaultValue;

  // Set value and update search params
  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      const newValue =
        typeof value === "function"
          ? (value as (prev: T) => T)(currentValue)
          : value;

      const newSearch = { ...search };

      // Remove param if value is undefined/null
      if (newValue === undefined || newValue === null || newValue === "") {
        delete newSearch[key];
      } else {
        newSearch[key] = serialize(newValue);
      }

      navigate({
        href:
          location.pathname + "?" + new URLSearchParams(newSearch).toString(),
        replace: true,
      });
    },
    [currentValue, key, navigate, search, serialize]
  );

  return [currentValue, setValue];
}
