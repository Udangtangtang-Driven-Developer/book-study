# 4. 클로저

## 클로저의 이해

_간단하게 이야기하면 클로저는 **내부 함수**다_

```ts
function outer() {
  // 이 inner 함수를 클로저 함수
  function inner() {}
}
```

클로저는 스코프 체인 (=== 스코프 레벨)에 접근할 수 있어 유용하다.

> 스코프 체인 : 일종의 리스트로 전역 객체와 중첩된 함수의 스코프의 레퍼런스를 차례로 저장하고, 의미 그대로 각각의 스코프가 어떻게 연결 (Chaining) 되고 있는지 보여주는 것

#### 클로저의 스코프

1. 자체 선언 내에서 선언된 변수

```ts
function outer() {
  function inner() {
    const a = 5;
    console.log(a);
  }
  inner();
}
```

2. 전역 변수에 접근

```ts
const global = "global";

function outer() {
  function inner() {
    console.log(global);
  }
  inner();
}
```

3. 외부함수의 변수에 접근

```ts
function outer(a: number) {
  const b = 5;
  function inner() {
    // 외부 함수의 변수와 parameter도 접근
    console.log(a + b);
  }

  inner();
}
```

### 스코프의 동작 자세히 살펴보기

```ts
const fn = (arg: number) => {
  const outer = "visible";

  const innerFn = () => {
    console.log(outer);
    console.log(arg);
  };

  return innerFn;
};

const closureFn = fn(5);

closureFn(); // visible, 5
```

1. `const closureFn = fn(5)` 가 호출되면 fn 은 인자 5를 받고 호출된다. fn의 정의가 이뤄지면 innerFn을 반환한다.
2. innerFn이 반환되면 javascript 실행 엔진은 innerFn을 클로저로 평가하고, 그에 따라 클로저의 스코프를 지정한다.

- `const outer` 와 파라미터 `arg` 값은 innerFn의 스코프 단계에서 지정된다.
- 반환된 함수 참조는 `closureFn` 내에 저장된다 따라서 `closureFn` 이 스코프 사슬을 통해 호출되면 arg, outer 값을 가질 것이다.

3. 마지막으로 `closureFn()` 이 호출되면 다음과 같이 출력된다

```
visible
5
```

- 예측한것 처럼 2번 단계에서 closureFn이 생성되면 컨텍스트(스코프; outer, arg)를 기억한다.

### 3장의 sortBy 함수 다시 살펴보기

```ts
const sortBy = <T>(property: keyof T) => {
  return (a: T, b: T) =>
    a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
};
```

`sortBy("firstname")` 처럼 sortBy 함수를 호출하면 아래와 같은 두 인자를 취하는 새 함수를 반환한다.

```ts
(a: T, b: T) =>
  a[firstname] < b[firstname] ? -1 : a[firstname] > b[firstname] ? 1 : 0;
```

- 반환되는 함수는 sortBy의 함수 인자인 `property` 에 접근할 수 있다
- sortBy가 호출될 때만 이 함수가 반환되므로 `property` 는 값( === firstname) 과 연결된다.

## 실제 세계에서 고차함수

### tap

```ts
const tap =
  <T>(value: T) =>
  (fn: (arg: T) => any) => (
    typeof fn === "function" && fn(value), console.log(value)
  );

tap("Hi there")((it) => console.log(`value: ${it}`));

// result:
// value: Hi there
// Hi there
```

- tap은 value와 콜백 함수(fn)를 차례로 받아서 value를 갖는 클로저를 반환하며 실행한다.

실무에서 어떨때 사용할까?

- 서버에서 가져온 데이터 배열을 반복한다고 할 때, 코드의 어느 부분에서 값이 어떻게 변경되는지 추적할 수 할 때 유용

```ts
[1, 2, 3].forEach((a) => tap(a)(() => console.log(a)));
```

**※ 잠깐, 책의 코드가 뭔가 이상함**

- 저자가 의도한건지 모르겠으나 위의 tap을 쓰면 중복 로깅을 함
- **일반적으로 tap은 side effect를 실행하거나 직접 로깅하는 함수를 전달해서 사용함**

```ts
//rxjs의 tap 예시
import { of } from "rxjs";
import { tap } from "rxjs/operators";

const source = of(1, 2, 3, 4, 5);

source.pipe(tap((value) => console.log(`Value: ${value}`))).subscribe(); // 중복 로깅을 하지 않음
```

