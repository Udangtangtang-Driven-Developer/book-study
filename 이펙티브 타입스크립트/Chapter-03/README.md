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

## 아이템 22. 타입 좁히기

### 예시 코드

#### `if else` 사용해서 타입을 좁히는 경우

```ts
const el = document.getElementById("foo"); // 타입이 HTMLElement | null

if (el) {
  el; // 타입이 HTMLElement
  el.innerHTML = "Hello";
} else {
  el; // 타입이 null
  alert("No element");
}
```

#### 분기문에서 예외 처리하거나 함수 반환해서 타입을 좁히는 경우

```ts
const el = document.createElement("foo");
if (!el) throw new Error("No element");

el.innerHTML = "Hello";
```

#### `instanceof`를 사용해서 타입을 좁히는 경우

```ts
const contains = (text: string, search: string | RegExp) => {
  if (search instanceof RegExp) {
    search; // 타입이 RegExp
    return !!search.exec(text);
  }

  search; // 타입이 string
  return text.includes(search);
};
```

#### 속성 체크로 타입을 좁히는 경우

```ts
interface A {
  a: number;
}
interface B {
  b: number;
}

const pickAB = (ab: A | B) => {
  // 속성 존재하는지 체크하는 조건 추가
  if ("a" in ab) {
    ab; // 타입이  A
  } else {
    ab; // 타입이  B
  }

  ab; // 타입이 A | B
};
```

#### `Array.isArray` 내장함수로 타입을 좁히는 경우

```ts
const contains = (text: string, terms: string | string[]) => {
  const termsList = Array.isArray(terms) ? terms : [terms];
  termsList; // 타입이 string[]
};
```

#### 명시적 '태그'를 붙여서 타입을 좁히는 경우

- 태그된 유니온 (구별된 유니온) 타입이라고 불림

```ts
interface UploadEvent {
  type: "upload";
  fileName: string;
  contents: string;
}

interface DownloadEvent {
  type: "download";
  fileName: string;
}

type AppEvent = UploadEvent | DownloadEvent;

const handleEvent = (event: AppEvent) => {
  switch (event.type) {
    case "download":
      event; // 타입이 DownloadEvent
      break;
    case "upload":
      event; // 타입이 UploadEvent
      break;
  }
};
```

### 타입스크립트가 타입을 식별하지 못하는 경우 커스텀 함수 도입하기

- 식별을 돕기 위한 **사용자 정의 타입 가드** 사용하기

```ts
// 반환 타입(el is HTMLInputElement)은 함수의 반환 값이 true인 경우,
// 매개변수의 타입을 좁힐 수 있다고 알려주는 것
const isInputElement = (el: HTMLElement): el is HTMLInputElement => {
  return "value" in el;
};

const getElementContents = (el: HTMLElement) => {
  if (isInputElement(el)) {
    el; // 타입이 HTMLInputElement
    return el.value;
  }

  el; // 타입이 HTMLElement
  return el.textContent;
};
```

#### 타입 가드 사용해서 객체의 타입 좁히기

- 배열에서 요소 탐색할 때 `undefined`가 되는 경우 `isDefined` 타입가드 사용

```ts
const jackson5 = ["Jackie", "Tito", "Jermain", "Marion", "Michael"];
const members1 = ["Janet", "Michael"].map((name) =>
  jackson5.find((n) => n === name)
); // 타입이 (string | undefined)[]

// string[]로 좁히기 위해 타입 가드 사용하기
const isDefined = <T>(x: T | undefined): x is T => {
  return x !== undefined;
};
const members2 = ["Janet", "Michael"]
  .map((name) => jackson5.find((n) => n === name))
  .filter(isDefined); // 타입이 string[]
```

### 타입 좁힐 때 자주하는 실수

#### `null` 타입이 `"object"`인 걸 놓친 케이스

```ts
const el = document.getElementById("foo");

// bad case
if (typeof el === "object") {
  // null 타입이 "object"라서 타입 좁히기 실패!
  el; //  타입이 여전히 HTMLElement | null
}

// good case
if (el) {
  el; // 타입이 HTMLElement
}

if (el instanceof HTMLElement) {
  el; // 타입이 HTMLElement
}
```

