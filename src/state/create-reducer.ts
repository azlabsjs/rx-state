import { ActionType, ReducersConfig, StateReducerFn } from '../types';
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
