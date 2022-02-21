import {
  createAction,
  createStore,
  observableOf,
  Action,
  timeout,
  doLog,
  resetStateAction,
  errorAction,
  Dispatch,
  Store,
  createReducer,
  Select,
} from '../src';
import { delay, map, tap } from 'rxjs/operators';
import { FluxStore } from '../src/state';

// @internal Provides an instance of javascript global context
const global_ = !(typeof global === 'undefined' || global === null)
  ? global
  : !(typeof window === 'undefined' || window === null)
  ? window
  : ({} as any);

global_.ngDevMode = false;

class Message {
  id!: string;
  subject!: string;
  content!: string;
  destination!: string;
}

class MessageState {
  isLoading!: boolean;
  messages!: Message[];
}

export default function reducer(state: MessageState, action: Action<any>) {
  switch (action.type) {
    case '[MESSAGES_LOADING]':
      return {
        ...state,
        isLoading: true,
      } as MessageState;
    case '[MESSAGES_LOADED]':
      return {
        ...state,
        isLoading: false,
        messages: action.payload,
      } as MessageState;
    case '[NEW_MESSAGE]':
      return {
        ...state,
        isLoading: false,
        messages: [...state.messages, action.payload],
      } as MessageState;
    case '[MESSAGES_UPDATE]':
      const messages = [...state.messages];
      const index = messages.findIndex(value => value.id === action.payload.id);
      if (index !== 1) {
        messages.splice(index, 1, { ...messages[index], ...action.payload });
      }
      return {
        ...state,
        isLoading: false,
        messages,
      };
    case '[EMPTY_STORE_MESSAGES]':
      return {
        ...state,
        isLoading: false,
        messages: [],
      };
    default:
      return state;
  }
}

class StoreProvider {
  store$ = createStore(
    reducer,
    {
      isLoading: false,
      messages: [],
    },
    'messages'
  );
}

@Store({
  name: 'dummy',
})
class DummyStore extends FluxStore<number, Action<number>> {}

const provider = new StoreProvider();

describe('Rx state test definitions', () => {
  it('Expect Store to be updated by value provided to action creator parameters', (done: jest.DoneCallback) => {
    const messagesAction = createAction(
      provider.store$,
      (messages: Partial<Message>[]) => {
        return {
          type: '[MESSAGES_LOADED]',
          payload: messages,
        };
      }
    );
    const updateAction = createAction(provider.store$, payload => {
      return {
        type: '[MESSAGES_UPDATE]',
        payload,
      };
    });
    const asyncAction = createAction(provider.store$, (payload: Message) => {
      return {
        type: '[MESSAGES_LOADING]',
        payload: observableOf<Message>(payload).pipe(
          doLog(),
          delay(1000),
          map(
            source =>
              ({
                type: '[NEW_MESSAGE]',
                payload: source,
              } as Partial<Action<Message>>)
          )
        ),
      };
    });
    messagesAction([
      {
        id: '0023',
        subject: 'New Subjec1',
        content: 'New Message content',
        destination: 'asmyns.platonnas29@gmail.com',
      },
    ]);
    updateAction({
      id: '0023',
      subject: 'Subject1 [UPDATED]',
    });
    asyncAction({
      id: '00450',
      subject: 'Loaded Message subject',
      content: 'Loaded Message content',
      destination: 'azandrewdevelopper@gmail.com',
    });
    resetStateAction(provider.store$)();
    errorAction(provider.store$)();
    timeout(() => {
      provider.store$
        .connect()
        .pipe()
        .subscribe(value => {
          expect(value).toEqual([
            {
              id: '0023',
              subject: 'Subject1 [UPDATED]',
              content: 'New Message content',
              destination: 'asmyns.platonnas29@gmail.com',
            },
            {
              id: '00450',
              subject: 'Loaded Message subject',
              content: 'Loaded Message content',
              destination: 'azandrewdevelopper@gmail.com',
            },
          ]);
        });
      done();
    }, 2000);
  });

  it('Dispatch an action to the Messages Store', (done: jest.DoneCallback) => {
    Dispatch(provider.store$)({
      type: '[EMPTY_STORE_MESSAGES]',
    });

    provider.store$
      .select<Message[]>('messages')
      .pipe(
        tap(state => {
          expect(state).toEqual([]);
          done();
        })
      )
      .subscribe();
  });

  it('should return the list of messages when a selector is called on the state', (done: jest.DoneCallback) => {
    Dispatch(provider.store$)({
      type: '[EMPTY_STORE_MESSAGES]',
    });

    provider.store$
      .connect()
      .pipe(
        Select(state => state.messages),
        tap(state => {
          expect(state).toEqual([]);
          done();
        })
      )
      .subscribe();
  });

  it('should test decorated store class', (done: jest.DoneCallback) => {
    const store = new DummyStore(
      createReducer({
        '[INCREMENTS]': state => ++state,
        '[DECREMENTS]': state => --state,
      }),
      0
    );
    Dispatch(store)({ type: '[INCREMENTS]' });
    Dispatch(store)({ type: '[INCREMENTS]' });
    store
      .connect()
      .pipe(
        tap(state => {
          expect(state).toEqual(2);
          done();
        })
      )
      .subscribe();
  });
});
