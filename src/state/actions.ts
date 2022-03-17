import { Action, ActionType, Store } from '../types';
import { createActionDispatcher } from './creators';

export enum DefaultActions {
  ASYNC_ACTION = '[ASYNC_ACTION]',
  ERROR_ACTION = '[ERROR_ACTION]',
  RESET_STATE_ACTION = '[RESET_STATE]',
}

/**
 * Create an {@see [ERROR_ACTION]} action dispatcher to the provided store
 * object
 *
 * @example
 * const store = createStore(createReducer({'[INCREMENT]': (state: T) => ({counter: ++state.counter}) }), {
 *  /// Store initial state
 * }),
 *
 * // Dispatch error to store
 * errorAction();
 *
 * @param store
 */
export const errorAction = <T, A>(store: Store<T, Partial<A>>) =>
  createActionDispatcher(
    store,
    () => ({ type: DefaultActions.ERROR_ACTION } as ActionType)
  );

export const resetStateAction = <T, A>(store: Store<T, Partial<A>>) =>
  createActionDispatcher(
    store,
    () => ({ type: DefaultActions.RESET_STATE_ACTION } as ActionType)
  );

/**
 * Create an {@see [ASYNC_ACTION]} action dispatcher to the provided store
 * object
 *
 * @example
 * const store = createStore(createReducer({'[INCREMENT]': (state: T) => ({counter: ++state.counter}) }), {
 *  /// Store initial state
 * }),
 *
 * // Dispatch error to store
 * asyncAction();
 *
 * @param store
 */
export const asyncAction = <T, A>(store: Store<T, Partial<A>>) =>
  createActionDispatcher(
    store,
    (payload: unknown) =>
      ({ type: DefaultActions.ASYNC_ACTION, payload } as Action<unknown>)
  );
