# 9. 모나드

예제와 함께 MayBe Monad를 만들면서 모나드를 이해해보자

> 해당 챕터는 MayBe Monad를 구현한다는 것을 제외하고는 책과는 많이 다르다. 책에서는 Reddit api 를 활용하는 예제를 다루고 있는데 reddit api 응답의 자료구조가 monad를 이해하는데 불필요하게 복잡하기 때문에 자체적으로 간단한 예제를 만들었다.

## Maybe 다시 정의하기

- 기본적인 구조는 챕터 8의 구현과 같으나 값이 없는 상태인 `nothing`과 값이 존재하는 상태인 `just`를 명시적으로 생성하는 팩토리 메서드와 값을 가져올 때 nothing인 경우 defaultValue를 지정할 수 있는 `getOrElse` 메서드를 추가했다.

```ts
export class Maybe<T> {
  #value: T | null | undefined;

  private constructor(value: T | null | undefined) {
    this.#value = value;
  }

  public static just<T>(value: T) {
    if (!value) throw Error("Provided value must not be empty");

    return new Maybe(value);
  }

  public static nothing<T>() {
    return new Maybe<T>(null);
  }

  public static of<T>(value: T | null | undefined) {
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

  public value(): T | null | undefined {
    return this.#value;
  }

  public map<U>(fn: (wrapped: T) => U): Maybe<U> {
    return this.isNothing()
      ? Maybe.nothing<U>()
      : Maybe.of(fn(this.#value as T));
  }
}
```

## 유저의 profileImage 를 조회하는 예제

### 유저 model 타입

- 참고 : 실무 환경에서의 자료구조와 다르게 예시를 위한 자료 구조.

```ts
export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  address: string;
}

export interface Profile {
  id: number;
  userId: number;
  phone: string;
  profileImage: string | null;
  website: string | null;
}
```

### 유저의 정보들을 조회하는 mock api 선언

- 실무에서는 비동기호출을 하겠지만 쉬운 이해를 위해 모든 메서드를 동기식으로 호출한다고 가정

```ts
export class MockUserApi {
  #MOCK_USERS: User[] = [
    {
      id: 1,
      name: "John",
      age: 30,
      address: "Seoul",
      email: "john@example.net",
    },
    {
      id: 2,
      name: "Jane",
      age: 25,
      address: "Busan",
      email: "Jane@example.net",
    },
    {
      id: 3,
      name: "Smith",
      age: 28,
      address: "Gwangju",
      email: "Smith@example.net",
    },
  ];

  #MOCK_PROFILES: Profile[] = [
    {
      id: 1,
      userId: 1,
      phone: "01022223333",
      profileImage: "https://picsum.photos/200",
      website: "https://example.com",
    },
    {
      id: 2,
      userId: 2,
      phone: "01011112222",
      profileImage: "https://picsum.photos/201",
      website: "https://example.com",
    },
  ];

  /**
   * @description 모든 유저 목록을 반환한다.
   */
  public findAll(): Maybe<User[]> {
    return Maybe.of(this.#MOCK_USERS);
  }

  /**
   * @description 유저 이름으로 유저를 찾는다.
   */
  public findByName(name: string): Maybe<User> {
    const user = this.#MOCK_USERS.find((user) => user.name === name);

    return Maybe.of(user);
  }

  /**
   * @description 유저 아이디로 프로필을 찾는다.
   */
  public findProfileByUserId(userId: number): Maybe<Profile> {
    const profile = this.#MOCK_PROFILES.find(
      (profile) => profile.userId === userId
    );

    return Maybe.of(profile);
  }
}
```

### 정의한 api들로 유저의 profileImage를 가져오기

```ts
const profileImage = API.user
  .findAll() // Maybe<User[]>
  .map((users) => API.user.findByName(users[0].name)) // Maybe<Maybe<User>>
  .map((user) => user.map((u) => u.id)) // Maybe<Maybe<number>>
  .map((id) => API.user.findProfileByUserId(id.getOrElse(0))) // Maybe<Maybe<Profile>>
  .map((p) => p.map((p) => p.profileImage)); // Maybe<Maybe<string>>
```

주석은 각 함수의 체이닝에서 반환되는 타입이다.

api의 호출이 MayBe로 래핑되고 `map`이 또다시 MayBe로 래핑을 하다보니 Maybe의 중첩 래핑이 발생한다.

이를 해결하기 위해 `flatMap` 이 필요하다.

### MayBe에 flatMap 추가하기

```ts
export class Maybe<T> {
  // 생략

  public flatMap<U>(fn: (wrapped: T) => Maybe<U>): Maybe<U> {
    return this.isNothing() ? Maybe.nothing<U>() : fn(this.#value as T);
  }
}
```

- `flatMap`은 Maybe를 반환하는 함수를 인자로 받아서 해당 함수를 적용한 결과를 그대로 반환한다. `map` 과 달리 다시 Maybe로 래핑하지 않는다.

### flatMap으로 문제 해결하기

```ts
const profileImageWithMonad = API.user
  .findAll() // Maybe<User[]>
  .flatMap((users) => API.user.findByName(users[0].name)) // Maybe<User>
  .map((user) => user.id) // Maybe<number>
  .flatMap((id) => API.user.findProfileByUserId(id)) // Maybe<Profile>
  .map((p) => p.profileImage); // Maybe<string>

console.log(profileImageWithMonad.getOrElse("none"));
```

위의 주석처럼 중첩이 발생될 수 있는 부분에 flatMap을 적용하여 평탄화를 적용하여 Maybe의 중첩문제를 해결하였다.

## 그래서 모나드가 뭔데?

위의 예시에서 구현한 Maybe에 flatMap을 추가한 구조가 Maybe Monad를 구현한 것이다.

