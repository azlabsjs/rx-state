import { EqualityCacheFactory, HashCacheFactory } from './cache';
import {
  CacheType,
  EqualityCacheOptions,
  MemoizerOptions,
  NOT_FOUND,
} from './types';

// #region Helpers
//
// @internal
const computeIntoCache = (
  fn: (...args: unknown[]) => unknown,
  cache: CacheType,
  ...args: any
) => {
  // Compute key for the given value
  let value = cache.get(args);
  if (value === NOT_FOUND) {
    value = fn.call(null, ...args);
    cache.set(args, value);
  }
  return value;
};

// @internal
const compute = (fn: (...args: unknown[]) => unknown, cache: CacheType) => {
  return (arg: any) => computeIntoCache(fn, cache, arg);
};

const computeVariadic = (
  fn: (...args: unknown[]) => unknown,
  cache: CacheType
) => {
  return (...args: any) => computeIntoCache(fn, cache, ...args);
};

const evaluateConfiguration = (options: Partial<MemoizerOptions>) => {
  if (
    (options?.cacheFactory && (options.equality || options.hash)) ||
    (options?.equality && (options.cacheFactory || options.hash)) ||
    (options?.hash && (options.cacheFactory || options.equality))
  ) {
    throw new Error(
      "cacheFactory, equality and hash options can't be combine to create memoizer, you should choose the best suite for your application"
    );
  }
};
// #endregion Helpers

// Strategy
//
// @internal
const DefaultStrategy = (
  fn: (...args: unknown[]) => unknown,
  options: MemoizerOptions
) => {
  const strategy = fn.length === 1 ? compute : computeVariadic;
  return strategy(fn, options.cacheFactory.create());
};
// !strategy

/**
 *
 * @param fn
 * @param options
 * @returns
 */
function memoizer<T>(
  fn: (...args: unknown[]) => T,
  options?: Partial<MemoizerOptions>
) {
  if (options) {
    evaluateConfiguration(options);
  }
  const cacheFactory =
    options?.cacheFactory ??
    (options?.equality !== null && typeof options?.equality !== 'undefined')
      ? EqualityCacheFactory(options.equality as EqualityCacheOptions)
      : HashCacheFactory;
  const strategy = (options?.strategy as any) ?? DefaultStrategy;
  return strategy(fn, {
    cacheFactory,
    strategy: strategy,
  }) as (...params: any[]) => ReturnType<typeof fn>;
}

export const memoize = memoizer;
export default memoizer;
