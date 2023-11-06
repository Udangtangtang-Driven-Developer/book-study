export function sum(x: number, y: number) {
  return x + y;
}
type VariadicFunction = (...args: any[]) => any;

type FirstParameter<F> = F extends (arg1: infer A, ...args: any[]) => any
  ? A
  : never;
type RemainingParameters<F> = F extends (arg1: any, ...args: infer A) => any
  ? A
  : never;

type VariadicCurry<F extends VariadicFunction> = {
  (...args: Parameters<F>): ReturnType<F>;
  (arg: FirstParameter<F>): VariadicCurry<
    (...args: RemainingParameters<F>) => ReturnType<F>
  >;
};

export const curryN = <F extends VariadicFunction>(fn: F): VariadicCurry<F> => {
  const arity = fn.length;

  const _curry = (...args: any[]): any =>
    args.length < arity ? curryN(_curry.bind(null, ...args)) : fn(...args);

  return _curry as VariadicCurry<F>;
};

export class Container<T> {
  #value: T;

  public constructor(value: T) {
    this.#value = value;
  }

  public get value(): T {
    return this.#value;
  }

  public static of<U>(value: U): Container<U> {
    return new Container(value);
  }

  public map<U>(fn: (x: T) => U): Container<U> {
    return Container.of(fn(this.#value));
  }
}

type Nothing = void | null | undefined;

export type Just<T> = T;

export class MayBe<T> {
  #value: T;

  public constructor(value: T) {
    this.#value = value;
  }

  public get value(): Just<T> | Nothing {
    return this.#value;
  }

  public static of<U>(value: U): MayBe<U> {
    return new MayBe(value);
  }

  public isNothing(): boolean {
    return this.#value === null || this.#value === undefined;
  }

  public map<U>(fn: (x: T) => U): MayBe<U | null> {
    return this.isNothing() ? MayBe.of(null) : MayBe.of(fn(this.#value));
  }
}
