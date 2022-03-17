// constants
// @internal
export const NOT_FOUND = '__NOT_FOUND__';
//!Ends Constants

// Types
//
// @internal
export type Compator = (a: any, b: any) => boolean;

// @internal
export type CacheEntry = { key: unknown; value: unknown };

// @internal
export type CacheType = {
  get(key: unknown): any | typeof NOT_FOUND;
  set(key: unknown, value: any): void;
  entries: () => unknown;
  clear?: () => void;
};

// @internal
export type EqualityCacheOptions = {
  fn: Compator;
  size?: number;
};

// @internal
export type MemoizerOptions = {
  cacheFactory: {
    create(): CacheType;
  };
  equality: EqualityCacheOptions;
  hash?: boolean;
  strategy: (
    fn: (...args: unknown[]) => unknown,
    options: MemoizerOptions
  ) => any;
};

// createSelector types
// @internal
export type MemoizeFunction<T> = (
  fn: (...params: any[]) => T,
  options?: MemoizerOptions
) => (...params: any[]) => T;

// @internal
export type LeastType<T> = T extends [unknown, ...infer U] ? U[0] : never;
// @internal
export type CreateSelectorOptions<T> = {
  memoize?: T;
};
// @internal
export type SelectorType = (...args: unknown[]) => unknown;
// !Ends createSelector types
// !Ends Types
