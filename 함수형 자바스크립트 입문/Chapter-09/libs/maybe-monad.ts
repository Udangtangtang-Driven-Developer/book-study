export class MaybeMonad<T> {
  #value: T | null;

  private constructor(value: T | null) {
    this.#value = value;
  }

  public static just<T>(value: T) {
    if (!value) throw Error("Provided value must not be empty");

    return new MaybeMonad(value);
  }

  public static nothing<T>() {
    return new MaybeMonad<T>(null);
  }

  public static of<T>(value: T) {
    return value ? MaybeMonad.just(value) : MaybeMonad.nothing<T>();
  }

  public isNothing() {
    return this.#value === null || this.#value === undefined;
  }

  public getOrElse<U>(defaultValue: U): T | U {
    return this.isNothing() ? defaultValue : (this.#value as T);
  }

  public map<U>(fn: (wrapped: T) => U): MaybeMonad<U> {
    return this.isNothing()
      ? MaybeMonad.nothing<U>()
      : MaybeMonad.of(fn(this.#value as T));
  }

  public flatMap<U>(fn: (wrapped: T) => MaybeMonad<U>): MaybeMonad<U> {
    return this.isNothing() ? MaybeMonad.nothing<U>() : fn(this.#value as T);
  }

  public flatten(): T | null {
    return this.isNothing() ? null : (this.#value as T);
  }
}
