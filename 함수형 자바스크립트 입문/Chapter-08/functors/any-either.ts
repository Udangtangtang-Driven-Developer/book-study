export class Nothing {
  #value: any;
  private constructor(value: any) {
    this.#value = value;
  }

  public static of(value: any): Nothing {
    return new Nothing(value);
  }

  public isNothing(): this is Nothing {
    return true;
  }

  public map(_fn: (x: any) => any): any {
    return this;
  }

  public get value(): any {
    return this.#value;
  }
}

export class Some {
  #value: any;

  private constructor(value: any) {
    this.#value = value;
  }

  public isNothing(): this is Nothing {
    return false;
  }

  public static of(value: any): Some {
    return new Some(value);
  }

  public map(fn: (x: any) => any): any {
    return Some.of(fn(this.#value));
  }

  public get value(): any {
    return this.#value;
  }
}

export type AnyEither = Nothing | Some;
