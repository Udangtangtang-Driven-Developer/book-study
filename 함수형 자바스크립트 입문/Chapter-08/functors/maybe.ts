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