#### 기본형이 잘못된 케이스

- falsy값 체크 조건을 추가했지만 빈 문자열, `0`, `null`, `undefined` 모두 falsy값이라 타입 좁히기 실패했다.

```ts
const foo = (x?: number | string | null) => {
  // bad case
  if (!x) {
    x; // 타입이 string | number | null | undefined
  }

  // good case
  if (x === null || x === undefined) {
    x; // 타입이 null | undefined
  } else if (typeof x === "number") {
    x; // 타입이 number
  } else {
    x; // 타입이 string
  }
};
```

### 요약

- 타입스크립트가 타입을 좁히는 과정 이해하기
- 타입 좁힐 때 태그된/구별된 유니온과 사용자 저의 타입 가드 사용하기

## 아이템 23. 한꺼번에 객체 생성하기

- 객체 생성할 때는 속성 하나씩 추가하기 보다 여러 속성을 포함해서 한꺼번에 생성해야 타입 추론에 유리하다.
- 변수의 값은 변경될 수 있지만, 타입스크립트의 타입은 변경되지 않는다는 룰을 따른다.

```ts
const pt = {
  x: 3,
  y: 4,
};
```

### 개별 속성 추가 관련 에러 발생 예시 코드

- 자바스크립트 코드를 타입스크립트 코드로 마이그레이션할 때 흔하게 발생하는 문제!
- 자바스크립트에서는 빈 객체를 선언하고 속성을 하나씩 추가하는게 가능하지만, 타입스크립트는 **할당 시점을 기준으로 타입이 추론**되기 때문에 타입 관련 에러가 발생한다.

```ts
// 존재하지 않는 속성 추가할 때 에러 발생 예시 1
const pt = {};
pt.x = 3;

// 인터페이스 정의하면 아래와 같이 오류 바뀜
// 정의된 Point 타입과 다른 타입이 할당되어서 에러 발생 예시 2
interface Point {
  x: number;
  y: number;
}

const pt: Point = {};
```

### 객체 속성을 나눠서 추가해야 하는 경우

#### `as const`(타입 단언) 사용해서 타입 체커 통과하기

- 그렇지만 이 방법보다 선언할 때 객체를 한꺼번에 만드는 게 더 좋은 방법이다.

```ts
interface Point {
  x: number;
  y: number;
}

const pt = {} as Point;
pt.x = 3;
```

#### 객체 조합해서 또 다른 객체 만드는 경우 **객체 전개 연산자** 사용하기

- 타입 걱정 없이 필드 단위로 객체를 생성할 수 있다.

```ts
const pt = { x: 3, y: 5 };
const id = { name: "mallang" };

// bad case : Object.assign 사용
const namedPoint1 = {};
Object.assign(namedPoint, pt, id);
namedPoint1.name; // namedPoint 타입이 {} 라서 에러 발생

// good case : 전개 연산자 사용
const namedPoint2 = { ...pt, ...id };
namedPoint2.name; // 타입이 string
```

- **모든 업데이트마다 새 변수를 사용하여 새로운 타입을 얻는게 매우 중요하다.**

```ts
const pt0 = {};
const pt1 = { ...pt0, x: 3 };
const pt2 = { ...pt1, y: 5 };
```

#### 타입 안전하게 조건부 속성 추가하는 방법

- 속성 추가하지 않는 `null`이나 `{}`으로 객체 전개 사용하기

```ts
declare let hasMiddle: boolean;
const firstLast = { first: "Harry", last: "Alice" };
const president = {
  ...firstLast,
  ...(hasMiddle ? { middle: "M", middleNameLength: 10 } : {}),
};
```

### 요약

- 속성 제각각 추가하지 말고 한꺼번에 객체로 만들기
- 객체 전개 연산자를 사용해서 안전한 타입으로 속성 추가하기
- 객체에 조건부로 속성 추가하는 방법 익히기

## 아이템 24. 일관성 있는 별칭 사용하기

### 객체 별칭을 만들어서 사용할 때 주의할 점

- 별칭 값 변경시 원래 속성값도 변경된다.(참조)

