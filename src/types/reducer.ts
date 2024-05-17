// @internal
export type StateReducerFn<T, A> = (state: T, action: A) => T;

// @internal
export type PartialStateReducerFn<T> = (state: T) => T;

export type ReducersConfig<T, A> = {
  [index: string]: StateReducerFn<T, A>;
};
