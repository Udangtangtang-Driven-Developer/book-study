# 3. 고차 함수

_인자로 다른 함수를 전달받는 함수를 고차 함수 (Higher Order Function) 라고 한다._

## 데이터의 이해

### 자바스크립트 데이터의 이해

자바스크립트는 다음과 같은 기본 데이터형을 지원한다.

- Number
- String
- Boolean
- Object
- null
- undefined

자바스크립트는 함수군의 데이터형이 존재한다.

- 함수 데이터는 변수를 전달하고 저장할 수 있다
- 함수 자체가 변수로 지정될 수 있다
- 함수를 인자를 전달하고 다른 함수에서 반환될 수 있다.

#### 함수 저장

> 함수는 데이터다. 변수 안에 저장할 수 있다.

```ts
let fn = () => {};
```

- 이 코드에서 `fn` 은 함수 데이터형을 가리키는 변수다.

```ts
let fn = () => {};

console.log(typeof fn); // 실행 결과 : function
```

- `fn` 은 단지 함수에 대한 참조이므로 다음과 같이 할 수 있다.

```ts
fn(); // fn이 참조하는 함수를 동작시킨다.
```

#### 함수 전달

```ts
const tellType = (arg: unknown) => {
  if (typeof arg === "function") arg();
  else console.log(`The passed data is ${arg}`);
};

tellType(() => console.log("Hi there")); // prints Hi there

tellType("Hello"); // prints The passed data is Hello
```

- 전달된 arg 변수가 `function` 타입인지 확인해서 `function` 타입이면 호출한다.
- arg가 `function` 타입이라면 실행될 함수에 대한 참조가 있다는 것을 의미한다.

#### 함수 반환

```ts
const tell = (message: string) => {
  return console.log(message);
};

const print = tell;

print("Hi, there!"); // prints Hi, there!
```

- tell 함수는 `console.log` 함수를 반환한다. 단순히 함수 참조를 반환하며, 실행하지는 않는다.

### 추상화와 고차 함수

> 일반적으로 고차 함수는 일반적인 문제를 추출하고자 작성한다. \
> 즉 고차함수는 **추상화** 를 정의하는 것이다.

#### 추상화 정의

위키피디아 의 추상화 정의

> 소프트웨어 공학과 컴퓨터 과학에서 추상화는 복잡한 컴퓨터 시스템을 다루기 위한 기술이다. 현재 단계보다 더 복잡한 내용을 제외하면서 인간과 시스템이 상호작용하는 계층을 구성한다. 프로그래머는 이상적인 인터페이스 (대개는 잘 정의된)를 사용하며, 그렇지 않으면 다루기에 너무 복잡한 추가적인 함수 계층을 넣을 수 있다.

> 예를 들어 숫자 연산이 포함된 코드 작성은 숫자가 기존 하드웨어 (16bit or 32bit) 에서 나타나는 방식과는 상관없을 수 있으며 자세한 부분이 생략된 위치를 프로그래머가 수행할 간단한 숫자를 남기는 abstracted away 라고 부른다.

- 도서에서는 어렵게 설명되어있어 조금 풀어쓰자면 하드웨어 내부에서 숫자라는 데이터를 어떻게 다루든 프로그래머는 (대부분의 경우에서) 신경쓰지 않고 각 언어에서 숫자를 다루는 방식에 맞춰 다룬다.

_추상화는 기존 시스템 개념을 문제없이 원하는 목표대로 수행할 수 있게 한다_

#### 고차 함수를 통한 추상화

```ts
const forEach = <T>(arr: T[], callback: (item: T, index: number) => void) => {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
};

const arr = [1, 2, 3];

forEach(arr, (item, index) => console.log(`${index}: ${item}`));
```

- 위의 `forEach` 함수는 배열을 순회하는 문제를 추상화했다.
- `forEach` 사용자는 `forEach` 함수에서 순회 부분이 어떻게 구현됐는지 이해할 필요가 없으므로 이 문제를 추상화했다.

`forEach` 는 기본적으로 배열을 순회한다. 자바스크립트에서 객체를 순회한다는 것은 무엇일까?

1. 주어진 객체의 모든 키를 반복한다.
2. 키에 해당하는 각 객체를 확인한다.
3. 2단계가 확인되면 키의 값을 얻는다.

