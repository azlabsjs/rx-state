import { registerStoreInGlobalRegistry } from '../internals/rx-state';
import { Store as _Store } from '../types';

/** @internal */
type PropsType = {
  name: string;
};

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownType = any;

type StoreClassContructor = {
  new (
    ...args: UnknownType[]
  ): _Store<UnknownType, UnknownType> &
    Record<string | number | symbol, UnknownType>;
};

export function Store(props: PropsType) {
  return <T extends StoreClassContructor = StoreClassContructor>(constructor: T) => {
    return registerStoreInGlobalRegistry(
      class extends constructor {},
      props.name
    );
  };
}

// export function Store<T, A extends ActionType>(props: PropsType) {
//   return function <TClass extends ClassContructor>(constructor: TClass) {
//     class _extended extends FluxStore<T, A> {
//       constructor(
//         reducer: StateReducerFn<T, A>,
//         initial: T,
//         ...args: UnknownType[]
//       ) {
//         // Call the Base class constructor first
//         super(reducer, initial);

//         const originalInstance = Reflect.construct(
//           constructor,
//           args,
//           _extended
//         );

//         Object.keys(originalInstance).forEach((key) => {
//           if (['reducer', 'initial'].indexOf(key) === -1) {
//             this[key as keyof typeof this] = originalInstance[
//               key
//             ] as UnknownType;
//           }
//         });
//       }
//     }

//     // Copy static properties from the original class to extended class
//     Object.getOwnPropertyNames(constructor)
//       .filter(
//         (prop) => prop !== 'prototype' && prop !== 'length' && prop !== 'name'
//       )
//       .forEach((prop) => {
//         const descriptor = Object.getOwnPropertyDescriptor(constructor, prop);
//         if (descriptor) {
//           Object.defineProperty(_extended, prop, descriptor);
//         }
//       });

//     // copy static method from the original class to extended class
//     Object.getOwnPropertyNames(constructor.prototype)
//       .filter((prop) => prop !== 'constructor')
//       .forEach((prop) => {
//         const descriptor = Object.getOwnPropertyDescriptor(
//           constructor.prototype,
//           prop
//         );
//         if (descriptor) {
//           Object.defineProperty(_extended.prototype, prop, descriptor);
//         }
//       });

//     return registerStoreInGlobalRegistry(_extended, props.name);

//     return _extended as unknown as TClass & FluxStore<T, A>;
//   };
// }