아래와 같이 뒤의 console.log 가 아니라 인자로 전달받은 callback을 실행하고 값을 그대로 방출하는게 일반적임

```ts
const tap =
  <T>(value: T) =>
  (fn: (arg: T) => any) => (typeof fn === "function" && fn(value), value);

// 예제 데이터
const data = [1, 2, 3, 4, 5];

// 데이터를 반복하면서 tap 함수를 사용하여 로깅
data.forEach((value) => {
  tap(value)((loggedValue) => {
    console.log(`Received value: ${loggedValue}`);
  });
});
```

### unary

js 내장함수인 `parseInt` 와 `Array.prototype.map` 으로 숫자문자를 number 타입으로 바꾸는 예시

```ts
//Bad case
["1", "2", "3"].map(parseInt); // [1, NaN, NaN]
```

- map은 (element, index, arr) 을 파라미터로 받은 callback을 호출하고, parseInt는 (pares, radixes) 인자로 호출되는 함수이다. 위의 코드에서 map의 index가 radixes 로 전달되어 원하지 않는 결과가 도출된다.

- 하나의 인자만 필요하므로 다른 함수를 사용해서 parseInt를 변환할 필요가 있다. 이 때 `unary` 를 사용할 수 있다.

```ts
const unary =
  <T>(fn: (...args: any[]) => T) =>
  (arg: any) =>
    fn(arg);
```

- 여러 인자를 가질 수 있는 함수를 전달 받아서 하나의 인자로 실행되는 함수를 반환한다.

```ts
const parsed = ["1", "2", "3"].map(unary(parseInt));

console.log(parsed); // [1, 2, 3]
```

### once

- 주어진 함수를 무조건 단 한 번만 실행해야 하는 경우가 종종 있다.
  - 서드파티 라이브러리를 한 번만 구성해 결제 구성을 한 번만 초기화하며, 은행 결제 요청을 무조건 단 한번만 처리하는 등의 작업에서 발생한다.

```ts
const once = (fn: (...args: any[]) => any) => {
  let done = false;
  return (...args: any[]) => {
    return done ? undefined : ((done = true), fn.apply(this, args));
  };
};
```

- once로 감싸고 있는 함수는 클로저 스코프에 의해 `done` 이 true인지 확인하고 true일 때는 함수를 실행하지 않게 된다.

### memoized

- 순수 함수는 인자에 대해서만 처리하고 사이드 이펙트가 없기 때문에 인자에 따른 반환값이 고정적이다. 그러므로 이를 `기억`해서 재사용할 수 있다.

```ts
const memoized = (fn: (arg: any) => any) => {
  const cache: Record<string | number, any> = {};
  return (arg: any) => cache[arg] || (cache[arg] = fn(arg));
};
```

```ts
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

const memoizedFactorial = memoized(factorial);
```

- `memoized` 는 클로저 스코프에서 cache 변수에 값이 있으면 해당 값을 반환하고 없는 경우 콜백함수를 실행하고 캐시에 반환값을 저장한다.

### assign

- JS 객체는 유동적이기 때문에 객체가 생성된 후 변경할 수 있다. 새로운 객체를 구성하고자 여러 객체를 합치는 경우가 발생할 수 있다.

```ts
function objectAssign(...args: object[]) {
  const result = {} as any;
  for (let i = 0; i < arguments.length; i++) {
    const source = arguments[i];
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        result[key] = source[key];
      }
    }
  }
  return result;
}

const obj1 = { a: 1, b: 2 };
const obj2 = { b: 4, c: 5 };
const obj3 = { c: 6, d: 7 };
console.log(objectAssign(obj1, obj2, obj3));
```

- 위의 arguments는 모든 JS 함수에 사용 가능한 특수 변수로 js 함수는 인자의 모든 수를 함수에 전달하는데, 이는 예를 들어 두 개의 인자로 선언된 함수는 두 개 이상의 인자를 전달할 수 있다는 것을 의미한다.

- ES6 기준이라면 `Object.assign` 이 내장함수로 존재하기 때문에 새로운 함수를 만들 필요가 없다

```ts
class User {
  private name!: string;
  private age!: number;

  constructor(args: Partial<User>) {
    // 생성자에서 인수를 받아서 this에 할당할 수 있다.
    // 이 때 첫번째 인수로 들어온 객체는 실제로 변경된다는 것에 주의
    Object.assign(this, args);
  }

  public getName() {
    return this.name;
  }

  public getAge() {
    return this.age;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setAge(age: number) {
    this.age = age;
  }
}
```
