/**
 * Reducer function for store state
 */
export type StateReducerFn<T, A> = (state: T, action: A) => T;
