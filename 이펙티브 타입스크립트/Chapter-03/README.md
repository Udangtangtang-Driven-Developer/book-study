# 3장. 타입 추론

## 아이템 19. 추론 가능한 타입을 사용해 장황한 코드 방지하기

### 추론 가능한 타입

- 타입 추론이 된다면 명시적 타입 구문은 필요하지 않다.

```ts
const logProduct2 = (product: Product) => {
  const { id, name, price } = product;

  console.log(id, name, price);
};
```

- 타입 정보가 있는 라이브러리에서는 콜백 함수의 매개변수 타입이 자동으로 추론된다.

```ts
// bad case : 불필요한 타입 구문
app.get("/health", (request: express.Request, response: express.Response) => {
  response.send("OK");
});

// good case : 추론된 타입 구문
app.get("/health", (request, response) => {
  response.send("OK");
});
```

### 명시적 타입 구문이 필요한 경우

- 함수의 매개변수 타입 : 타입스크립트에서 변수의 타입은 일반적으로 처음 등장할 때 결정된다.
  - 함수/메서드 시그니처에 타입 구문을 포함하지만, 함수 내부에 생성된 지역 변수에는 타입 구문을 넣지 않아서 로직에 집중할 수 있게 해준다.
  - 매개 변수에 기본값 있는 경우는 타입 추론이 가능하므로 타입 구문 생략 가능하다

```ts
const parseNumber = (str: string, base = 10) => {};
```

### 타입이 추론되지만 타입을 명시하고 싶은 경우

- 객체 리터럴 타입을 정의하는 이유
  1. 잉여 속성 체크 : 오타같은 오류 잡아내는데 효과적이다.
  2. 변수가 사용되는 순간이 아닌 할당되는 시점에 오류 표시해준다.

```ts
const elmo: Product = {
  name: "mallang",
  id: "3333",
  price: 30,
};

// 타입 구문 제거시 잉여 속성 체크 동작하지 않고, 객체 선언된 곳이 아니라 사용되는 곳에서 오류 발생함
const dog = {
  name: "mallang",
  id: 3333,
  price: 30,
};

logProduct(dog); // id 프퍼티의 타입이 string이 아니라 number 타입이라서 정의된 곳이 아니라 사용된 곳에서 에러 발생
```

2. 함수의 반환 타입 작성하는 경우

- 타입 추론이 가능할지라도 구현상의 오류가 함수가 호출한 곳까지 영향을 미치지 않기 위해서 필요하다.
- 실무에서 반환 타입의 중요성을 경험한 케이스
  - 불리언 값 체크하는 함수의 반환 타입을 `boolean`이라고 생각했는데, 실제로는 정규표현식 문자열 배열을 리턴하고 있었다. 반환 타입을 작성했다면 바로 캐치할 수 있었는데 추론된 반환 타입을 사용하다 보니 리팩토링할 때까지 발견하지 못했다. 이 경험을 통해 반환 타입을 명시하는게 매우 중요하다는 걸 알게되었다.

#### 함수 반환 타입 예시 코드

```ts
const getQuoteWithCache = (ticker: string) => {
  if (ticker in cache) {
    return cache[ticker];
  }

  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json())
    .then((quote) => {
      cache[ticker] = quote;
      return quote;
    });
};

getQuoteWithCache("MSFT").then();
// 에러 발생  Property 'then' does not exist on type 'number | Promise<any>'.
```

- 반환 타입을 명시하도록 개선해야 하는 이유
  - `getQuoteWithCache` 함수는 항상 `Promise를` 반환하므로 `number타입이` 아니라 `Promise.resolve(cache[ticker])` 반환되도록 해야한다.
  - 반환 타입이 없으면 정의된 부분이 아니라 사용하는 부분에서 에러 발생한다.
  - 반환 타입 명시하면 정확한 위치에 오류가 발생한다..

```ts
// good case
// 반환타입 Promise<number> 추가

const getQuoteWithCache = (ticker: string): Promise<number> => {
  if (ticker in cache) {
    return Promise.resolve(cache[ticker]);
  }

  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json())
    .then((quote) => {
      cache[ticker] = quote;
      return quote;
    });
};
```

### 함수 반환 타입 명시해야 하는 이유 2가지

1. 함수 구현하기 전에 인풋과 아웃푹 타입이 알아야 하기 떄문에 테스트 주도 개발과 비슷하다. 전체 타입 시그니처를 먼저 작성하면, 시그니처를 계획하에 관리할 수 있다.
2. 명명된 타입 사용하므로 직관적이다

```ts
interface Vector2D {
  x: number;
  y: number;
}

// 반환 타입이 Vector2D가 아니라 {x: number;y: number;} 으로 추론됨
const add = (a: Vector2D, b: Vector2D) => {
  return { x: a.x + b.x, y: a.y + b.y };
};
```

### 요약

- 함수/메서드의 시그니처에는 타입 구문 작성하고 함수 내의 지역 변수에는 타입 구문 없도록 코드 작성하는게 이상적이다.
- 추론될 수 있는 경우라도 **객체 리터럴과 함수 반환에는 타입 명시**하면 내부 구현의 오류가 사용자 코드 위치에서 나타는 것을 방지해준다.

## 아이템 20. 다른 타입에는 다른 변수 사용하기

### 변수의 값은 바뀔 수 있지만 타입은 보통 바뀌지 않는다.

```ts
// bad case
let id: string | number = "1234";
id = 333;

// good case
const id2 = "1234";
const serial = 1234;
```