간단하게 말해서 **모나드는 flatMap 을 가지는 functor** 입니다.

### 모나드의 정의

모나드는 다음 두가지 연산을 가져야 합니다

- unit (or pure, maybe monad 예시에서는 `of`에 대응) : 일반 값을 모나드로 래핑합니다.
- bind (maybe monad 예시에서는 flatMap에 대응) : 모나드 값을 받아들이고 이 값을 다른 모나드 값으로 변환하는 함수를 적용하여 새로운 모나드 값을 반환합니다. (중첩된 모나드 구조를 단일 레벨의 모나드 구조로 만듭니다)

또한 모나드는 다음과 같은 법칙들을 만족해야 합니다.

- Left Identity (좌측 항등성) : `unit(a).bind(f) === f(a)`
  - 어떤 값을 모나드에 래핑하고(unit 또는 of 함수를 사용해서) 바로 이후에 함수 f를 flatMap으로 적용하면, 그냥 그 값에 f를 바로 적용한 결과와 동일해야 합니다.

```ts
const a = 5;
const f = (x: number) => Maybe.of(x * 2);
console.assert(Maybe.of(a).flatMap(f).value === f(a).value);
```

- Right Identity (우측 항등성): `m.flatMap(unit) === m`
  - 어떤 모나드 값 m에 대하여, 그 값을 flatMap으로 모나드에 다시 포장하는 연산을 적용하면 (unit 또는 of 함수를 사용해서) 원래의 모나드 값과 변화가 없어야 합니다.

```ts
const m = Maybe.of(5);
console.assert(m.flatMap(Maybe.of).value === m.value);
```

- Associativity (결합성): `m.flatMap(x => f(x).flatMap(g))`
  - 두 개의 함수 f와 g를 연속으로 flatMap으로 적용하는 것은, 처음에 f를 적용하고 그 결과에 g를 적용하는 것과 같아야 합니다.

```ts
const m = Maybe.of(5);
const f = (x: number) => Maybe.of(x + 5);
const g = (x: number) => Maybe.of(x * 2);
console.assert(
  m.flatMap(f).flatMap(g).value === m.flatMap((x) => f(x).flatMap(g)).value
);
```

> Monad는 functor이지만 모든 functor가 Monad는 아닙니다.

※ 모나드에 대해 구글링을 하면 굉장히 많은 자료들이 있고 복잡한 설명들도 많이 나오지만 여기서는 `입문` 단계이므로 여기까지만 이해하고 넘어가자

참조

- [3분 모나드](https://overcurried.com/3%EB%B6%84%20%EB%AA%A8%EB%82%98%EB%93%9C/)
- [Maybe 모나드](https://codewithstyle.info/advanced-functional-programming-in-typescript-maybe-monad/)
- [JS개발자는 아직도 모나드를 모르겠어요](https://overthecode.io/i-am-js-developer-and-still-dont-know-monad/)

## 추가: Maybe Monad에 Promise 더하기

### Reddit 예제로 Promise와 Monad를 같이 써보자

#### 비동기처리를 위한 mapAsync, flatMapAsync 추가

```ts
export class Maybe<T> {
  // 생략

  public mapAsync<U>(fn: (wrapped: T) => Promise<U>): Promise<Maybe<U>> {
    return this.isNothing()
      ? Promise.resolve(Maybe.nothing<U>())
      : fn(this.#value as T).then((v) => Maybe.of(v));
  }

  public flatMapAsync<U>(
    fn: (wrapped: T) => Promise<Maybe<U>>
  ): Promise<Maybe<U>> {
    return this.isNothing()
      ? Promise.resolve(Maybe.nothing<U>())
      : fn(this.#value as T);
  }
}
```

#### api 정의

```ts
export class RedditApi {
  #baseUrl = "https://www.reddit.com";

  public constructor(private readonly client: AxiosInstance) {}

  public async getPosts(query: string): Promise<Maybe<RedditPost>> {
    const url = `${this.#baseUrl}/search.json?q=${query}&limit=5`;

    return this.client
      .get<RedditPost>(url)
      .then((res) => Maybe.of(res.data))
      .catch(() => Maybe.nothing());
  }

  public async getComments(permalink: string): Promise<Maybe<RedditComment>> {
    const url = `${this.#baseUrl}${permalink}.json`;

    return this.client
      .get<RedditComment>(url)
      .then((res) => Maybe.of(res.data))
      .catch(() => Maybe.nothing());
  }
}
```

#### 사용 예제

```ts
/**
 * Maybe Monad flatMapAsync example
 * 비동기 처리와 함께 사용하면 체인마다 promise 가 반환되므로 체이닝의 복잡도가 높아진다.
 * 굳이 사용할 필요가 없다면 사용하지 않는 것이 좋다.
 */
const res = (await API.reddit.getPosts("functional programming"))
  .map((posts) => posts.data)
  .map((data) => data.children)
  .map((children) =>
    children.map((c) => ({
      id: c.data.id,
      title: c.data.title,
      permalink: c.data.permalink,
    }))
  )
  .mapAsync(async (posts) =>
    posts.map(async (p) => ({
      id: p.id,
      title: p.title,
      comments: await API.reddit.getComments(p.permalink),
    }))
  )
  /**
   * 여기서 posts의 타입은 
   * Maybe<Promise<{
        id: string;
        title: string;
        comments: Maybe<RedditComment>;
        }>[]> 가 된다. 
     Maybe 안에 Promise 안에 다시 Maybe...
        
   */
  .then((posts) =>
    posts.map((post) => {
      return post.map(async (p) => {
        const data = await p;

        // 또다른 처리들
      });
    })
  );
```
