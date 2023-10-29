export class Maybe<T> {
  #value: T | null;

  private constructor(value: T | null) {
    this.#value = value;
  }

  public static just<T>(value: T) {
    if (!value) throw Error("Provided value must not be empty");

    return new Maybe(value);
  }

  public static nothing<T>() {
    return new Maybe<T>(null);
  }

  public static of<T>(value: T) {
    return value ? Maybe.just(value) : Maybe.nothing<T>();
  }

  public isNothing() {
    return this.#value === null || this.#value === undefined;
  }

  /**
   * 만약 this.#value가 null이거나 undefined라면 defaultValue를 반환한다.
   */
  public getOrElse<U>(defaultValue: U): T | U {
    return this.isNothing() ? defaultValue : (this.#value as T);
  }

  public map<U>(fn: (wrapped: T) => U): Maybe<U> {
    return this.isNothing()
      ? Maybe.nothing<U>()
      : Maybe.of(fn(this.#value as T));
  }
}
