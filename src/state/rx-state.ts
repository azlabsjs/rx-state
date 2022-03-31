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
import { addStateChanges } from './internals';
import { Select } from './helpers';
import { useRxEffect } from './hooks';

declare const ngDevMode: boolean;

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

  private _actions$ = new ReplaySubject<A>();

  public readonly actions$ = this._actions$.asObservable();

  private _destroy$ = useRxEffect(
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
        if (ngDevMode || process?.env.NODE_ENV !== 'production') {
          return this._applyReducer(this.reducer, previous, current);
        }
        return this.reducer(previous as T, current as A);
      }, this.initial),
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

  // Instance initializer
  constructor(private reducer: StateReducerFn<T, A>, private initial: T) {}

  /**
   * Select part of the store object
   *
   * @param prop
   */
  select = <R>(prop: SelecPropType<T, R>) =>
    this.state$.pipe(Select(prop) as OperatorFunction<T, R>);

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
