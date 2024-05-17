import { dispatchAction } from '../internals/rx-state';
import { Store } from '../types';

/**
 * Create a store action dispatcher callable on a {@see Store} object
 *
 * @example
 * const store = createStore((state, action) => {...}, { ... }, 'examples');
 *
 * // Dispatch an action to the store
 * useDispatch(store)({type: '[EXAMPLES_LIST]', payload: [...]});
 *
 * @param store
 *
 */
export function useDispatch<T, A>(store: Store<T, A>) {
  return (action: A) => {
    return dispatchAction(store, action);
  };
}