```ts
const borough = { name: "Brooklyn", location: [40.688, -73.979] };
// loc 별칭 생성
const loc = borough.location;
loc[0] = 1000;

console.log(borough.location); // [ 1000, -73.979 ]
```

- 별칭 남발시 제어 흐름 분석하기가 어렵다.

```ts
interface Coordinate {
  x: number;
  y: number;
}

interface BoundingBox {
  x: [number, number];
  y: [number, number];
}

interface Polygon {
  exterior: Coordinate[];
  holes: Coordinate[][];
  bbox?: BoundingBox;
}

const isPointInPolygon1 = (polygon: Polygon, pt: Coordinate) => {
  if (polygon.bbox) {
    if (
      pt.x < polygon.bbox.x[0] ||
      pt.x > polygon.bbox.x[1] ||
      pt.y < polygon.bbox.y[0] ||
      pt.y > polygon.bbox.y[1]
    ) {
      return false;
    }
  }
};
```

#### `polygon.bbox` 중복 개선하기 위해서 변수로 분리해보기

```ts
// 구조 분해 할당 사용해서 일관된 네이밍 사용하기
const isPointInPolygon2 = (polygon: Polygon, pt: Coordinate) => {
  const { bbox } = polygon; // 타입이 BoundingBox | undefined
  if (bbox) {
    if (
      pt.x < bbox.x[0] ||
      pt.x > bbox.x[1] ||
      pt.y < bbox.y[0] ||
      pt.y > bbox.y[1]
    ) {
      return false;
    }
  }
};
```

### 객체 구조 분해 할당시 주의할 점

- 옵셔널 속성을 구조분해할 때는 속성 체크가 필요하다. 타입 경계에 `null`값 추가하는 게 좋다 (아이템 31에서 다룰 내용)
- 지역 변수로 분리시 타입은 정확하게 유지되지만 할당 이후에 원본값이 변경될 경우 원본값이 구조분해 할당한 값과 다를 수 있다. (예시 : 할당 이후에 해당 속성이 삭제된 경우)

```ts
// fn이 구조 분해 할당 이후에 속성을 삭제하는 경우
const fn = (p: Polygon) => {};

const isPointInPolygon3 = (polygon: Polygon, pt: Coordinate) => {
  const { bbox } = polygon; // 타입이  BoundingBox | undefined
  if (bbox) {
    bbox; // 타입이 BoundingBox
    fn(polygon); //함수 호출
    bbox; // 타입이 BoundingBox
  }
};
```

### 요약

- 별칭은 타입스크립트가 타입을 좁히는 것을 방해하기 때문에 사용할 때는 비구조화 문법 사용해서 일관되게 사용하기
- 함수 호출이 객체 속성의 타입 정제를 무효화할 수 있다는 점에 주의하기

## 아이템 25. 비동기 코드에는 콜백대신 async 함수 사용하기

### promise 등장 전 콜백 지옥

```ts
fetchUrl(url1, function (response1) {
  fetchUrl(url2, function (response2) {
    fetchUrl(url3, function (response3) {
      console.log(1);
    });
    console.log(2);
  });
  console.log(3);
});
console.log(4);

// 4
// 3
// 2
// 1
```

- 코드 순서와 실행 순서가 같지 않다.
- 중첩되어서 코드 직관적이지 않아 이해하기 어렵다.
- 요청들이 병렬로 실행하거나 오류 상황을 빠져나오기 어렵다.

### promise 등장

- `promise`는 미래에 가능해질 어떤 것을 나타낸다!
- 코드 순서와 실행 순서가 동일하다.

```ts
const page1Promise = fetch(url1);
page1Promise
  .then((reponse1) => {
    return fetch(url2);
  })
  .then((reponse2) => {
    return fetch(url3);
  })
  .then((reponse3) => {})
  .catch((err) => {});
```

### async와 await의 등장

- `await` 키워드는 각각의 프로미스가 처리(resolve)될 때까지 `fetchPages` 함수의 실행을 멈춘다.
- `async` 함수 내에서 `await` 중인 프로미스가 거절(reject)되면 예외를 던진다. (`try/catch` 구문 사용)

```ts
const fetchPages = async () => {
  try {
    const response1 = await fetch(url1);
    const response2 = await fetch(url2);
    const response3 = await fetch(url3);
  } catch (err) {}
};
```

