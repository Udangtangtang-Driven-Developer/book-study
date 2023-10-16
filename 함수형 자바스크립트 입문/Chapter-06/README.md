# 6. 커링과 부분 적용

## 용어 정리

### 단항 함수 (unary function)

- 함수 인자를 하나만 취하는 함수

```ts
// 단항 함수 예시 identity
const identity = <T>(x: T): T => x;
```

### 이항 함수 (binary function)

```ts
// 이항 함수 예시 add
const add = (x: number, y: number): number => x + y;
```

세개 이상의 인자를 취하는 `삼항 함수(ternary function)` 도 있음

### 가변 인자 함수(variadic function)

js에는 정해지지 않은 개수의 인자를 취할 수 있는 `가변 인자 함수(variadic function)` 도 있다

```ts
const variadic = (a: any, ...variadics: any[]) => {
  console.log(a); // 1
  console.log(variadics); // [2,3,4,5]
};

variadic(1, 2, 3, 4, 5);
```

- 이전의 js 버전에서는 `arguments` 를 사용해 가변 인자를 알 수 있었다.
  - ES6이상 부터는 spread 연산자 사용하면 됨

## 커링

간단하게 말해서 커링은 **n개 인자의 함수를 중첩된 단항 함수로 변화시키는 과정** 이다.

커링의 간단한 예시

```ts
// 일반적인 add 함수
const add = (x: number, y: number): number => x + y;

// 커링된 add 함수
const curriedAdd =
  (x: number) =>
  (y: number): number =>
    x + y;

const add4 = curriedAdd(4);

add4(5); // 9
```

binary function 만 커링하는 함수

```ts
const binaryCurry =
  <T, F, S>(fn: (x: F, y: S) => T) =>
  (x: F) =>
  (y: S) =>
    fn(x, y);

const curriedMax = binaryCurry(Math.max);

console.log(curriedMax(3)(4)); //4
```

위의 `binaryCurry` 는 이항 함수만 커링해준다 이제 가변 인자 함수를 커링할 수 있는 curry 함수를 만들어보자

1. 엄격한 타입을 가졌지만, 파라미터의 그룹화가 불가능한 구현

```ts
type VariadicFunction = (...args: any[]) => any;

type FirstParameter<F> = F extends (arg1: infer A, ...args: any[]) => any
  ? A
  : never;
type RemainingParameters<F> = F extends (arg1: any, ...args: infer A) => any
  ? A
  : never;

type VariadicCurry<F extends VariadicFunction> = {
  (...args: Parameters<F>): ReturnType<F>;
  (arg: FirstParameter<F>): VariadicCurry<
    (...args: RemainingParameters<F>) => ReturnType<F>
  >;
};

const curry = <F extends VariadicFunction>(fn: F): VariadicCurry<F> => {
  const arity = fn.length;

  const _curry = (...args: any[]): any =>
    args.length < arity ? curry(_curry.bind(null, ...args)) : fn(...args);

  return _curry as VariadicCurry<F>;
};

const sumStr = (a: string, b: string, c: string) => a + b + c;
const curriedSumStr = curry(sumStr);
console.log(curriedSumStr("choi")("seung")("june")); //choiseungjune
```

2. 타입이 엄격하지 않지만 파라미터의 그룹화가 가능한 구현

```ts
const curry = <F extends VariadicFunction>(fn: F) => {
  const arity = fn.length;

  return function _curry(...args: any[]) {
    if (args.length < arity) {
      return function (...innerArgs: any[]) {
        return _curry(...args, ...innerArgs);
      };
    }

    return fn(...args);
  };
};

const sum = (a: number, b: number, c: number) => a + b + c;
const curriedSum = curry(sum);

console.log(curriedSum(1, 2)(5)); // 8
console.log(curriedSum(1, 2, 3)); // 6
console.log(curriedSum(1)(3)(5)); // 9
console.log(curriedSum(2, 4, 6)); // 12
```

