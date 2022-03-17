import {
  createActionDispatcher,
  createStore,
  observableOf,
  Action,
  Dispatch,
  Store,
  createReducer,
  Select,
  rxtimeout,
} from '../src';
import { delay, map, tap } from 'rxjs/operators';
import { FluxStore } from '../src/state';
import { lastValueFrom } from 'rxjs';

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
      const index = messages.findIndex(
        (value) => value.id === action.payload.id
      );
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

describe('Rx state test definitions', () => {
  it('Expect Store to be updated by value provided to action creator parameters', async () => {
    const provider = new StoreProvider();
    const messagesAction = createActionDispatcher(
      provider.store$,
      (messages: Partial<Message>[]) => {
        return {
          type: '[MESSAGES_LOADED]',
          payload: messages,
        };
      }
    );
    const updateAction = createActionDispatcher(provider.store$, (payload) => {
      return {
        type: '[MESSAGES_UPDATE]',
        payload,
      };
    });
    const asyncAction = createActionDispatcher(provider.store$, (payload: Message) => {
      return {
        type: '[MESSAGES_LOADING]',
        payload: observableOf<Message>(payload).pipe(
          delay(1000),
          map(
            (source) =>
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
    await lastValueFrom(
      rxtimeout(() => {
        provider.store$
          .connect()
          .pipe()
          .subscribe((value) => {
            expect(value.messages).toEqual([
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
      }, 1000)
    );
  });

  it('Dispatch an action to the Messages Store', async () => {
    const provider = new StoreProvider();
    Dispatch(provider.store$)({
      type: '[EMPTY_STORE_MESSAGES]',
    });

    await lastValueFrom(
      rxtimeout(() => {
        provider.store$
          .select<Message[]>('messages')
          .pipe(
            tap((state) => {
              expect(state).toEqual([]);
            })
          )
          .subscribe();
      }, 1000)
    );
  });

  it('should return the list of messages when a selector is called on the state', async () => {
    const provider = new StoreProvider();
    Dispatch(provider.store$)({
      type: '[EMPTY_STORE_MESSAGES]',
    });

    await lastValueFrom(
      rxtimeout(() => {
        provider.store$
        .connect()
        .pipe(
          Select((state) => state.messages),
          tap((state) => {
            expect(state).toEqual([]);
          })
        )
        .subscribe();
      }, 1000)
    );
  });

  it('should test decorated store class', async () => {
    const store = new DummyStore(
      createReducer({
        '[INCREMENTS]': (state) => ++state,
        '[DECREMENTS]': (state) => --state,
      }),
      0
    );
    Dispatch(store)({ type: '[INCREMENTS]' });
    Dispatch(store)({ type: '[INCREMENTS]' });
    await new Promise<void>((resolve) => {
      store
        .connect()
        .pipe(
          tap((state) => {
            expect(state).toEqual(2);
            resolve();
          })
        )
        .subscribe();
    });
  });
});