Object 의 모든 키를 순회하며 인자로 전달된 함수를 실행하는 추상화 함수를 만들어보자

```ts
const forEachObject = <T extends Object>(
  obj: T,
  callback: (key: keyof T, val: T[keyof T]) => void
) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      callback(key, obj[key]);
    }
  }
};

forEachObject({ firstName: "seungjune", lastName: "choi" }, (key, val) =>
  console.log(`${key} : ${val}`)
);
// prints
// firstName : seungjune
// lastName : choi
```

forEach와 forEachObject 함수 모두 고차 함수이므로 개발자가 순회 부분을 추상화해 태스크 (위의 코드에서 전달하는 callback 인자) 로 작업할 수 있다.

이러한 순회 함수를 추상화했으므로 간결한 코드로 철저히 테스트할 수 있다.

#### 제어 흐름 (control flow) 를 다루는 추상화 방법

- unless

```ts
const unless = (predicate: boolean, callback: Function) => {
  if (!predicate) callback();
};

/**
 * prints
 * 2 is even
 * 4 is even
 * 6 is even
 */
forEach([1, 2, 3, 4, 5, 6], (val) => {
  unless(!(val % 2 === 0), () => console.log(val, "is even"));
});
```

- times

```ts
const times = (times: number, callback: Function) => {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
};

/**
 * 1 ~ 100 중 짝수만 출력
 */
times(100, (val: number) => {
  unless(!(val % 2 === 0), () => {
    console.log(val, "is even");
  });
});
```

### 현실에서의 고차 함수

#### every

종종 배열의 요소 모두가 특정 조건에 맞는지 확인해야 할 때가 있는데 이를 `every` 라는 함수로 추상화할 수 있다.

```ts
const every = (arr: any[], callback: Function) => {
  let result = true;
  for (let i = 0, len = arr.length; i < len; i++) {
    result = result && callback(arr[i]);
  }
  return result;
};

console.log(
  every([2, 4, "6", 8], (item: any) => {
    return typeof item === "number";
  })
); // false

console.log(
  every([2, 4, 6, 8], (item: any) => {
    return typeof item === "number";
  })
); // true
```

- for...of 루프로 개선

```ts
const every = (arr: any[], callback: Function) => {
  let result = true;
  // 인덱스를 직접 사용하는 대신 for ...of로 추상화
  for (const item of arr) {
    result = result && callback(item);
  }
  return result;
};
```

#### some

전달된 함수에 대해 배열 요소가 하나라도 true이면 true를 반환

```ts
const some = (arr: any[], callback: Function) => {
  let result = false;
  for (const item of arr) {
    result = result || callback(item);
  }
  return result;
};
```

#### sort

- javascript Array prototype의 내장 함수인 sort는 함수를 인자로 취하는 고차 함수이다.
  - 인자로 전달되는 함수는 sort 함수의 정렬 논리를 정할 수 있게 한다.
- 기본적으로 sort 함수에 아무 인자도 넣지 않으면 요소는 문자열로 평가되어 유니코드 순서대로 비교된다.
- sort 함수는 정렬 논리를 인자로 전달받아 정렬할 수 있는 만큼 그 자체로 유연하다

인자로 전달하는 함수 구조

```ts
function compare<T>(a: T, b: T) {
  if (/* a is less than b by some ordering criterion */){
    return -1;
  }
  if (/* a is greater than b by the ordering criterion */) {
    return 1;
  }
  // a는 b와 같다.
  return 0;
}
```

example

```ts
const people = [
  { firstname: "aaFN", lastname: "cclN" },
  { firstname: "ccFN", lastname: "aalN" },
  { firstname: "bbFN", lastname: "bblN" },
];

people.sort((a, b) =>
  a.firstname < b.fistname ? -1 : a.firstname > b.firstname ? 1 : 0
);
```

인자로 전달된 속성을 기반으로 객체의 배열을 정렬할 수 있도록 함수를 추상화

```ts
const sortBy = <T>(property: keyof T) => {
  return (a: T, b: T) =>
    a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
};

people.sort(sortBy("firstname"));
```

- 여기서 sortBy 함수는 property를 인자로 받아 다른 함수를 반환한다. 반환되는 함수는 전달된 property 값을 가져와서 사용한다.
  - 이게 `클로저` 의 특징 중 하나이다. (클로저는 4장에서...)