- 타입을 바꿀 수 있는 한 가지 방법은 **범위를 더 작게 좁히는 것**이다.
- 유니언 타입을 사용하면 매번 어떤 타입인지 확인해야 하므로, 차라리 별도의 변수를 도입하는 것이 낫다.

### 다른 타입에는 변수 분리하는 게 바람직한 이유

1. 서로 관련없는 값 분리
2. 변수명 더 구체적으로 작성 가능
3. 타입 추론 향상시키고, 그로 인해 타입 구문 불필요해진다.
4. 타입이 간결해진다 (서로 다른 타입으로 구성된 유니언 타입 대신 단일 타입 사용)
5. const 변수 선언 가능

### 요약

- 변수의 값은 바뀔 수 있지만 타입은 일반적으로 바뀌지 않는다.
- 혼란을 막기 위해 타입이 다른 값을 다룰 때에는 변수를 분리해서 사용하라.

## 아이템 21. 타입 넓히기

### 타입을 넓힌다는 건 무슨 의미일까

- 자바스크립트는 런타임에 모든 변수는 유일한 값을 가진다. **타입스크립트가 정적 분석하는 시점에 변수는 '가능한 값들의 집합'인 타입을 가진다.**
- 상수를 사용해서 변수를 초기화할 때, 명시하지 않으면 타입 체커가 타입을 결정하게 된다. 단일 값을 기준삼아서 할당 가능한 값들의 집합을 유추한다.

```ts
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

const getComponent = (vector: Vector3, axis: "x" | "y" | "z") => {
  return vector[axis];
};

let x = "x";
let vec = { x: 10, y: 20, z: 30 };
getComponent(vec, x); // 두 번째 매개변수 타입이 string이 들어와서 에러 발생
```

- x의 타입은 할당 시점에 넓히기가 동작해서 "x"가 아닌 `string`으로 추론되었다.
- `let`을 사용해서 재할당 가능한 변수로 정의되었기 떄문에 타입 넓히기가 동작했다.

### 할당 가능한 타입 리스트

```ts
const mixed = ["X", 1];

// 할당 가능한 타입 리스트
- ("x"|1)[]
- ["x", 1]
- [string,number]
- (string|number)[]
- readonly [string,number]
- readonly (string,number)[]
- [any, any]
- any[]
```

- 정보가 충분하지 않으면 타입스크립트는 사용자의 의도를 추측해서 추론한다.
- 타입스크립트는 명확성과 유연성 사이에서 균형을 유지한다. 변수 선언된 후로는 타입이 바뀌지 않아야 하므로 `string|RegExp`나 `(string|string)[]`이나 `any`보다 `string`을 사용하는 게 낫다.
- 충분히 구체적으로 타입을 추론해야 하지만, 잘못된 추론(false positive)을 할 정도로 구체적으로 수행하지는 않는다.

#### 자바스크립트에서 유효한 값 할당 예시

```ts
let x = "x";
x = "y";

let example = "x"; // string 타입
x = /x|y|z/; // RegExp 타입
x = ["x", "y", "z"]; // (string|string)[] 타입
```

### 타입 넓히기 제어하는 방법

#### let 대신 const 사용하기

```ts
let y = "y"; // 타입이 "y"
const x = "x"; // 타입이 "x"
```

- 재할당이 안되므로 더 좁은 타입올 추론할 수 있다.
- 객체와 배열에서는 여전히 튜플 타입을 추론해야 할지, 요소들 타입을 어떻게 추론해야 할지 알 수 없다.

#### 자바스크립트에서만 가능한 코드 예시

```ts
const v = {
  x: 1,
};

v.x = "3";
v.name = "wow";
```

#### 위의 코드의 v 타입을 추론해보자

- 가장 구체적인 타입 : `{readonly x: 1}`
- 조금 추상적인 타입 : `{x: number}`
- 가장 추상적인 타입 : `{[key:string]:number}` 아니면 `{}`

#### 타입스크립트의 넓히기 알고리즘은 객체의 경우 각 요소를 let에 할당된 것처럼 다룬다.

예시 : v의 타입 `{x:number}`

- 다른 숫자 재할당 가능하지만 다른 타입은 안된다.
- 다른 속성 추가하지 못한다. 따라서 객체는 한번에 만들어야 한다.

### 타입 추론 강도를 직접 재정의하는 방법

1. 명시적 구문 제공
2. 타입 체커에 추가적인 문맥 제공
   - 함수의 매개변수로 값을 전달
3. cosnt 단언문 사용 (`as const`)
   - 값 뒤에 `as const` 작성하면, 최대한 좁은 타입으로 추론한다.
   - 넓히기로 인해 오류가 발생한다고 생각되면, 명시적 타입 구문 또는 cosnt 단언문 추가하는 것 고려해보기.

```ts
const v1 = {
  x: 1,
  y: 2
}; // 타입은 {x: number; y: number;}


const v2 = {
  x: 1 as const,
  y: 2
}; // 타입은 {x: 1; y: number;}


const v3 = {
  x: 1
  y: 2
} as const; // 타입은 { readonly x: 1; readonly y: 2;}

const a1 = [1, 2, 3]; // 타입이 number[]
const a2 = [1, 2, 3] as const; // 타입이 readonly [1,2,3]
```

### 요약

- 타입스크립트가 넓히기를 통해 상수의 타입을 추론하는 방법을 이해하자.
- 동작에 영향을 줄 수 있는 방법인 `const`, `타입 구문`, `문맥`, `as const`에 익숙해지자.
