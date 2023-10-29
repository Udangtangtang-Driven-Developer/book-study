# 함수자

이 챕터에서는 함수자와 함수자를 이용한 에러 핸들링을 다룬다

※ 해당 챕터의 모든 코드는 `bun index.ts` 로 실행해볼 수 있음

## 함수자 (Functor)

> 함수자란 기본적인 객체 (다른 언어에서는 타입 클래스)로, 객체 내의 각 값을 실행할 때 새로운 객체를 실행하는 map 함수를 구현한다.

정의만 보고는 이해하기 어려우니 코드를 작성해가면서 이해하자

### 함수자는 컨테이너다

간단하게 함수자는 값을 갖고 있는 컨테이너다.

```ts
type ClassType = new (...args: any[]) => any;

/**
 * 함수 형태로 나타낸 함수자
 */
const FContainer = function (this: any, val: any) {
  this.value = val;
};

/**
 * 클래스 형태로 나타낸 함수자
 */
class Container<T> {
  #value: T;

  public constructor(value: T) {
    this.#value = value;
  }

  public get value(): T {
    return this.#value;
  }
}

const fContainer = new (FContainer as unknown as ClassType)(3);

console.log(fContainer.value); // 3

const container = new Container(5);

console.log(container.value); // 5
```

※ 책에는 클래스를 쓰지 않고 `생성자 함수` 형태로 Container를 정의했다 ECMAScript 8 버전 기준의 js 를 사용하지만 class를 사용하지 않고 function 키워드를 사용하는데, 기본적으로 js 자체가 프로토타입 기반의 언어라서 그럴수도 있고 함수형을 더 강조하기 위한 것으로 보이기도 한다. 다만 ts에서는 명시적인 타입 정보가 없는 경우 생성자 함수는 this에 대한 타입을 추론할 수 없고, 객체에 형태로 추론하기 어렵기 때문에 권장되지 않는다. 위의 `FContainer` 도 강제로 `new` 키워드를 사용하기 위해 타입 단언을 사용했다. 그러므로 타입 안정성을 위해 해당 챕터에서 생성자 함수로 표현되는 코드들을 class 형태로 바꿔서 표현한다.

#### of 메서드

`new` 키워드를 사용하지 않고 새 Container 객체를 생성하는 함수

```ts
class Container<T> {
  // ...생략

  public static of<U>(value: U): Container<U> {
    return new Container(value);
  }
}

const container = Container.of(5);
```

일반적으로 좀 더 의도를 정확하게 전달하고, 객체의 타입을 명확하게 결정하기 위해 `팩토리 메서드 패턴` 의 한 형태로 사용된다.

js의 Array도 `of` 메서드를 제공한다.

```ts
const arr1 = new Array(3); // [undefined, undefined, undefined]

const arr2 = Array.of(3); // [3];
```

### map 구현

함수자는 map 메서드를 구현해야 한다.

```ts
class Container<T> {
  // (...생략)

  public map<U>(fn: (x: T) => U): Container<U> {
    return Container.of(fn(this.#value));
  }
}

console.log(Container.of(5).map((value) => value + 1).value); // 6
```

map은 Container에 전달된 함수의 결과를 다시 (Container 로) 반환하며, 이는 결합 연산을 가능하게 한다.

```ts
console.log(
  Container.of(5)
    .map((value) => value + 1)
    .map((v) => v * 2)
    .map((v) => ({
      result: v,
    })).value
);
```

함수자를 다시 정의 하면

> 함수자는 map 컨트랙트를 구현하는 객체이다.

- 컨트랙트는 프로그래밍에서 일련의 규칙, 규약 또는 인터페이스를 의미한다.
- map의 컨트랙트는 다음과 같은 규칙을 가진다
  - 원본 데이터를 변경하지 않고 새로운 데이터를 반환한다
  - 매개변수로 전달된 함수를 각 요소에 적용하여 변형된 요소로 이루어진 새로운 데이터를 생성한다.
  - 새로운 데이터 구조를 반환하며, 원본 데이터 구조화 동일하거나 유사한 타입을 가진다.

## MayBe 함수자

MayBe 함수자를 사용하면 좀 더 **함수적인** 방법으로 코드의 에러를 핸들링할 수 있다.

