import { memoize } from '@iazlabs/functional';
import { Observable, ReplaySubject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  scan,
  startWith,
  tap,
} from 'rxjs/operators';

type SetStateFunctionType<T = any> = (previous: T) => T;
type UseStateReturnType<T> = readonly [
  Observable<T>,
  (state: T | SetStateFunctionType<T>) => void
];
type UseReducerReturnType<T, ActionType> = readonly [
  Observable<T>,
  (state: ActionType) => unknown
];

/**
 * {@see useRxState} is an experimental but working implementation of redux
 * useState hooks for angular local component state management
 * 
 * **Warning**
 * As the API is experimental, you should use it at your own risk.😁
 * 
 * **Note**
 * By default, we maintains only the last produced state value in cache, but the
 * function takes a bufferSize as second parameter to allow developper to configure
 * how many state changes should be retains before flushing old states
 * 
 * ```js
 *  const [car, setCar] = useRxState({
        brand: 'Ford',
        model: 'Mustang',
        year: '1964',
        color: 'red',
    });

    state.pipe(tap(console.log)).subscribe();
    car.pipe(tap(console.log)).subscribe();
    setState([1, 23, 5, 6, 7]);
    setState([1, 23, 5, 6, 7, 10]);

    setCar((previousState) => {
        return { ...previousState, color: 'blue' };
    });
    setCar((previousState) => {
        return { ...previousState, brand: 'DWaggen' };
    });

    // Creating an infinite state observable
    const [state, setState] = useRxState([], Infinity);
 * ```
 * 
 * 
 * @param initial 
 * @returns 
 */
export function useRxState<T = any>(initial: T, bufferSize = Infinity) {
  // We use a buffer of size 4 to maintain only
  // The last emitted value by the setState function
  // We use ReplaySubject instead of Behaviour subject
  // because we don't want to invoke the function if the value of
  // the initial state should be computed using a function
  const _subject = new ReplaySubject(bufferSize);

  // Variable is used to keep track of the previous value
  // produced by the observable, so that when {@see setState}
  // is called with a callback we pass the previously emitted
  // value to the developper
  let _previous!: T;

  // Provides a memoization implementation arround the inital
  // if the initial value is a function type
  const _initial = (
    typeof initial === 'function' ? memoize(initial as any) : initial
  ) as any;

  // @internal - Function to update state object
  // Mutate or update the state of value wrapped by the useRxState()
  // function. It does not insure immutability by default
  // there for developer should develop with immutability in mind
  const setState = (_state: unknown | SetStateFunctionType<unknown>) => {
    typeof _state === 'function'
      ? _subject.next((_state as SetStateFunctionType<unknown>)(_previous))
      : _subject.next(_state);
  };

  const state = _subject.pipe(
    startWith(typeof _initial === 'function' ? _initial() : _initial),
    distinctUntilChanged(),
    tap((state) => (_previous = state))
  ) as Observable<T>;

  // TODO: Add memoization in the function call
  return [state, setState] as UseStateReturnType<T>;
}

/**
 * {@see useRxReducer} is an experimental but yet working implementation
 * of react useReducer() hooks, for managing local state in angular components.
 * 
 * **Note**
 * As the API is experimental, you should use it at your own risk.😁
 * 
 * ```js
 * const [state2, dispatch] = useRxReducer(
    (state, action: { type: string; payload?: any }) => {
        switch (action.type) {
        case 'push':
            return [...state, action.payload];
        case 'pop':
            return state.slice(0, state.length - 1);
        default:
            return state;
        }
    },
    []
    );

    dispatch({ type: 'push', payload: 1 });
    dispatch({ type: 'push', payload: 2 });
 * ```
 * 
 * @param reducer 
 * @param initial 
 * @returns 
 */
export function useRxReducer<T, ActionType = any>(
  reducer: (state: T, action: ActionType) => unknown,
  initial: T,
  bufferSize = Infinity
) {
  // We create an infinite replay subject so that late
  // subscribers can access previously emitted value by the
  // observer
  const _action$ = new ReplaySubject<ActionType>(bufferSize);
  // Provides a memoization implementation arround the inital
  // if the initial value is a function type
  const _initial = (
    typeof initial === 'function' ? memoize(initial as any) : initial
  ) as any;

  /**
   * @description Action dispatcher
   */
  const dispatch = (action: ActionType) => {
    _action$.next(action);
  };

  const state = _action$.pipe(
    startWith(typeof _initial === 'function' ? _initial() : _initial),
    filter((state) => typeof state !== 'undefined' && state !== null),
    scan((state, action) => {
      return reducer(state as T, action as ActionType) as T;
    }),
    distinctUntilChanged()
  );

  return [state, dispatch] as UseReducerReturnType<T, ActionType>;
}


// type FunctionType = (...arg: unknown[]) => unknown | (() => unknown);
// /**
//  * Returns a stored value Provide a "create" function and an array of inputs.
//  * useMemo will recalculate the memoized value only if one of the inputs has changed.
//  *
//  * @param callback
//  * @returns
//  */
// export function useMemo(callback: FunctionType, args: unknown[] = []) {
//   let _previous!: unknown[];
//   let cache: unknown;
//   if (
//     typeof _previous === 'undefined' ||
//     _previous === null ||
//     !deepEqual(_previous, args)
//   ) {
//     cache = memoize(callback)(...args);
//   }
//   return cache;
// }
