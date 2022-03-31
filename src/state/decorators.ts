import { setStoreName } from './internals';

type PropsType = {
  name: string;
};

export function Store(props: PropsType) {
  return <T extends { new (...args: any[]): Record<string, any> }>(
    constructor: T
  ) => {
    return setStoreName(class extends constructor {}, props.name);
  };
}
