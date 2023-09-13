# 1. 간단하게 살펴보는 함수형 프로그래밍

## 함수형 프로그래밍이란 무엇이고 왜 중요한가?

_함수형 프로그래밍 기술은 수학에서의 함수와 그 아이디어에서 출발했다._

### 수학에서 함수의 표현 : $f(X) = Y$

- 함수는 인자를 가져야 한다
- 함수는 값을 반환해야 한다
- 함수는 **외부가 아닌** 자체 인자(ex. X)를 받아서만 동작한다
- 주어진 X 하나에 Y는 오직 하나다

### Typescript 에서 함수 예제

```ts
// Bad case
let percentValue = 5;
const calculateTax = (value: number): number =>
  (value / 100) * (100 + percentValue);
```

- 수학에서 함수의 핵심 정의는 <code style="color : Red">함수 논리가 외부에 의존하지 않는다는 점</code>이다. 하지만 `calculateTax`는 전역 변수인 percentValue에 의존한다. 따라서 이 함수는 수학적으로 실제 함수라고 할 수 없다.

```ts
// Good case
const calculateText = (value: number, percentValue: number): number =>
  (value / 100) * (100 + percentValue);
```

- `calculateTax` 함수에서 이제 전역 변수에 직접 의존하지 않고, 테스팅을 좀 더 쉽게 할 수 있다.
  - 전역 변수에 의존하지 않기 때문에 전역 변수의 변경이 테스트에 영향을 끼치지 않는다.

### 그래서 함수형 프로그래밍이란?

- 함수형 프로그래밍이란 각 함수의 입력에 의존해 동작하는 함수를 생성하는 것

- 함수를 여러 번 호출했을 때도 동일한 결과를 반환할 수 있는 것

- 함수 외부의 데이터를 변경하지 않으므로 캐시할 수 있고 테스트할 수 있는 코드를 작성할 수 있는 것

_Tip Javascript(TS) 에서 함수와 메서드_

> #### 함수 : 이름을 통해 호출되는 코드의 일종
>
> #### 메서드 : 객체 내에 연관된 이름으로 호출되는 코드의 일종

```ts
// 함수
const simpleFunction = (a: unknown): unknown => a;
simpleFunction(1); // 이름 자체를 통해 호출

// 메서드
const util = { simpleMethod: (a: unknown): unknown => a };
util.simpleMethod(1); // 객체 내부의 연관된 이름을 통해 호출
```

## 참조 투명성 (Referential transparency)

_함수가 동일한 입력에 대해 "항상" 동일한 값을 반환하는 것을 참조 투명성 이라고 한다._

```ts
/**
 * 이 함수는 전역 변수를 참조 하지 않고
 * 주어진 입력에 대해 항상 같은 값을 반환한다.
 * 이 함수는 참조 투명성을 만족하는 함수이다.
 */
const identity = <T = any>(i: T): T => i;
```

### 치환 모델 (Substitution model)

- 표현식들에 대해 참조 투명성을 검사하기 위해 표현식을 해당 표현식의 결과로 바꿨을 때 코드의 형태

```ts
sum(1, 2) + identity(3);

// 치환 모델
sum(1, 2) + 3;
```

- 치환 모델은 **병렬 코드** 와 **캐시** 를 가능하게 한다.

## 명령형 선언형 추상화

### 명령형 형식의 반복

```ts
const arr = [1, 2, 3];

// 배열의 길이를 가져오고, 배열의 요소를 어떻게 얻어오는지 직접 알려준다.
for (i = 0; i < arr.length; ++i) console.log(arr[i]);
```

- 명령형 프로그래밍은 컴파일러에게 특정 작업을 "어떻게" 해야 하는지 직접 알려주는 것.

### 선언형 형식의 반복

```ts
const arr = [1, 2, 3];

// 여기서 배열의 각 요소를 어떻게 얻어오라는 부분은 생략되어 있다.
arr.forEach((elem) => console.log(elem));
```

- 선언형 프로그래밍은 컴파일러가 "어떤 것"을 해야하는지 정의하는 것이다
- 명령형의 "어떻게" 해야하는지는 함수 내부 (위의 예시에서는 forEach 함수의 내부)에 "추상화" 된다.

## 순수 함수 (Pure function)

