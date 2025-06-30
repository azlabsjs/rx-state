import {
  ActionCreatorHandlerFn as HandlerFn,
  ActionType,
  StateReducerFn,
  Store,
} from '../types';
import { dispatchAction, registerStoreInGlobalRegistry } from '../internals/rx-state';
import { FluxStore } from './rx-state';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownType = any;

/**
 * @deprecated
 * Create a store action function that will be dispatch
 * to the store when called on a given argumen
 *
 * @param store
 * @param handler
 */
export const createActionDispatcher =
  <T, A, S extends Store<T, A>, P extends unknown[] = UnknownType[]>(
    store: S,
    handler: HandlerFn
  ) =>
  (...args: P) =>
    dispatchAction(store, handler(...args) as ActionType);

/**
 * Creator function for creating a store object\
 *
 * @example
 * // Create a store with a name that is registered in the global context
 * const store = createStore((state, action) => {...}, { ... }, 'examples');
 *
 * // Creates a store without adding it to the global __DEV__STORE__ context
 * const store = createStore((state, action) => {...}, { ... });
 *
 * @param reducer
 * @param initial
 * @param name
 */
export function createStore<T, A extends ActionType>(
  reducer: StateReducerFn<T, A>,
  initial?: T,
  name?: string
) {
  const store = name
    ? registerStoreInGlobalRegistry(new FluxStore(reducer, (initial || {}) as T), name)
    : new FluxStore(reducer, (initial || {}) as T);
  return store as Store<T, A>;
}
