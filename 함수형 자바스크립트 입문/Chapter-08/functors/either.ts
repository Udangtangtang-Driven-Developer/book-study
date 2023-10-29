export class Left<T> {
  readonly _tag = "Left" as const;
  readonly #error: T;

  private constructor(error: T) {
    this.#error = error;
  }

  isLeft(): this is Left<T> {
    return this._tag === "Left";
  }

  isRight(): this is Right<never> {
    return !this.isLeft();
  }

  static of<U>(error: U): Left<U> {
    return new Left(error);
  }

  public map<U>(_fn: (x: T) => U): Either<T, never> {
    return this;
  }

  public get value(): T {
    return this.#error;
  }
}

export class Right<T> {
  readonly _tag = "Right" as const;
  readonly #value: T;

  private constructor(value: T) {
    this.#value = value;
  }

  isLeft(): this is Left<never> {
    return !this.isRight();
  }

  isRight(): this is Right<T> {
    return this._tag === "Right";
  }

  static of<U>(value: U): Right<U> {
    return new Right(value);
  }

  public map<U>(fn: (x: T) => U): Either<never, U> {
    return Right.of(fn(this.value));
  }

  public get value(): T {
    return this.#value;
  }
}

export type Either<T, U> = Left<T> | Right<U>;
