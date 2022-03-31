import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Action,
  ActionType,
  ReducersConfig,
  SelecPropType,
  SelectorReturnType,
  StateReducerFn,
  Store,
} from '../types';
import { createActionDispatcher } from './creators';
import { getObjectProperty, getStores } from './internals';

/**
 * Create a store action dispatcher callable on a {@see Store} object
 *
 * @example
 * const store = createStore((state, action) => {...}, { ... }, 'examples');
 *
 * // Dispatch an action to the store
 * Dispatch(store)({type: '[EXAMPLES_LIST]', payload: [...]});
 *
 * @param store
 * @returns
 */
export const Dispatch =
  <T, A>(store: Store<T, A>) =>
  (action: Action<T> | any) =>
    createActionDispatcher(store, action);

/**
 * Runs stores destructor method on each store object in the global context
 *
 * @examples
 * // Application global
 *
 * @returns
 */
export const Destroy = () =>
  Array.from(getStores().values()).forEach((store: any) => {
    if (typeof store?.destroy === 'function') {
      store.destroy();
    }
  });

export function Select<T, V = unknown>(
  prop?: SelecPropType<T, V>
): SelectorReturnType<T, V> {
  return (source$: Observable<T>) => {
    return source$.pipe(
      map((state) => {
        if (typeof prop === 'function') {
          return prop(state);
        }
        if (typeof prop === 'string' && typeof state === 'object') {
          console.log(prop, state);
          return getObjectProperty(state as any, prop) as V;
        }
        return state as any as V;
      })
    );
  };
}

/**
 * Create a state reducer function that can use use in {@see Store<T,A>}
 * as reducer using configurations from a object
 *
 * @example
 *
 * const store = createStore(createReducer({
 *  '[INCREMENT]': (state, action)
 *                  => ({counter: state.counter + +action.payload}),
 *  // Other actions...
 * }),
 *
 * {
 *  // Initial state defintion ...
 *  counter: 0
 * })
 *
 * // Case the reducer does not require
 *
 * const store = createStore(createReducer({'[INCREMENT]': (state: T) => ({counter: ++state.counter}) }),
 * {
 *  // Initial state defintion ...
 *  counter: 0
 * })
 *
 * @param config
 */
export function createReducer<T, A extends ActionType = any>(
  config: ReducersConfig<T, A>
): StateReducerFn<T, A> {
  return (state: T, action: A) => {
    if (action.type in config) {
      return config[action.type](state, action);
    }
    return state;
  };
}
