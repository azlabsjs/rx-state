import { setStoreName } from './internals';

type PropsType = {
  name: string;
};

export const Store =
  (props: PropsType) =>
  <T extends Record<string, any> | object>(store: T) => {
    return setStoreName(store, props.name) as T;
  };