```ts
export type Nothing = void | null | undefined;
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
```

### Reddit에서 SubReddit 데이터를 조회하는 예제

- API 정의

```ts
export class RedditAPI {
  #BASE_URL = "https://www.reddit.com/r/subreddit";

  constructor(private readonly axios: AxiosInstance) {}

  /**
   * 의도적으로 axios.get에 응답 타입을 지정하지 않았습니다.
   * catch 에서 에러를 잡아서 반환하는 타입이 달라지기 때문에
   * 호출하는 쪽에서 MayBe를 사용해서 error 상황을 처리하도록 했습니다.
   */
  public async getPosts(type: string) {
    return this.axios
      .get(`${this.#BASE_URL}/${type}.json?limit=10`)
      .then((res) => res.data)
      .catch((err) => ({
        message: "Something went wrong",
        code: err.response?.status,
      }));
  }
}

export const API = {
  reddit: new RedditAPI(axios),
};
```

```ts
const getTopPosts = async (subreddit: string) =>
  MayBe.of(await API.reddit.getPosts(subreddit))
    .map((posts) => posts.data)
    .map((data) => data && data.children)
    .map(
      (children) =>
        children &&
        children.map((child) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          url: child.data.url,
        }))
    ).value;

// 성공 케이스
console.log(await getTopPosts("new"));

// 실패 케이스
console.log(await getTopPosts("wrong-subreddit")); // null
```

`getTopPosts` 는 논리 흐름에서 null | undefined 에러의 원인이 될 수 있는 원치 않는 입력을 다룰 수 있다

`map` 체이닝에서 값이 비어있는 경우 항상 `MayBe.of(null)` 을 반환하기 때문에 에러를 던지지 않는다.

※ js 구현에서는 타입이 존재하지 않기 때문에 `MayBe` 를 사용한 논리 흐름에서 null 체크를 매번 할 필요는 없다. 하지만 ts에서는 항상 반환타입이 원하는 출력 타입(`Just`)과 `Nothing`의 Union 타입이 되기 때문에 모든 map 체이닝에서 null | undefined에 대한 처리를 해야한다. 코드에 안정성을 제공하지만 귀찮게 느껴질 수도 있어보인다.

## Either

`MayBe` 는 어떤 분기에서 값이 Nothing 이 되는지 알수 없다. 즉 map의 체이닝에서 어떤 map에서 값이 사라지는지 찾을 수 없다. 이를 해결하기 위해 Either가 필요하다.

Either는 에러 케이스를 Left로 정의하고 성공 케이스를 Right로 정의해서 Left나 Right 둘 중 한가지 값을 반환하도록 사용한다.

※ 여기서부터 책의 구현과 많이 다르다. 이유는 이후 설명

```ts
export class Left<T> {
  readonly _tag = "Left" as const;
  readonly #error: T;

  private constructor(error: T) {
    this.#error = error;
  }

  isLeft(): this is Left<T> {
    return true;
  }

  isRight(): this is Right<never> {
    return false;
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
    return false;
  }

  isRight(): this is Right<T> {
    return true;
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

// Left와 Right의 union 타입
export type Either<T, U> = Left<T> | Right<U>;
```

### Reddit 예제

```ts
export class RedditAPI {
  #BASE_URL = "https://www.reddit.com/r/subreddit";

  constructor(private readonly axios: AxiosInstance) {}

  public async getPostsEither(
    type: string
  ): Promise<Either<RedditError, RedditPost>> {
    return this.axios
      .get<RedditPost>(`${this.#BASE_URL}/${type}.json?limit=10`)
      .then((res) => Right.of<RedditPost>(res.data)) // resolve 케이스는 Right로 반환
      .catch((err) =>
        Left.of<RedditError>({
          // reject 케이스는 Left로 반환
          message: "Something went wrong",
          code: err.response?.status,
        })
      );
  }
}

const getTopPostsEither = async (subreddit: string) => {
  const posts = await API.reddit.getPostsEither(subreddit);

  /**
   * Either의 경우에는 isLeft, isRight를 사용해서
   * 에러인지 아닌지를 판단할 수 있습니다.
   * 여기서는 isLeft를 사용해서 에러인 경우에는 그대로 반환하도록 했습니다.
   */
  if (posts.isLeft()) return posts.value;

  return posts
    .map((posts) => posts.data)
    .map((data) => data && data.children)
    .map(
      (children) =>
        children &&
        children.map((child) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          url: child.data.url,
        }))
    ).value;
};

