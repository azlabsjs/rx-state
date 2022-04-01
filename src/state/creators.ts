import {
  ActionCreatorHandlerFn as HandlerFn,
  ActionType,
  StateReducerFn,
  Store,
} from '../types';
import { dispatchAction, setStoreName } from '../internals/rx-state';
import { FluxStore } from './rx-state';

/**
 * Create a store action function that will be dispatch
 * to the store when called on a given argumen
 *
 * @param store
 * @param handler
 */
export const createActionDispatcher =
  <T, A, S extends Store<T, A>, P extends unknown[] = any[]>(
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
export const createStore = <T, A extends ActionType>(
  reducer: StateReducerFn<T, A>,
  initial: T,
  name: string | undefined = undefined
) =>
  name
    ? (setStoreName(new FluxStore(reducer, initial), name) as FluxStore<T, A>)
    : new FluxStore(reducer, initial);