### 프로미스나 asyn/await를 사용해야 하는 이유

1. 콜백보다 프로미스가 코드를 작성하기 쉽다.
2. 콜백보다 프로미스가 타입을 추론하기 쉽다.

### promiseAll 코드 예시

```ts
// async await 버전
const fetchPages = async () => {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3),
  ]);
};

// 콜백 버전
const fetchPagesCallBack = () => {
  let numDone = 0;
  const responses: string[] = [];
  const done = () => {
    const [response1, response2, response3] = responses;
  };

  const urls = [url1, url2, url3];
  urls.forEach((url, i) => {
    fetchURL(url, (r) => {
      responses[i] = url;
      numDone++;

      // 모든 response가 모여지면 done 함수 실행
      if (numDone === urls.length) done();
    });
  });
};
```

#### `Promise.race`를 사용하여 프로미스에 타임아웃을 추가하는 코드 예시

- `Promise.race` : `Promise` 중에서 가장 먼저 완료된 것의 결과값으로 이행함.

```ts
const timeout = (millis: number): Promise<never> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject("timeout"), millis);
  });
};

const fetchWithTimeout = (url: string, millis: number) => {
  return Promise.race([fetch(url), timeout(millis)]);
};
```

- `fetchWithTimeout`은 반환 타입이 `Promise<Response>` 로 추론된다.

#### 반환 타입 `Promise<Response>`가 추론된 이유

- `Promise.race`의 반환 타입은 입력 타입들의 유니온이라서 `Promise<Response | never>`가 되는데, 공집합인 `never`와의 유니온은 아무런 효과가 없어서 간단하게 `Promise<Response>`로 추론됨

### 프로미스를 직접 생성하기보다 `async/await` 사용해야 하는 이유

1. 코드가 더 간결하다.
2. `async` 함수는 항상 프로미스를 반환하도록 강제된다.

```ts
// 프로미스 생성시
const getNumber = () => Promise.resolve(42);

// async 사용시
const getNumber = async () => 42;
// 함수 시그니처 타입이 const getNumber: () => Promise<number>
```

- `async/await`는 비동기함수로 통일하도록 강제하기 때문에 항상 동기 / 비동기가 혼용되지 않고 분리되어서 실행된다.

#### 동기, 비동기 로직이 섞이는 코드 예시 (`fetchURL` 함수에 캐시를 추가하는 로직)

```ts
const _cache: { [url: string]: string } = {};

const fetchWithCache = (url: string, callback: (text: string) => void) => {
  if (url in _cache) {
    // 콜백 함수 동기적으로 호출됨
    callback(_cache[url]);
  } else {
    fetchUrl(url, (text) => {
      _cache[url] = text;
      callback(text);
    });
  }
};

let requestStatus: "loading" | "success" | "error";
const getUser = (userId: string) => {
  fetchWithCache(`/user/${userId}`, (profile) => {
    requestStatus = "success";
  });

  requestStatus = "loading";
};
```

#### 코드의 문제점

- 캐시가 있는 경우 콜백 함수가 동기로 호출되기 떄문에 사용하기가 무척 어려워진다.
- `getUser` 호출한 후에 `requestStatus` 값은 캐시 여부에 따라 달라진다. 캐시 되어있다면, success로 변경된 후 바로 loading으로 돌아가버린다.

#### 개선된 로직

- 이 문제는 `async`를 사용해서 두 함수에게 일관적인 동작을 강제할 수 있다.
- `async` 사용하면 항상 비동기로 호출되는 코드를 작성하는 것과 같다.

```ts
const fetchWithCache = async (url: string) => {
  if (url in _cache) {
    return _cache[url];
  }

  const response = await fetch(url);
  const text = await response.text();
  _cache[url] = text;
  return text;
};

let requestStatus: "loading" | "success" | "error";
const getUser = async (userId: string) => {
  requestStatus = "loading";
  const profile = await fetchWithCache(`/user/${userId}`);
  requestStatus = "success";
};
```

- `async` 함수에 프로미스를 반환하면 또 다른 프로미스로 래핑되지 않기 떄문에 `Promise<Promise<T>>`가 아니라 `Promise<T>`를 반환된다.

