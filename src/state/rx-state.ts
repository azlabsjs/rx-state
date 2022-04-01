import {
  isObservable,
  Observable,
  of,
  OperatorFunction,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  scan,
  filter,
  concatMap,
  tap,
  distinctUntilChanged,
} from 'rxjs/operators';
import {
  ActionType,
  SelecPropType,
  SelectAware,
  StateReducerFn,
  Store,
} from '../types';
import { addStateChanges } from '../internals/rx-state';
import { useRxEffect } from './hooks';
import { Select } from '../operators/rx-state';
import { ___RX_STATE__DEV__ } from '../internals/dev';

export class FluxStore<T, A extends ActionType>
  implements Store<T, A>, SelectAware<T>
{
  // @internal
  // Store internal state
  private readonly _state$ = new ReplaySubject<T>(1);

  // tslint:disable-next-line: variable-name
  state$: Observable<T> = this._state$.asObservable();

  // @internal
  // tslint:disable-next-line: variable-name
  // Internal action dispatcher subject for passing control
  // internal state handler
  private _dispatch$ = new Subject<A | Observable<A>>();

  // @internal
  // Internal action cache that memoized action dispatched though
  // the lifetime of the store
  private _actions$ = new ReplaySubject<A>();

  // @internal
  // Dispatched actions observable cache that developpers can subscribe to
  // to execute side effects based on action type
  public readonly actions$ = this._actions$.asObservable();

  private _destroy$!: any;

  // Instance initializer
  constructor(private reducer: StateReducerFn<T, A>, initial: T) {
    this._destroy$ = useRxEffect(
      this._dispatch$.pipe(
        concatMap((action) =>
          isObservable(action)
            ? (action as Observable<A>)
            : (of<A>(action) as Observable<A>)
        ),
        distinctUntilChanged(),
        tap((state) => this._actions$.next(state)),
        filter((state) => typeof state !== 'undefined' && state !== null),
        scan((previous, current) => {
          if (___RX_STATE__DEV__ || process?.env.NODE_ENV !== 'production') {
            return this._applyReducer(this.reducer, previous, current);
          }
          return this.reducer(previous as T, current as A);
        }, initial),
        distinctUntilChanged(),
        tap((state) => this._state$.next(state as T))
      ),
      () => {
        // Unsubscribe to state updates
        if (!this._state$.closed) {
          this._state$.complete();
        }
      }
    );
  }

  /**
   * Select part of the store object
   * 
   * **Warning**
   * The implementation provides a key based or function based selection
   * function. For performance reason avoid performing having computation
   * when you provide function.
   * For long running selector, or heavy compution selector, use {@see rxSelect}
   * from the @iazlabs/rx-select library or use any memoized selector implementation
   *
   * @param prop
   */
  select = <R>(prop: SelecPropType<T, R>) =>
    this.state$.pipe(Select(prop) as OperatorFunction<T, R>);

  /**
   * Dispatch an action into the store
   * 
   * There is a functional insterface which create a dispatcher function
   * by wrapping the store with a {@see useDispatch} method
   * 
   * ```js
   * import {useDispatch} from '@iazlabs/rx-state';
   * 
   * // ...
   * 
   * const dispatch = useDispatch(store); // The store object was previously
   * // created by an above code
   * 
   * // Dispatching a action
   * dispatch({
   *  type: '[INCREMENTS]'
   * });
   * ```
   * 
   * @param action 
   */
  dispatch(action: A | Observable<A>) {
    this._dispatch$.next(action);
  }

  connect = () => this.state$;

  destroy() {
    this._destroy$.complete();
  }

  // @internal
  private _applyReducer = (
    reducer: StateReducerFn<T, A>,
    previous: T,
    current: A
  ) => {
    if (typeof current?.type === 'undefined' || current?.type === null) {
      return reducer(previous, current);
    }
    const nextState = reducer(previous, current);
    if ('name' in this) {
      addStateChanges(this['name'], [current?.type, previous, nextState]);
    }
    return nextState;
  };
}
