import { filter, map, Observable } from 'rxjs';
import { getObjectProperty } from '../internals/rx-state';
import { ActionType, SelecPropType, SelectorReturnType } from '../types';

// @internal
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
          return getObjectProperty(state as any, prop) as V;
        }
        return state as any as V;
      })
    );
  };
}

/**
 * Creates an RxJS operator for filtering store actions
 * based on the developper provided type
 *
 * @param action
 */
export function ofType(action: ActionType | string) {
  return (source: Observable<ActionType>) => {
    return source.pipe(
      filter(
        (state) =>
          typeof action !== 'undefined' &&
          action !== null &&
          (typeof action === 'string'
            ? state.type === action
            : state.type === action?.type)
      )
    );
  };
}
