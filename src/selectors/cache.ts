// Cache

import {
  CacheEntry,
  CacheType,
  Compator,
  EqualityCacheOptions,
  NOT_FOUND,
} from './types';

// Helpers
// @internal
// Internal implementation of a cache arguments comparator function
function cacheComparator(equals: Compator) {
  return function (
    prev: unknown[] | IArguments | undefined,
    next: unknown[] | IArguments | undefined
  ): boolean {
    if (
      prev === null ||
      typeof prev === 'undefined' ||
      typeof next === 'undefined' ||
      next === null ||
      prev.length !== next.length
    ) {
      return false;
    }
    for (let i = 0; i < prev.length; i++) {
      if (!equals(prev[i], next[i])) {
        return false;
      }
    }
    return true;
  };
}
export const strictEquality: Compator = (a, b) => {
  return a === b;
};
//!Helpers
//
/**
 * Memoizer cache implementation
 * It computes hash of arguments to memoize and use the computed
 * hash value of check if result exists in cache or not
 *
 * @example
 * const cache = HashCache();
 *
 * // Memoize arguments
 * cache.set({url: 'http:localhost', params: {page: 1, per_page: 10}}, []);
 *
 * // Get memoized arguments
 * cache.get({url: 'http:localhost', params: {page: 1, per_page: 10}});
 *
 * @returns {@see CacheType}
 */
export function HashCache(): CacheType {
  const store = new Map<number, any>();
  const computeHash = (str: string) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  };
  /**
   * // Serialization function
   * Takes in list of arguments and convert them into string
   */
  const valueHasher = (value: any) => {
    const serialize_ = (arg: any) => {
      const argType = typeof arg;
      if (argType === 'string') {
        return arg;
      }
      const stringeable =
        arg === null ||
        argType === 'undefined' ||
        argType === 'number' ||
        argType === 'boolean' ||
        argType === 'function';
      if (stringeable) {
        return arg.toString();
      }
      if (argType === 'object' && typeof arg.entries === 'function') {
        return JSON.stringify(Object.fromEntries(arg.entries()));
      }
      return JSON.stringify(argType);
    };
    return function <T>(hashFunction: (v: string) => T) {
      const result = hashFunction(
        Array.isArray(value)
          ? value.map((v) => serialize_(v)).join(',')
          : (serialize_(value) as string)
      );
      return result;
    };
  };
  // Compute the hash value of the serialized
  const keyFn = (value: any) => valueHasher(value)(computeHash);
  return {
    get: (key: unknown) => store.get(keyFn(key)) ?? NOT_FOUND,
    set: (key: unknown, value: any) => store.set(keyFn(key), value),
    entries: () => Array.from(store.values()),
  };
}

/**
 * Memoizer cache implementation
 *
 * It uses a comparator function to check if arguments result exists in cache.
 * It maintains a single entry of each computed values
 *
 * @example
 * const cache = SingleValueCache(cacheComparator(strictEquality));
 *
 * // Memoize arguments
 * cache.set({url: 'http:localhost', params: {page: 1, per_page: 10}}, []);
 *
 * // Get memoized arguments
 * cache.get({url: 'http:localhost', params: {page: 1, per_page: 10}});
 *
 *
 * @param equals {@see Compator}
 * @returns CacheType
 */
export function SingleValueCache(equals: Compator): CacheType {
  let entry!: CacheEntry;
  return {
    get: (key: unknown) => {
      if (entry && equals(entry.key, key)) {
        return entry.value;
      }
      return NOT_FOUND;
    },
    set: (key: unknown, value: unknown) => {
      entry = { key, value };
    },
    entries: () => (entry ? [entry] : []),
  };
}

// @internal
function LRUCache(size: number, equals: Compator): CacheType {
  let entries: CacheEntry[] = [];

  const __get = (key: unknown) => {
    const index = entries.findIndex((entry) => equals(key, entry.key));
    if (index !== -1) {
      const entry = entries[index];
      if (index > 0) {
        // Remove entry from the
        entries.splice(index, 1);
        // Move entry to the top of the list
        entries = [entry].concat(entries.slice(1));
      }
      return entry.value;
    }
    return NOT_FOUND;
  };
  return {
    get: (key: unknown) => __get(key),

    set: (key: unknown, value: unknown) => {
      if (__get(key) !== NOT_FOUND) {
        return;
      }
      // Remove the least recent item accessed if the cache is full
      if (entries.length > size - 1) {
        entries.pop();
      }
      // Add recent cache item to the top
      entries = [{ key, value }, ...entries.slice(1)];
    },
    entries: () => {
      return entries;
    },

    clear: () => {
      entries = [];
    },
  };
}

export const HashCacheFactory = {
  create: () => HashCache(),
};

export const EqualityCacheFactory = (options: EqualityCacheOptions) => ({
  create: () =>
    options?.size
      ? LRUCache(options?.size, cacheComparator(options.fn))
      : SingleValueCache(cacheComparator(options.fn)),
});
// !Ends Cache