커링의 정의에 따르면 모든 인자가 단항으로만 동작하는게 더 정의에 맞는 구현 방식이지만 실용성에서는 인자를 그룹화하여 전달할 수 있는 커리가 유용할 때가 많기 때문에 요구사항과 취향에 따라 구현하여 선택하면 될 것 같다.

### curry를 사용한 logger 예시

```ts
class Logger {
  public info(message: string) {
    curry(this.log)("info")("INFO")(message);
  }

  public error(message: string) {
    curry(this.log)("error")("ERROR")(message);
  }

  public warn(message: string) {
    curry(this.log)("warn")("WARNING")(message);
  }

  private log(
    mode: "info" | "error" | "warn",
    prefix: string,
    message: string
  ) {
    console[mode](`${new Date().toISOString()} [${prefix}]`, message);
  }
}

const logger = new Logger();

// 2023-10-09T12:28:47.503Z [INFO] info message
logger.info("info message");
// 2023-10-09T12:28:47.504Z [ERROR] error message
logger.error("error message");
// 2023-10-09T12:28:47.504Z [WARNING] warn message
logger.warn("warn message");
```

### curry 를 사용한 배열 요소에서 숫자 검색 예시

```ts
type Predicate<T> = (item: T) => boolean;
const match = curry((what: RegExp, str: string) => str.match(what));

const hasNumber = match(/[0-9]+/) as Predicate<string>;

const findNumbersInArray = (list: string[]) => list.filter(hasNumber);

// [ "number1", "number2", "number3" ]
console.log(
  findNumbersInArray([
    "number1",
    "number2",
    "number3",
    "number one",
    "number two",
    "number three",
  ])
);
```

### curry 를 사용한 배열 제곱 예시

```ts
const curriedMap = curry(
  (fn: (value: any, index: number, array: any[]) => any, list: any[]) =>
    list.map(fn)
);

const squareAll = curriedMap((x: number) => x * x) as (
  list: number[]
) => number[];

// [ 1, 4, 9, 16, 25 ]
console.log(squareAll([1, 2, 3, 4, 5]));
```

## 부분 적용

- 부분 적용(`partial`) 은 함수의 인자를 부분적으로 적용할 수 있는 함수이다.

```ts
const partial = <R>(
  fn: (...args: any[]) => R,
  ...presetArgs: any[]
): ((...args: any[]) => R) => {
  return (...laterArgs: any[]) => {
    let boundArgs = [...presetArgs];
    for (
      let i = 0, argIdx = 0;
      i < boundArgs.length && argIdx < laterArgs.length;
      i++
    )
      // 미리 채워진 인자는 건너뛰고 presetArgs에 없는(undefined로 전달된) 인자만 채워넣는다.
      if (boundArgs[i] === undefined) boundArgs[i] = laterArgs[argIdx++];

    return fn.apply(null, boundArgs);
  };
};
```

### partial을 이용해 1초 후에 특정 작업을 수행하는 함수 예시

```ts
/**
 * setTimeout 의 첫번째 인자는 handler 함수이고, 두번째 인자는 delay 시간이다.
 * 부분 적용을 통해 delay 시간만 미리 채워놓고, handler 함수는 나중에 전달한다.
 */
const delay = partial(setTimeout, undefined, 1000);

delay(() => console.log("1초 후 실행"));
```

### partial을 이용해 json을 가독성 있게 출력하기

```ts
const prettyJson = partial(JSON.stringify, undefined, null, 2);
console.log(prettyJson({ name: "choi", age: 31 }));
```

### 커링과 부분 적용의 차이

- 인자의 순서: 커링은 함수의 인자를 순차적으로 받아들이는 반면, 부분적용은 인자의 순서에 상관없이 특정 인자를 미리 설정할 수 있습니다.

- 인자의 수: 커링은 주어진 함수의 모든 인자를 순차적으로 받아들이기 때문에 결과적으로 원래 함수와 동일한 수의 인자를 요구합니다. 반면, 부분 적용된 함수는 일부 인자가 미리 설정되었기 때문에 그보다 적은 수의 인자를 요구합니다.
