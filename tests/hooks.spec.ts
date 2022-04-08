import { interval, lastValueFrom } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { Action, Store, createReducer, useDispatch, ofType } from '../src';
import { FluxStore } from '../src/state';

@Store({
  name: 'dummy',
})
class DummyStore extends FluxStore<number, Action<number>> {}

describe('Test hooks implementation', () => {
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

    store.actions$
      .pipe(
        ofType('[INCREMENTS]'),
        tap((state) => (lastAction = state.type))
      )
      .subscribe();

    await lastValueFrom(
      interval(2000).pipe(
        first(),
        tap(() => expect(lastAction).not.toEqual('[DECREMENTS]'))
      )
    );
  });
});
