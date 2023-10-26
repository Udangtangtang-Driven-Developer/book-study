# 5장. `any` 다루기

## 아이템 38. `any` 타입은 가능한 한 좁은 범위에서만 사용하기

### 코드 예시 - 매개변수 타입 에러가 발생하는 경우

```ts
type Foo = { b: number };
type Bar = { a: string };

const expressionReturningFoo = (): Foo => {
  return { b: 3 };
};

const processBar = (b: Bar) => {};

const f = () => {
  const x = expressionReturningFoo();
  processBar(x); // Foo 형식의 인수는 Bar 형식의 매개변수에 할당할 수 없다
};
```

### `any` 적용해서 오류 개선

- 매개 변수에만 `any` 타입을 사용하면 `any`타입이 적용되는 범위가 좁아진다. 매개 변수 시점에만 `any` 타입을 가지고 그 이후로는 본래의 `x` 타입을 가지기 때문에 다른 코드에 영향을 미치지 않아서 더 좋은 방법이다.

```ts
// bad way
const f1 = () => {
  const x: any = expressionReturningFoo();
  processBar(x);

  x; // 타입이 any
};

// good way
const f2 = () => {
  const x = expressionReturningFoo();
  processBar(x as any);

  x; // 타입이 Foo
};
```

### `x`가 `any` 타입을 가질 때 문제가 되는 경우

```ts
const f1 = () => {
  const x: any = expressionReturningFoo();
  processBar(x);
  return x;
};

const g = () => {
  const foo = f1(); // 타입이 any
  foo.fooMethod(); // 함수 호출이 체크되지 않는다.
};
```

### 타입 체크 무시하고 싶을 땐 @ts-ignore

- 다음 줄의 오류는 무시된다. 그러나 원인을 해결한 게 아니라 다른 곳에서 더 큰 문제가 발생할 수 있어서 `@ts-ignore`를 사용하기 보다 오류를 해결하고 가는 게 좋다.

```ts
const f3 = () => {
  const x = expressionReturningFoo();

  // @ts-ignore
  processBar(x);
  return x; // 타입이 Foo
};
```

### 넓은 범위에서 `any` 타입 사용될 때 문제점

- 함수에서 `any`를 반환하는 경우, 그 영향력이 함수 바깥을 넘어 프로젝트 전반으로 퍼진다.
- **이런 케이스가 존재하기 때문에 함수 반환 타입은 추론여부와 상관없이 명시하는 게 좋다.** 그래야 함수 바깥으로 영향 미치는 걸 방지할 수 있다.(!!!!)

### 객체와 관련된 `any`타입의 사용법

- 어떤 큰 객체 안의 한 개 속성이 타입 오류를 가지는 상황에서 최소한의 범위에만 `any` 사용하기

```ts
type Config = {
  a: number;
  b: number;
  c: { key: number[] };
};

const value = 333;

// bad way - 타입 전체가 any 타입을 가짐
const config1: Config = {
  a: 1,
  b: 2,
  c: { key: value },
} as any;

// good way
const config2: Config = {
  a: 1,
  b: 2,
  c: { key: value as any },
};
```

### 요약

- 의도치 않은 타입 안정성 손실을 피하기 위해서 `any` 사용범위를 최소한으로 좁히기
- 함수 반환 타입으로 `any` 타입을 반환하면 절대 안된다.
- 강제로 타입 오류 제거하려면 `any` 대신 `@ts-ignore` 사용하는 게 좋다.

## 아이템 39. `any`를 구체적으로 변형해서 사용하기

### `any`에 대하여

- 자바스크립트에서 표현할 수 있는 **모든 값을 아우르는 매우 큰 범위**이다.
- 대체로 `any`보다 더 구체적으로 표현할 수 있는 타입이 존재하므로 구체적인 타입 작성하는 게 좋다.
- `any` 사용하더라도 더 구체적으로 표현하기 위해서 **타입 형태** 드러내기 : `any` 대신 `any[]`

### `any` 타입에 가능한 값 목록

- 모든 숫자
- 문자열
- 배열
- 객체
- 정규식
- 함수
- 클래스
- DOM 엘리먼트
- `null`
- `undefined`

### `any` 사용해야한다면 더 나은방법으로 사용하자

```ts
// bad way
const getLengthBad = (array: any) => {
  return array.length;
};

// good way
const getLength = (array: any[]) => {
  return array.;
};

getLengthBad(/123/); // 에러 발생 안함, undefined 리턴함
getLength(/123/); // RegExp 할당 불가 에러 발생
```

### any[] 사용하는 함수가 더 좋은 함수인 이유

1. 함수 내의 `array.length` 타입이 체크된다.
2. 함수의 반환 타입이 `any` 대신 `number`로 추론된다.
3. 함수 호출될 때 매개변수가 배열인지 체크된다.

### 타입 형태를 유지한 `any` 예시

- 배열의 배열 형태라면 `any[][]`
- 객체이지만 값을 알 수 없다면 `{[key:string] : any}`

#### `{ [key: string]: any }` 사용 예시

```ts
const hasTwelveLetterKey = (o: { [key: string]: any }) => {
  for (const key in o) {
    if (key.length === 12) {
      return true;
    }
  }
  return false;
};
```

#### `object`타입 사용 예시

- 모든 비기본형(none-primitive)타입을 포함하는 `object` 타입을 사용할 수 있다.
- 객체의 키 열거할 수 있지만 속성에는 접근할 수 없다.
- 객체지만 속성에 접근할 수 있어야 한다면 `unknown` 타입 사용하기 (아이템 42에서 다룰 예정)

```ts
const hasTwelveLetterKey = (o: object) => {
  for (const key in o) {
    if (key.length === 12) {
      console.log(key, o[key]);
    }
  }
  return false;
};
```

### 함수 타입으로 `any` 사용하기

#### 매개변수 없이 호출 가능한 모든 함수

```ts
type Fn0 = () => any;
```

#### 매개변수 1개 함수

```ts
type Fn1 = (arg: any) => any;
```

#### 모든 개수의 매개변수

```ts
type Fn2 = (...arg: any[]) => any;
```

### 요약

- `any` 사용할 때는 정말로 모든 값이 허용되어야만 하는지 면밀히 검토하기
- `any`보다 더 정확하게 모델링할 수 있도록 `any[]` 또는 `() => any` 또는 `{[id:string]:any}` 처럼 구체적인 형태 사용하기