// 성공 케이스
console.log(await getTopPostsEither("new"));

/**
 * 실패 케이스 : Maybe와 다르게 에러가 null이 아니라 실제 예외가 반환됨
 * {
    message: "Something went wrong",
    code: 404
  }
 */
console.log(await getTopPostsEither("wrong-subreddit"));
```

### 책의 either 구현과 다른 이유

- 책은 js를 기반으로 하기 때문에 타입이 존재하지 않아서 map의 타입에 대해 신경쓰지 않아도 된다. 하지만 ts로 구현할 경우 map의 callback 함수의 파라미터는 항상 left 의 제네릭 타입 과 right의 제네릭 타입의 유니온 타입이 되어버려 미리 타입을 좁혀주지 않으면 모든 map 체이닝에서 타입가드 처리가 필요하다. (reddit 예시 코드도 미리 isLeft()를 통해 타입을 좁혀줌)

### 책의 either 구현 (동일하진 않고 ts에 맞게 구현하되, 모두 any 타입으로 타입을 우회함)

- 모든 타입을 any로 취급해서 타입 가드 없이 map을 체이닝 할 수 있고 의도한대로 결과를 가져올 수 있지만, 타입이 불명확함.
- 만약 미리 타입을 좁히는 방식을 사용하지 않고 map 체이닝만 하고싶으면 에러와 정상적인 상황에 `태그된 유니온` 타입 을 통해서 타입 가드를 편하게 사용하도록 타입 설계가 필요할 것 같음

```ts
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
```

```ts
export class RedditAPI {
  #BASE_URL = "https://www.reddit.com/r/subreddit";

  constructor(private readonly axios: AxiosInstance) {}

  public async getPostsAnyEither(type: string): Promise<AnyEither> {
    return this.axios
      .get(`${this.#BASE_URL}/${type}.json?limit=10`)
      .then((res) => Some.of(res.data)) // resolve 케이스는 Some으로 반환
      .catch((err) =>
        Nothing.of({
          // reject 케이스는 Nothing으로 반환
          message: "Something went wrong",
          code: err.response?.status,
        })
      );
  }
}

const getTopPostsAnyEither = async (subreddit: string) =>
  (await API.reddit.getPostsAnyEither(subreddit))
    .map((posts: any) => posts.data)
    .map((data: any) => data && data.children)
    .map(
      (children: any) =>
        children &&
        children.map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          url: child.data.url,
        }))
    ).value;

// 성공 케이스
console.log(await getTopPostsAnyEither("new"));

/**
 * 실패 케이스
 * {
    message: "Something went wrong",
    code: 404
  }
 */
console.log(await getTopPostsEither("wrong-subreddit"));
```

## 포인팅된 함수자 (Pointed Functor)

> Pointed Functor 는 특정 값을 Functor 내에 넣는 연산을 수행할 수 있도록 해주는 함수(예시에서 `of`) 를 제공합니다, `of`를 호출하더라도 functor의 구조는 유지됩니다. 즉, `map` 함수를 사용하여 functor 내부의 값을 변환할 수 있습니다. 위에서 구현된 MayBe와 Either도 pointed Functor의 한 예시입니다.

## 참고

오픈소스 fp-ts 라이브러리의 [either](https://grossbart.github.io/fp-ts/modules/Either.ts.html#:~:text=A%20common%20use%20of%20Eitheris%20as%20an%20alternative,a%20received%20input%20is%20a%20stringor%20a%20number.)

- fp-ts의 either는 functor로 구현되지 않았음. (`index.ts` 참고)

```ts
const parse =
  (errorMessage: string) =>
  (input: string): Either<string, number> => {
    const n = parseInt(input, 10);
    return isNaN(n) ? left(errorMessage) : right(n);
  };

const res = pipe(
  "4",
  parse("error"),
  map((n) => n * 2),
  map((n) => n + 1)
);

console.log(isRight(res) ? res.right : res.left);
```
