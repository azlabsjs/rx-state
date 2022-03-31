import { interval, lastValueFrom, Subject } from 'rxjs';
import { tap, takeUntil, first } from 'rxjs/operators';
import {
  Action,
  Store,
  useRxReducer,
  useRxState,
  createReducer,
  useDispatch,
  ofType,
  useRxEffect
} from '../src';
import { FluxStore } from '../src/state';

// @internal Provides an instance of javascript global context
const global_ = !(typeof global === 'undefined' || global === null)
  ? global
  : !(typeof window === 'undefined' || window === null)
  ? window
  : ({} as any);

global_.ngDevMode = false;

@Store({
  name: 'dummy',
})
class DummyStore extends FluxStore<number, Action<number>> {}

describe('Test hooks implementation', () => {
  it('states should contains the initial state and the last emitted state value', async () => {
    const states: number[][] = [];
    const [state, setState] = useRxState<number[]>([], 1);
    const _done$ = new Subject<void>();

    setState([1, 2, 4, 5]);
    setState([1, 2, 5]);
    setState([1, 23, 5, 6]);
    state
      .pipe(
        tap((state) => states.push(state)),
        takeUntil(_done$)
      )
      .subscribe();

    await lastValueFrom(
      interval(1000).pipe(
        first(),
        tap(() => {
          expect(states[0]).toEqual([]);
          expect(states[1]).toEqual([1, 23, 5, 6]);
          _done$.next();
        })
      )
    );
  });

  it('states should contains all changes on the local state object', async () => {
    const changes: object[] = [];
    const [car, setCar] = useRxState({
      brand: 'Ford',
      model: 'Mustang',
      year: '1964',
      color: 'red',
    });
    const _done$ = new Subject<void>();

    car
      .pipe(
        tap((state) => changes.push(state)),
        takeUntil(_done$)
      )
      .subscribe();

    setCar((previousState) => {
      return { ...previousState, color: 'blue' };
    });
    setCar((previousState) => {
      return { ...previousState, model: 'DWaggen' };
    });

    await lastValueFrom(
      interval(1000).pipe(
        first(),
        tap(() => {
          expect(changes[0]).toEqual({
            brand: 'Ford',
            model: 'Mustang',
            year: '1964',
            color: 'red',
          });
          expect(changes[1]).toEqual({
            brand: 'Ford',
            model: 'Mustang',
            year: '1964',
            color: 'blue',
          });
          expect(changes[2]).toEqual({
            brand: 'Ford',
            model: 'DWaggen',
            year: '1964',
            color: 'blue',
          });
          _done$.next();
        })
      )
    );
  });

  it('changes should contains all state changes', async () => {
    const changes: object[] = [];
    const [state, dispatch] = useRxReducer(
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

    state.pipe(tap((state) => changes.push(state))).subscribe();

    dispatch({ type: 'push', payload: 1 });
    dispatch({ type: 'push', payload: 2 });
    dispatch({ type: 'push', payload: 4 });
    dispatch({ type: 'pop' });
    await lastValueFrom(
      interval(1000).pipe(
        first(),
        tap(() => {
          expect(changes[0]).toEqual([]);
          expect(changes[1]).toEqual([1]);
          expect(changes[2]).toEqual([1, 2]);
          expect(changes[3]).toEqual([1, 2, 4]);
          expect(changes[4]).toEqual([1, 2]);
        })
      )
    );
  });

  // useRxEffect tests
  it('should return false for the last disptached action is [DECREMENTS] by ofType filter [INCREMENTS] actions', async () => {
    let lastAction: String;
    const store = new DummyStore(
      createReducer({
        '[INCREMENTS]': (state) => {
          return ++state;
        },
        '[DECREMENTS]': (state) => --state,
      }),
      0
    );
    useDispatch(store)({ type: '[INCREMENTS]' });
    useDispatch(store)({ type: '[INCREMENTS]' });
    useDispatch(store)({ type: '[DECREMENTS]' });

    useRxEffect(
      store.actions$.pipe(
        ofType('[INCREMENTS]'),
        tap((state) => (lastAction = state.type))
      )
    );
    await lastValueFrom(
      interval(2000).pipe(
        first(),
        tap(() => expect(lastAction).not.toEqual('[DECREMENTS]'))
      )
    );
  });
});
