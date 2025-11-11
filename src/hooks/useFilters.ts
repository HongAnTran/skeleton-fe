import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

// ==================== TYPES ====================

type FilterType = "string" | "number" | "boolean" | "array" | "date";

interface FilterConfig<T = any> {
  type: FilterType;
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

type FiltersConfig = Record<string, FilterConfig>;

type InferFilterValue<T extends FilterConfig> = T["type"] extends "string"
  ? string | undefined
  : T["type"] extends "number"
    ? number | undefined
    : T["type"] extends "boolean"
      ? boolean | undefined
      : T["type"] extends "array"
        ? string[]
        : T["type"] extends "date"
          ? Date | undefined
          : any;

type FiltersState<T extends FiltersConfig> = {
  [K in keyof T]: InferFilterValue<T[K]>;
};

// ==================== SERIALIZERS ====================

const defaultSerializers: Record<
  FilterType,
  {
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  }
> = {
  string: {
    serialize: (v) => String(v),
    deserialize: (v) => v,
  },
  number: {
    serialize: (v) => String(v),
    deserialize: (v) => (v ? Number(v) : undefined),
  },
  boolean: {
    serialize: (v) => String(v),
    deserialize: (v) => v === "true",
  },
  array: {
    serialize: (v) => (Array.isArray(v) ? v.join(",") : ""),
    deserialize: (v) => (v ? v.split(",").filter(Boolean) : []),
  },
  date: {
    serialize: (v) => (v instanceof Date ? v.toISOString() : String(v)),
    deserialize: (v) => (v ? new Date(v) : undefined),
  },
};

// ==================== MAIN HOOK ====================

/**
 * Hook chung để quản lý filters thông qua URL search params
 * Hỗ trợ nhiều types: string, number, boolean, array, date
 * Tự động persist state khi reload trang
 *
 * @example
 * ```tsx
 * const { filters, setFilter, clearFilter, clearAllFilters } = useFilters({
 *   department: { type: 'string' },
 *   level: { type: 'number' },
 *   isActive: { type: 'boolean', defaultValue: true },
 *   tags: { type: 'array', defaultValue: [] },
 *   startDate: { type: 'date' },
 * });
 *
 * // Usage
 * filters.department // string | undefined
 * setFilter('department', 'sales')
 * clearFilter('department')
 * clearAllFilters()
 * ```
 */
export function useFilters<T extends FiltersConfig>(config: T) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, any>;

  // Parse current filters from URL
  const filters = useMemo(() => {
    const result: any = {};

    for (const [key, filterConfig] of Object.entries(config)) {
      const urlValue = search[key];
      const { type, defaultValue, deserialize } = filterConfig;

      if (urlValue !== undefined) {
        // Use custom deserializer or default one
        const deserializeFn =
          deserialize || defaultSerializers[type].deserialize;
        result[key] = deserializeFn(urlValue);
      } else {
        result[key] = defaultValue;
      }
    }

    return result as FiltersState<T>;
  }, [search, config]);

  // Set a single filter
  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: FiltersState<T>[K]) => {
      const filterConfig = config[key];
      const { type, serialize } = filterConfig;
      const newSearch = { ...search };

      // Remove param if value is undefined/null/empty
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete newSearch[key as string];
      } else {
        // Use custom serializer or default one
        const serializeFn = serialize || defaultSerializers[type].serialize;
        newSearch[key as string] = serializeFn(value);
      }
      navigate({
        to: location.pathname,
        search: newSearch,
        replace: true,
      });
    },
    [config, search, navigate]
  );

  // Clear a single filter
  const clearFilter = useCallback(
    (key: keyof T) => {
      const newSearch = { ...search };
      delete newSearch[key as string];

      navigate({
        to: location.pathname,
        search: newSearch,
        replace: true,
      });
    },
    [search, navigate]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const newSearch = { ...search };

    // Remove all filter keys
    for (const key of Object.keys(config)) {
      delete newSearch[key];
    }

    navigate({
      to: location.pathname,
      search: newSearch,
      replace: true,
    });
  }, [config, search, navigate]);

  // Set multiple filters at once
  const setFilters = useCallback(
    (updates: Partial<FiltersState<T>>) => {
      const newSearch = { ...search };

      for (const [key, value] of Object.entries(updates)) {
        const filterConfig = config[key];
        if (!filterConfig) continue;

        const { type, serialize } = filterConfig;

        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          delete newSearch[key];
        } else {
          const serializeFn = serialize || defaultSerializers[type].serialize;
          newSearch[key] = serializeFn(value);
        }
      }

      navigate({
        to: location.pathname,
        search: newSearch,
        replace: true,
      });
    },
    [config, search, navigate]
  );

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(config).some((key) => {
      const value = filters[key];
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      );
    });
  }, [config, filters]);

  return {
    /** Current filter values */
    filters,
    /** Set a single filter */
    setFilter,
    /** Clear a single filter */
    clearFilter,
    /** Clear all filters */
    clearAllFilters,
    /** Set multiple filters at once */
    setFilters,
    /** Check if any filter is active */
    hasActiveFilters,
  };
}
