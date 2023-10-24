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
