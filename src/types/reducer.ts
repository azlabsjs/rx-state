/**
 * Reducer function for store state
 */
export type StateReducerFn<T, A> = (state: T, action: A) => T;

/**
 * Takes a state a return the modify copy of the state or the state itself
 */
export type PartialStateReducerFn<T> = (state: T) => T;
