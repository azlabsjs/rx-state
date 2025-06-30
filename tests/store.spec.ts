import {
  createActionDispatcher,
  createStore,
  observableOf,
  Action,
  useDispatch,
  Store,
  createReducer,
  ActionType,
  StoreType,
} from '../src';
import { delay, map, first, tap } from 'rxjs/operators';
import { interval, lastValueFrom } from 'rxjs';
import { Select } from '../src/operators';
import { FluxStore } from '../src/state';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    case '[MESSAGES_UPDATE]': {
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
    }
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

function StoreProvider() {
  const store = createStore(
    reducer,
    {
      isLoading: false,
      messages: [],
    },
    'messages'
  );
  return [store, useDispatch(store)] as [
    StoreType<MessageState, ActionType>,
    (action: ActionType) => void,
  ];
}
@Store({
  name: 'dummy',
})
class DummyStore extends FluxStore<number, Action<number>> {}

describe('Rx state test definitions', () => {
  it('Expect Store to be updated by value provided to action creator parameters', async () => {
    const [store] = StoreProvider();
    const messagesAction = createActionDispatcher(
      store,
      (messages: Partial<Message>[]) => {
        return {
          type: '[MESSAGES_LOADED]',
          payload: messages,
        };
      }
    );
    const updateAction = createActionDispatcher(store, (payload) => {
      return {
        type: '[MESSAGES_UPDATE]',
        payload,
      };
    });
    const asyncAction = createActionDispatcher(store, (payload: Message) => {
      return {
        type: '[MESSAGES_LOADING]',
        payload: observableOf<Message>(payload).pipe(
          delay(1000),
          map(
            (source) =>
              ({
                type: '[NEW_MESSAGE]',
                payload: source,
              }) as Partial<Action<Message>>
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
      interval(1000).pipe(
        first(),
        tap(() => {
          store
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
        })
      )
    );
  });

  it('Dispatch an action to the Messages Store', async () => {
    const [store, dispatch] = StoreProvider();
    dispatch({
      type: '[EMPTY_STORE_MESSAGES]',
    });

    await lastValueFrom(
      interval(1000).pipe(
        first(),
        tap(() => {
          store
            .select<Message[]>('messages')
            .pipe(
              tap((state) => {
                expect(state).toEqual([]);
              })
            )
            .subscribe();
        })
      )
    );
  });

  it('should return the list of messages when a selector is called on the state', async () => {
    const [store, dispatch] = StoreProvider();
    dispatch({
      type: '[EMPTY_STORE_MESSAGES]',
    });

    await lastValueFrom(
      interval(1000).pipe(
        first(),
        tap(() => {
          store
            .connect()
            .pipe(
              Select((state) => state.messages),
              tap((state) => {
                expect(state).toEqual([]);
              })
            )
            .subscribe();
        })
      )
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
    const dispatch = useDispatch(store);
    dispatch({ type: '[INCREMENTS]' });
    dispatch({ type: '[INCREMENTS]' });

    await lastValueFrom(
      interval(1000).pipe(
        first(),
        tap(() => {
          store
            .connect()
            .pipe(
              tap((state) => {
                expect(state).toEqual(2);
              })
            )
            .subscribe();
        })
      )
    );
  });
});