```ts
const getJSON = async (url: string) => {
  const response = await fetch(url);
  const jsonPromise = response.json();
  return jsonPromise;
};

// 함수 타입이 const getJSON: (url: string) => Promise<any>
```

### 요약

- 코드 작성과 타입 추론 면에서 프로미스 사용하는 게 유리하다.
- 프로미스 생성하기 보다는 `async/await` 사용하기.
- 어떤 함수가 프로미스를 반환한다면 `async`로 선언하는 것이 좋다.

## 아이템 26. 타입 추론에 문맥이 어떻게 사용되는지 이해하기

- **타입스크립트는 타입을 추론할 때 값이 존재하는 문맥까지 살핀다**.

```ts

type Language = "JavaScript" | "TypeScript" | "Python";
const setLanguage = (language: Language) {}

setLanguage("JavaScript")

let language = "JavaScript"
setLanguage(language2) // language2 타입이 string이라서 에러 발생
```

#### 타입 에러 발생 이유

- 타입스크립트가 변수 할당 시점에 타입을 추론하고, `let`을 사용하고 있어서 변경될 값으로 추론하기 때문에 더 넓은 타입인 `string`으로 추론한다

#### 개선하는 방법

1. 타입 선언 추가해서 가능한 값 제한하기
2. `let`을 `const`로 변경해서 상수로 만들기

   - 타입 체커에게 변경할 수 없다고 알려주기

```ts
// 1번 예시
let language2: Language = "JavaScript";

// 2번 예시
const language2 = "JavaScript";
```

### 튜플 사용 시 주의점

- 문맥과 값을 분리해서 타입이 달라서 에러 발생한다.

```ts
const panTo = (where: [number, number]) => {};

panTo([10, 20]);

const loc = [10, 20]; // 길이를 알 수 없는 숫자 배열이라서 number[]
panTo(loc); // number[] 타입이라서 에러 발생
```

#### 개선해보자

1. 타입 선언 제공

```ts
const loc: [number, number] = [10, 20];
```

2. 상수 문맥 제공
   - `const`는 단지 값을 가리키는 참조가 변하지 않는 얉은 상수이다.
   - `as const`는 내부 값들이 모두 변하지 않는 깊은 상수이다. - 상수로 처리하기 떄문에 상수 사용시 `readonly` 타입이 추가된다.

#### as const 사용

```ts

- 매개변수에 readonly 구문 추가
const panTo = (where: readonly [number, number]) => {};

panTo([10, 20]);

const loc = [10, 20] as const; // 타입이 readonly [10, 20]
panTo(loc); // number[] 타입이라서 에러 발생

```

#### as const 단점

- 타입 정의에 실수가 있으면 정의가 아니라 호출되는 곳에서 에러가 발생한다.
- 여러 겹 중첩된 객체에서 오류 발생시 원인 파악하기 어렵다.

### 객체에서 상수 분리시 주의점

- `ts`변수처럼 문맥에서 값 분리하면 `language`속성의 타입이 `string`으로 추론된다.

```ts
type Language = "JavaScript" | "TypeScript" | "Python";

interface GovernedLanguage {
  language: Language;
  organization: string;
}

const complain = (language: GovernedLanguage) => {};

complain({ language: "TypeScript", organization: "Microsoft" });

const ts = {
  language: "TypeScript",
  organization: "Microsoft",
};

complain(ts);
```

### 콜백 사용 시 주의점

- 타입스크립트는 콜백을 다른 함수로 전달할 때, 콜백의 매개변수 타입을 추론하기 위해서 문맥을 사용한다.

```ts
const callWithRandomNumbers = (fn: (n1: number, n2: number) => void) => {
  fn(Math.random(), Math.random());
};

callWithRandomNumbers((a, b) => {
  a; // 타입이 number
  b; // 타입이 number

  console.log(a + b);
});

// 콜백을 상수로 분리시 문맥이 소실되고 noImplicitAny 오류가 발생하게 된다.

const fn = (a, b) => {
  console.log(a + b);
};

//  개선된 코드

// 타입 구문 추가
const fn2 = (a: number, b: number) => {
  console.log(a + b);
};

// 함수 시그니처 타입 선언
type Fn = (a: number, b: number) => void;

const fn3: Fn = (a, b) => {
  console.log(a + b);
};
```

