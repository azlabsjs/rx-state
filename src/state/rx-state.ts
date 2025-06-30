import { useRxEffect } from '@azlabsjs/rx-hooks';
import {
  isObservable,
  Observable,
  of,
  OperatorFunction,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  scan,
  tap,
} from 'rxjs/operators';
import { ___RX_STATE__DEV__ } from '../internals/dev';
import { addStateChanges } from '../internals/rx-state';
import { Select } from '../operators/rx-state';
import {
  ActionType,
  SelecPropType,
  SelectAware,
  StateReducerFn,
  Store,
} from '../types';

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

  // Instance initializer
  constructor(
    private reducer: StateReducerFn<T, A>,
    initial: T
  ) {
    useRxEffect(
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
            return this.reduce(this.reducer, previous, current);
          }
          return this.reducer(previous as T, current as A);
        }, initial),
        distinctUntilChanged(),
        tap((state) => this._state$.next(state as T))
      ),
      [this, 'destroy']
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
   * from the @azlabsjs/rx-select library or use any memoized selector implementation
   *
   * @param prop
   */
  select<R>(prop: SelecPropType<T, R>) {
    return this.state$.pipe(Select(prop) as OperatorFunction<T, R>);
  }

  /**
   * Dispatch an action into the store
   *
   * There is a functional insterface which create a dispatcher function
   * by wrapping the store with a {@see useDispatch} method
   *
   * ```js
   * import {useDispatch} from '@azlabsjs/rx-state';
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

  connect() {
    return this.state$;
  }

  destroy() {
    // Unsubscribe to state updates
    if (!this._state$.closed) {
      this._state$.complete();
    }
  }

  // @internal
  private reduce(
    reducer: StateReducerFn<T, A>,
    previous: T,
    current: A
  ) {
    if (typeof current?.type === 'undefined' || current?.type === null) {
      return reducer(previous, current);
    }
    const nextState = reducer(previous, current);
    if ('name' in this) {
      addStateChanges(this['name'] as symbol, [
        current?.type,
        previous,
        nextState,
      ]);
    }
    return nextState;
  }
}
