import { setStoreName } from './internals';

type PropsType = {
  name: string;
};

export const Store = (props: PropsType) => <T extends Object>(store: T) => {
  return setStoreName(store, props.name) as T;
};