### 요약

- 변수로 분리해서 선언했을 때 오류가 발생하면 타입 선언 추가하기
- 변수가 정말로 상수라면 상수 단언 (`as const`) 사용하기
- 상수 단언 사용하면 정의한 곳이 아니라 사용한 곳에서 오류 발생하므로 주의하기

## 아이템 27. 함수형 기법과 라이브러리로 타입 흐름 유지하기

- 라이브러리를 타입스크립트와 조합하여 사용하면, 타입 정보 유지되면서 타입 흐름이 전달된다.

```ts
const csvData = "";
const rawRows = csvData.split("\n");
const headers = rawRows[0].split(",");

// 함수형 기법으로 구현
const rows = rawRows
  .slice(1)
  .map((rowStr) =>
    rowStr
      .split(",")
      .reduce((row, val, i) => ((row[headers[i]] = val), row), {})
  );

// loadash zipObject 함수 사용
const rows2 = rawRows
  .slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(",")));
```

### 라이브러리 사용시 장점

- 타입 구문을 별도로 추가하지 않아도 된다.
- **함수 호출시 전달된 매개변수 값을 건드리지 않고 매번 새로운 값을 반환함으로써, 새로운 타입으로 안전하게 반환할 수 있다.**

### 서드파티 라이브러리 종속성 추가할 때 고려할 부분

- 서드파티 라이브러리 기반으로 코드 짧게 줄이는데 시간이 많이 든다면, 사용하지 않는게 낫다.

### 라이브러리 사용 코드 예시

#### 루프 사용해 단순 목록 만드는 로직

```ts
interface BasketballPlayer {
  name: string;
  team: string;
  salary: number;
}
declare const rosters: { [team: string]: BasketballPlayer[] };

// concat 타입 에러 개선하기 위해서 타입 구문 추가 필요
let allPlayers: BasketballPlayer[] = [];

for (const players of Object.values(rosters)) {
  allPlayers = allPlayers.concat(players); // 코드 동작하지만 concat 관련 타입 에러 발생
}
//   Argument of type 'BasketballPlayer[]' is not assignable to parameter of type 'ConcatArray<never>'.ts(2769)

// better way - flat메서드 이용
const allPlayers = Object.values(rosters).flat();
```

- `flat` 메서드는 다차원 배열 평탄화해준다.
- 내장 함수 사용하면 변수 변경되지 않도록 `let` 대신 `const`을 사용할 수 있다.

#### 팀 별로 연봉순으로 정렬해서 최고 연봉 선수의 명단 만드는 로직

```ts
const teamToPlayers: { [team: string]: BasketPlayer[] } = {};
for (const player of allPlayers) {
  const { team } = player;
  teamToPlayers[team] = teamToPlayers[team] || [];
  teamToPlayers[team].push(player);
}

for (const players of Object.values(teamToPlayers)) {
  players.sort((a, b) => b.salary - a.salary);
}

const bestPaid = Object.values(teamToPlayers).map((player) => players[0]);
bestPaid.sort((playerA, playerB) => playerB.salary - playerA.salary);
console.log(bestPaid);

// loadsh 사용
const bestPaid = _(allPlayers)
  .groupBy((player) => player.team)
  .mapValues((players) => _.maxBy(players, (p) => p.salary)!)
  .values()
  .sortBy((p) => -p.salary)
  .value(); // 타입이 BasketballPlayer[]
```

#### loadsh 사용 장점

- 가독성을 높인다.
- `null` 아님 단언문을 딱 한번 사용
  - 추가된 이유 : 타입 체커는 `_.maxBy`로 전달된 `players` 배열이 비어있지 않은지 알수 없다.
- 체인 사용해서 연산자의 등장 순서와 실행 순서가 동일하다.

### 요약

- 타입 흐름 개선하고, 가독성을 높이고, 명시적인 타입 구문의 필요성을 줄이기 위해 직접 구현하기보다는 **내장된 함수형 기법**과 loadash 같은 유틸리티 라이브러리 사용하는 것이 좋다 (!!)