- 주어진 입력에 대해 항상 동일한 출력을 반환하는 함수
- 참조 투명성을 만족하는 함수
- 외부 변수에 의존해서는 안되고, 외부 변수를 직접 변경해서도 안된다.

### 순수 함수의 장접

#### 테스트하기 편하다.

```ts
let prefix = "LOG : ";
const messaging = (message: string) => `${prefix}${message}`;
```

- 위의 `messaging` 함수는 외부 환경(`prefix`)에 의존해 논리를 계산하므로 순수하지 않은 함수이다. 함수는 동작하지만 테스트하기 어렵다.

아래와 같은 테스트가 있다고 할 때

```ts
test("log()", () => {
  expect(messaging("hi there")).toEqual("LOG : hi there");
});
```

이 테스트는 지금 당장 통과하겠지만 전역 변수인 prefix에 의존하고 있기 때문에 prefix가 변경되면 테스트가 실패하게 된다.

```ts
const messaging = (message: string, prefix: string) => `${prefix}${message}`;
```

이렇게 구성하면 외부 의존성이 없기 때문에 테스트에서의 문제가 사라진다.

#### 이상적인 코드

개발자들은 많은 시간을 다른 사람의 코드를 보는데 할애 하게되는데, 부수 효과가 있는 함수라면 팀 내 다른 개발자가 이해하기 어렵다

- 순수하지 않은 함수의 경우 함수 내부에서 인자의 값을 변경하거나 프로그램 상태를 변경하게 되는데, 이 경우 다른 개발자의 코드를 이해하기 어렵다.

순수 함수 기반 코드는 읽고, 이해하고 테스트하기 쉽다.

순수 함수든 어떤 함수든 항상 의미 있는 이름이어야 한다.

#### 병렬 코드

순수 함수는 병렬로 코드를 실행할 수 있게 한다.

#### 캐시

순수 함수는 항상 주어진 입력에 대해 동일한 출력을 반환하므로, 함수 출력을 캐시할 수 있다.

```ts
function createFactorialFunction() {
  const cache: { [key: number]: number } = {};

  function factorial(n: number): number {
    if (n === 0 || n === 1) return 1;

    // 캐시에 있으면 캐시의 값을 반환한다.
    if (cache[n]) return cache[n];

    // 캐시에 없으면 함수를 호출하고 캐시를 갱신한다.
    cache[n] = n * factorial(n - 1);
    return cache[n];
  }

  // 클로저를 반환.
  return factorial;
}

const memoizedFactorial = createFactorialFunction();

console.log(memoizedFactorial(5)); // 120
console.log(memoizedFactorial(6)); // 720
```

#### 파이프라인과 컴포저블

- 순수함수는 오직 한 가지 일만 처리한다.
- 한 가지 일만 완벽하게 처리하는 것이 유닉스 철학이고, 순수 함수를 구현할 때 이 철학을 동일하게 따라야 한다.

유닉스 / 리눅스에서는 간단한 명령어들을 파이프라인이나 compose를 이용해서 복잡한 작업을 처리한다.

```bash
cat jsBook | grep -i "composing" | wc
```

이런 방식이 유닉스 / 리눅스 cli에만 국한되는 것이 아니라 **함수형 패러다임의 핵심**이다.
이를 <code style="color : Red">함수 합성 (Functional composition)</code> 이라고 한다.

### 순수 함수는 수학적인 함수이다.

- 순수 함수는 하나의 입력에 두 개 이상의 출력이 매핑될 수 없다.

수학적 함수의 정의

> 수학에서 함수는 입력 세트와 각 입력이 정확히 해당 출력과 관련이 있는 속성을 가진 출력 세트와의 관계이다. 함수에 대한 입력을 _인자_ 라고하며, 출력을 _값_ 이라고 부른다. <code style="color : Red">주어진 함수에 허용되는 모든 입력값을 함수의 도메인 이라고 하며 이 때 출력되는 허용 집합을 코도메인이라고 한다. </code>

**이러한 정의는 순수 함수와 동일하다.**

### 자바스크립트는 함수형 프로그래밍 언어인가?

- 자바스크립트는 멀티 패러다임 언어이고, 함수형 프로그래밍도 가능하다.
- 자바스크립트는 함수를 인자로 취하고, 다른 함수로 전달 하는 등 **일급 객체(firstclass citizen)** 로 함수를 다룬다.
