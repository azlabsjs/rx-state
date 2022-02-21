import { createSubject, observableOf } from '../helpers';
import { isObservable, Observable } from 'rxjs';
import { scan, filter, startWith, concatMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '../operators';
import {
  ActionType,
  SelecPropType,
  SelectAware,
  StateReducerFn,
  Store,
} from '../types';
import { addStateChanges } from './internals';
import { Select } from './helpers';

declare const ngDevMode: boolean;

export class FluxStore<T, A extends ActionType>
  implements Store<T, A>, SelectAware<T> {
  // @internal
  // Store internal state
  private readonly _state$ = createSubject<T>(1);

  // tslint:disable-next-line: variable-name
  state$: Observable<T> = this._state$.asObservable();

  // @internal
  // tslint:disable-next-line: variable-name
  private _actions$ = createSubject<A | Observable<A>>();

  // Instance initializer
  constructor(reducer: StateReducerFn<T, A>, initial: T) {
    this.subscribeToActions(reducer, initial);
  }

  select = <RType>(prop: SelecPropType<T, RType>): Observable<RType> =>
    this.state$.pipe(Select(prop));

  dispatch = (action: A | Observable<A>) => this._actions$.next(action);

  connect = () => this.state$;

  destroy() {
    // TODO : In future release check if this should be done
    this._state$.complete();
  }

  // @internal
  private _applyReducer = (
    reducer: StateReducerFn<T, A>,
    previous: any,
    current: any
  ) => {
    const type = (current as A)?.type;
    if (typeof type === 'undefined' || type === null) {
      return reducer(previous as T, current as A);
    }
    const nextState = reducer(previous as T, current as A);
    if ('name' in this) {
      addStateChanges(
        ((store: { [prop: string]: any }) => {
          return store['name'];
        })(this),
        [type, previous as T, nextState as T]
      );
    }
    return nextState;
  };

  // @internal
  private subscribeToActions = (reducer: StateReducerFn<T, A>, initial: T) => {
    this._actions$
      .pipe(
        untilDestroyed(this, 'destroy'),
        concatMap(action =>
          isObservable(action)
            ? (action as Observable<A>)
            : (observableOf<A>(action) as Observable<A>)
        ),
        filter(state => typeof state !== 'undefined' && state !== null),
        startWith(initial),
        scan((previous, current) => {
          if (ngDevMode || process?.env?.NODE_ENV !== 'production') {
            this._applyReducer(reducer, previous, current);
          }
          return reducer(previous as T, current as A);
        }),
        tap(state => this._state$.next(state as T))
      )
      .subscribe();
  };
}
