# 2장, 타입스크립트의 타입 시스템

## 아이템 6. 편집기를 사용하여 타입 시스템 탐색하기

- 특정 시점에 TS가 값의 타입을 어떻게 이해하고 있는지 아는 게 중요하다
  - 그걸 바탕으로 타입 넓히기와 좁히기를 할 수 있다.

```ts
// 타입 분기문의 의도대로 동작하지 않아서, 리턴 타입이 일치하지 않는 예시
const getElement = (elOrId: string | HTMLElement | null): HTMLElement => {
  if (typeof elOrId === "object") {
    // JS에서는 null의 타입이 "object"라서 여전히 object | null 타입을 가짐
    return elOrId;
  } else if (typeof elOrId === null) {
    return document.body;
  } else {
    const el = document.getElementById(elOrId);
    return el;
  }
};

//  개선된 예시
// 1. null은 obejct가 아니라 값으로 체크하기 위해서 typeof null을 null로 변경
// 2. HTMLElement는 typeof를 이용해서 "object"인지 체크

const getElement = (elOrId: string | HTMLElement | null): HTMLElement => {
  if (elOrId === null) {
    // null
    return document.body;
  } else if (typeof elOrId === "object") {
    // HTMLElement
    return elOrId;
  } else {
    // string
    const el = document.getElementById(elOrId);
    if (el) {
      return el;
    } else {
      throw new Error(`Element with id "${elOrId}" not found`);
    }
  }
};
```

### 요약

- 타입스크립트 언어 서비스 적극 활용하기
- 편집기를 통해 타입 시스템이 어떻게 동작하는지, 그리도 타입스크립트가 어떻게 타입을 추론하는지 파악
- 타입 선언 파일을 찾아보는 방법 터득하기

## 아이템 7. 타입이 값들의 집합이라고 생각하기

- 집합의 관점에서 생각해보자

```ts
interface Person {
  name: string;
}

interface Liftspan {
  birth: Date;
  death: Date;
}

type PersonSpan = Person & Liftspan;

const ps: PersonSpan = {
  name: "Alan turing",
  birth: new Date("1912/06/23"),
  death: new Date("1954/06/07"),
};

// extends 활용법
function getKey<K extends string>(value: any, key: K) {}
```

- 런타임에 모든 변수는 자바스크립트로부터 정해지는 각자의 고유한 값을 가진다.
- 코드 실행되기 전, 타입스크립트가 오류를 체크하는 순간에는 '타입'을 가지고 있다.
- 타입 체커의 역할은 하나의 집합이 다른 집합의 부분 집합인지 검사하는 것이다.
- 인터페이스 = 타입 범위 내의 값들에 대한 설명

### 타입 = 할당 가능한 값들의 집합(타입의 범위)

```ts
const x: never = 2;

type A = "This is A";

type AB = "A" | "B";

const a: AB = "A";
```

- 가장 작은 집합 : 아무것도 포함하지 않는 공집합, 아무런 값도 할당할 수 없는 **never 타입**
- 그 다음 작은 집합 : 한 가지 값만 가지는 타입 **(유닛타입 = 리터럴타입)**
- 타입을 2 ~3개로 묶으면 _유니온 타입_

### '할당 가능한'의 의미

- ~의 원소
- ~의 부분 집합
- extends : ~의 서브타입

### PersonSpan타입이 never 공잡합이 아닌 이유

- & 연산자인 인터섹션 타입의 값은 각 타입 내의 속성을 모두 포함하는 것이 일반적인 규칙이다.
- 타입 연산자는 인터페이스 속성이 아닌 값의 집합에 적용되기 때문에 추가적인 속성 가지는 값도 여전히 그 타입에 속한다.
- 인터페이스의 유니온 타입에 속하는 값은 어떠한 키도 없기 때문에 유니온에 대한 keyof는 공집합(never)이다.

```ts
interface Person {
  name: string;
}

interface LifeSpan {
  birth: Date;
  death: Date;
}

type PersonSpan = Person & LifeSpan;
type NewPersonSpan = Person | LifeSpan;

const ps: PersonSpan = {
  name: "Alan turing",
  birth: new Date("1912/06/23"),
  death: new Date("1954/06/07"),
};

// keyof (Person & LifeSpan)
type cc = keyof Person | keyof LifeSpan; //type cc = "name" | keyof LifeSpan

// keyof(Person | LifeSpan);
type dd = keyof Person & keyof LifeSpan; // never
```

- `string|Date`와 `string|number` 사이의 인터섹션은 `string`이고, 서로의 부분 집합은 아니다.
- 타입이 집합이라는 관점으로 보면 배열, 튜플 관계는 명확하다.

```ts
const list = [1, 2];
const tuple: [number, number] = list;
```

- `number[]`는 `[number,number]`의 부분집합이 아니다.
- 타입스크립트는 숫자의 쌍을 `{0:number, 1:number}` 가 아니라 `{0:number, 1:number, length:number}` 로 저장한다. 쌍에서 길이 체크하기 위해서 `length` 속성을 저장한다.
- 동일한 값의 집합을 가지는 두 타입은 같다고 할 수 있다. (집합의 관점)
- 타입스크립트 unknown은 모든 타입의 전체 집합을 의미한다.

### 요약

- 타입을 값의 집합(타입의 범위)으로 생각하라.
- 타입스크립트 타입은 엄격한 상속 관계가 아니라 겹쳐지는 집합으로 표현된다.
  - A와 B 교집합은 A 범위와 B범위의 교집합
  - 객체 타입에서 A & B인 값이 A와 B의 속성을 모두 가짐
- 상속 = 할당 가능 = 서브 타입 = A는 B의 부분 집합

## 아이템 8. 타입 공간과 값 공간의 심벌 구분하기 (값과 타입 구분하기 )

- 십벌 = 타입 공간이나 값 공간 중에 한 곳에 존재
- 이름이 같더라도 속하는 공간이 다르면 다른 것을 나타낼 수 있다. 동일한 이름 사용해서 상황에 따라 값으로 혹은 타입으로 쓰일 수 있다.

```ts
interface Cylinder {
  radius: number;
  height: number;
}

const Cylinder = (radius: number, height: number) => ({
  radius,
  height,
});

function calclulateVolume(shape: unkown) {
  // instanceof는 자바스크립트 런타임 연산자, 값에 대해서 연산
  // 따라서 타입이 아니라 값인 Cylinder 함수를 참조
  if (shape instanceof Cylinder) {
    shape.radius;
  }
}
```

### 값 일때의 class와 타입일 때의 class

- 타입으로 쓰일 때 - 형태(속성과 메서드)로 사용
- 값으로 쓰일 때 - 생성자로 사용

### typeof

- 값의 관점 - 자바스크립트 런타임의 `typeof` 연산자
- 타입의 관점 - 값을 읽어서 타입스크립트 타입으로 반환

### 타입 공간과 값 공간 혼동하지 말자

```ts
// 타입이 값으로 혼동한 경우
const email = ({ person: string, age: nubmer }) => {
  person;
};

// 타입과 값을 구분한 경우
const email2 = ({ person, age }: { person: string; age: number }) => {
  person;
};
```

### 요약

- `type`, `interface`는 타입 공간에만 존재한다.
- `class`, `enum`은 타입과 값 두가지로 사용될 수 있다.
- "foo" : _문자열 리터럴_ 이거나 *문자열 리터럴 타입*일 수 있다.
- `typeof`, `this`와 다른 연산자들과 키워드들은 타입 공간, 값 공간에서 다른 목적으로 사용될 수 있다.

## 아이템 9. 타입 단언보다는 타입 선언 사용하기

### 타입 단언 사용하는 경우

- 타입 체커가 추론한 타입보다 직접 판단한 타입이 더 정확할 때 사용
- 강제로 지정해서 타입 체커에게 오류 무시하라고 해야 할 때

### 화살표 함수의 반환 타입 명시해주기

- 화살표 함수의 타입 선언은 추론된 타입이 모호할 때가 있다. 따라서 함수 호출 체이닝 시작에서부터 명명된 타입을 가져야 한다.

```ts
interface Person {
  name: string;
}

// Person 인터페이스 사용하는 방법
// 1. 단언 사용
const people1 = ["Jack", "Bob", "Alice"].map((name) => {
  return { name } as Person;
});

/// 2. 타입과 함께 변수 선언 - 가장 직관적인 방법
const people2 = ["Jack", "Bob", "Alice"].map((name) => {
  const person: Person = { name };
  return person;
});

/// 3. 화살표 함수의 반환 타입을 선언하는 경우 (좋다 좋아!!!!)
const people3 = ["Jack", "Bob", "Alice"].map((name): Person => {
  return { name };
});
```

### as 타입 단언을 사용해야 하는 예시 = DOM element

#### 사용 해야 하는 이유

- 타입스크립트는 DOM에 접근할 수 없기 때문에 `#myButton`이 버튼 엘리먼트인지 모른다.
- 그리고 `currentTarget`이 같은 버튼이어야 하는 것도 모른다.

```tsx
// as 단언 사용
document.querySelector("#myButton")?.addEventListener("clck", (e) => {
  e.currentTarget; // EventType || null
  const button = e.currentTarget as HTMLButtonElement;
  button; // HTMLButtonElement
});
```

### null 아님을 단언하는 ! 사용하는 예시

- 단언문은 컴파일 과정 중에 제거되므로 타입 체크는 알지 못하지만 그 값이 null이 아니라고 확신할 수 있을 때 사용해야 한다.

```ts
const elOrNull = document.getElementById("friday"); // HTMLElement || null
const el = document.getElementById("friday")!; // HTMLElement
```

### 타입 단언을 통한 타입 변환

- 서로 다른 타입을 타입 단언으로 타입 변환을 할 수는 없다.
- _부분 집합(서브 타입)인 경우에 타입 단언으로 변환이 가능하다._ `(HTMLElement || null 을 HTMLElement 타입으로 변환 가능)`

```ts
interface Person {
  name: string;
}
const body = document.body;
const el = body as Person; // 타입 변환 불가
const el2 = body as unknown as Person; // 타입 변환 가능
```

- 모든 타입은 `unknown`의 서브 타입이라서 `unknown`이 포함된 단언문은 항상 동작한다.

### 요약

- 타입 단언 (`as Type`) 보다는 타입 선먼 (`:Type`)사용
- 화살표 함수의 반환 타입을 명시하는 방법 알기
- 타입 정보 잘 알고 있는 상황에서만 타입 단언, null 아님 단언문 사용

## 아이템 10. 객체 래퍼 타입 피하기

### 자바스크립트 기본형

- string
- number
- boolena
- null
- undefined
- symbol
- bigint

### 기본형 특징

- 불변하다
- 메서드를 가지지 않는다

### 그렇다면 string 타입에서 어떻게 메서드를 사용할 수 있을까?

```ts
"string".charAt;
```

#### string 타입에서 메서드를 사용할 수 있는 이유

- `string`을 사용할 떄 자바스크립트 내부적으로 기본형인 `string`을 `String 객체 타입`으로 변환함
- 이 변환은 서로 자유롭게 발생한다.

#### 타입 변환 과정

1. `string` 기본형을 `String 객체`로 래핑한다.
2. 래핑된 `String 객체`의 메서드를 호출한다.
3. 마지막에 래핑한 객체를 버린다.

#### 몽키 패치를 사용한 예시

- 몽키 패치 : 런타임에 프로그램의 어떤 기능을 수정해서 사용하는 기법

```ts
// 추천하지 않는 방식
const originalCharAt = String.prototype.charAt;

String.prototype.charAt = function (pos) {
  console.log(this, typeof this, pos);
  return originalCharAt.call(this, pos);
};

console.log("primivice".charAt(3));
// this[String: 'primitive']
// typeof this 'object'
// pos 3
```

#### String 객체 특징

1. String 객체는 오직 자기 자신하고만 동일하다.

```ts
"hello" === new String("hello"); // false
new String("hello") === new String("hello"); // true
```

2. 어떤 속성을 기본형에 할당한다면 그 속성이 사라진다.

```js
x = "hello";
x.language = "English"; // "English"
x.language; // undefined
```

- 타입 변환 과정을 살펴보자.
  1. `String 객체`로 변환
  2. language 속성 추가
  3. 마지막에 langauge 속성이 추가된 객체는 버려진다.

### 기본형과 객체 래퍼 타입 목록

| 기본형  | 객체 래퍼 타입 |
| ------- | -------------- |
| number  | Number         |
| boolean | Boolean        |
| symbol  | Symbol         |
| bigint  | BigInt         |
| string  | String         |

- string과 String 타입 사용 혼동 조심하기
- _string은 String에 할당할 수 있지만, String은 string에 할당할 수 없다._
- 런타임의 값은 기본형이다.
- 기본형 사용하는 것이 좋다.

### 요약

- 기본형 값에 메서드 제공하기 위해 객체 래퍼 타입이 어떻게 쓰이는지 이해하라.
- 기본형 타입 사용하기

## 아이템 11. 잉여 속성 체크의 한계 인지하기

### 타입이 명시된 변수에 객체 리터럴을 할당할 떄, TS는 2가지를 확인한다

1. 해당 타입의 속성이 있는지
2. 그 외의 속성은 없는지

```ts
// 타입 체커를 통과하지 못하는 예시
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}

const r: Room = {
  numDoors: 1,
  ceilingHeightFt: 1,
  animal: "dog", // 없는 속성이라 타입 에러 발생
};

// 타입 체커를 통과하는 예시
const obj = {
  numDoors: 1,
  ceilingHeightFt: 1,
  animal: "dog",
};

const rr: Room = obj;
```

### 두 예시의 타입 체크 통과 여부가 다른 이유

- 구조적 타이핑 관점이라면 에러가 발생하지 않아야 하는데 왜 발생할까?
- _obj 타입은 `Room 타입`의 부분 집합을 포함하므로 할당 가능하며, 타입 체커도 통과한다._

### 잉여 속성 체크 특징

```ts
// 타입의 범위가 넓다
interface Options {
  title: string;
  darkMode?: boolean;
}

// string 타입인 title과 또 다른 어떤 속성을 가지는 모든 객체는 Options 타입의 범위에 속한다
const o1: Options = document;
const o2: Options = new HTMLElement();

interface LineChartOptions {
  logscale?: boolean;
  invertedYAxis?: boolean;
  areaChart?: boolean;
}

const opts = { logScale: true };
const o: LineChartOptions = opts;
```

#### 기본 TS 타입 특징

- 할당 가능 검사와 잉여 속성 체크는 별도의 과정이다.
- 런타임에 예외 던지는 코드 오류 표시한다.
- 의도와 다르게 작성된 코드 찾아내 알려준다.

#### 타입에 따른 잉여 속성 검사

- 모든 속성이 optional인 약한 타입에서는 모든 객체를 포함할 수 있기 때문에 값 타입과 선언 타입에 공통된 속성이 있는지 확인하는 별도의 체크한다.
- 객체 리터럴에 알 수 없는 속성을 허용하지 않는다.
- 객체 리터럴일 때 잉여 속성 체크가 된다.
- 타입 단언에서 잉여 속성 체크 되지 않는다.
- 구조적 타이핑 시스템에서 허용되는 속성 이름 오타 같은 실수 잡는데 도움이 된다.

### 요약

- 객체 리터럴을 변수에 할당하거나 함수에 매개변수로 전달할 떄 잉여 속성 체크 수행한다.
- 임시 변수를 도입하면 잉여 속성 체크를 건너뛸 수 있다.

## 아이템 12. 함수 표현식에 타입 적용하기

### 함수 표현식을 사용하면 좋은 이유

1. 매개변수부터 반환값까지 전체를 함수 타입으로 선언할 수 있다.
2. 타입을 재사용할 수 있다.
3. 라이브러리에서 제공하는 함수 전체에 적용할 수 있는 공통 함수 시그니처를 타입으로 사용할 수 있다.

```ts
// bad case : 함수 타입이 반복적으로 쓰이는 경우
function add(a: number, b: number) {
  return a + b;
}
function sub(a: number, b: number) {
  return a - b;
}
function mul(a: number, b: number) {
  return a * b;
}
function div(a: number, b: number) {
  return a / b;
}

// good case
type BinaryFn = (a: number, b: number) => number;

const add2: BinaryFn = (a, b) => a + b;
const sub2: BinaryFn = (a, b) => a - b;
const mul2: BinaryFn = (a, b) => a * b;
const div2: BinaryFn = (a, b) => a / b;
```

### 함수 표현식과 함수 타입 적용 예시

```ts
const response = fetch("/quote?by=Mark+Twain"); // 타입이 Promise<Resposne>;

async function getQuote() {
  const response = await fetch("/quote?by=Mark+Twain");

  // 응답 데이터 추출
  const quote = await response.json();
  return quote;
}
```

#### 코드에서 생각해 볼 부분

1. `/quote`가 존재하지 않는 API 라면 `404 Not Found` 내용을 응답하기 떄문에 JSON 형식이 아닐 수 있다.
   따라서 `response.json()`은 JSON 형식이 아니라는 새로운 오류 메세지 담아
   거절된 (`rejected`) 프로미스를 반환한다.
2. 호출된 곳에서는 새로운 오류 메세지가 전달되어 실제 오류인 404가 감추어진다.
3. `fetch`가 실패하면 거절된 프로미스를 응답하지는 않는다는 걸 간과하기 쉽다.

#### 실제 오류가 발생한 위치를 체크하기 위해 상태 체크하는 `checkedFetch` 함수 구현

```ts
// fetch 함수
declare function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response>;

async function checkedFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    // 비동기 함수 내에서 거절된 프로미스를 반환한다.
    throw new Error("Request failed: " + response.status);
  }
}
```

#### 코드 변경된 부분과 장점

1. 함수 표현식으로 변경하고 `기존 fetch 함수` 재사용해서 함수 전체에 타입 적용됨. (`typeof fetch`)
2. 함수 전체 타입 적용으로 인해 반환 타입이 보장되기 때문에 반환 타입이 달라지면 오류를 알려준다. **함수 문장을 사용한 경우는 함수를 호출한 위치에서 에러가 발생하는데 표현식을 사용하면 함수 구현체에서 에러 발생한다.**
3. 함수 매개변수에 타입 선언하는 것보다 함수 표현식 전체 타입을 정의하는 게 코드가 간결하고 안전하다.

```ts
const checkedFetch2: typeof fetch = async (input, init?) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error("Request failed: " + response.status);
  }
  return response;
};
```

### 요약

- 매개변수나 반환 값에 타입을 명시하기보다는 **함수 표현식 전체에 타입 구문 적용하는 게 좋다**.
- 타입 시그니처를 반복적 작성한 코드가 있다면 함수 타입을 분리해서 재사용하자.
- 다른 함수의 시그니처를 참조하려면 `typeof Fn` 사용하면 된다.

## 아이템 13. 타입과 인터페이스의 차이점 알기

### 인터페이스와 타입의 공통점

#### 1. 인덱스 시그니처 사용 가능

```ts
type TDict = { [key: string]: string };

interface IDict {
  [key: string]: string;
}
```

#### 2. 함수 타입 정의 가능

```ts
// 타입 별칭
type TFn = (x: number) => string;

// 인터페이스
interface IFn {
  (x: number): string;
}

const toStrT: TFn = (x) => " " + x; // correct
const toStrI: IFn = (x) => " " + x; // correct
```

#### 3. 프로퍼티를 가진 함수 타입 사용 가능

- 자바스크립트에서 함수는 호출 가능한 객체라는 점 기억하자!

```ts
type TFnWithProperties = {
  (x: number): number;
  prop: string;
};

interface IFnWithProperties {
  (x: number): number;
  prop: string;
}
```

#### 4. 제네릭 사용 가능

```ts
type TPair<T> = {
  first: T;
  second: T;
};

interface IPair<T> {
  first: T;
  second: T;
}

const pairExample: TPair<number> = { first: 1, second: 2 };
```

#### 5. 타입 확장 가능

- 인터페이스는 타입을 확장할 수 있다(`extends`)
- 유니온 처럼 복잡한 타입을 확장하고 싶다면 `타입과 &`를 사용해야 한다.

```ts
interface IStateWithPop extends TState {
  poplulation: number;
}

type TStateWithPop = IState & { population: number };
```

#### 6. 클래스 구현 가능

- 클래스 구현할 때는 타입(`TState`)과 인터페이스(`IState`) 모두 사용 가능하다.

```ts
class StateT implements TState {
  name: string = "";
  capital: string = "";
}

class StateI implements IState {
  name: string = "";
  capital: string = "";
}
```

### 인터페이스와 타입의 차이점

#### 1. 타입에만 유니온 타입 존재

```ts
type AorB = "a" | "b";
```

#### 2. 인터페이스는 타입 확장할 수 있지만 유니온을 할 수 없다.

유니온 타입을 확장 하고 싶다면 하나의 변수명으로 매핑하는 인터페이스를 사용한다.

```ts
type Input = {};
type Output = {};
interface VariableMap {
  [name: string]: Input | Output;
}
```

#### 3. 유니온 타입에는 속성을 붙인 타입을 만들 수 있다.

- `type 키워드`는 유니온이 될 수도 있고, 매핑된 타입 or 조건부 타입에 활용되기 때문에 더 많이 사용된다.
- interface에서 tuple 구현 가능하지만 튜플에서 사용할 수 있는 concat 같은 메서드 사용 불가하다.

```ts
type NameVariable = (Input | Output) & { name: string };

// 타입으로 튜플과 배열 타입 표현하는 방법
type Pair = [number, number];
type StringList = string[];
type NmaedNums = [string, ...number[]];

// 인터페이스로 튜플 표현하는 방법
interface Tuple {
  0: number;
  1: number;
  length: 2;
}

const t: Tuple = [10, 20];
```

#### 4. 인터페이스에는 보강(argument)이 가능하다. = 선언 병합

- 보강이 가능하기 때문에 각 인터페이스가 병합되어서 `ES2015`에 추가된 `Array의 find`메서드도 하나의 `Array 타입`을 통해 사용할 수 있다.
- 기존 타입에 추가적인 보강이 없는 경우에만 병합 사용한다.

```ts
interface IState {
  name: string;
  capital: string;
}

interface IState {
  age: number;
}

const mallang: IState = {
  name: "Mallang",
  capital: "Seoul",
  age: 5,
};
```

### 요약

- 복잡한 타입이라면 타입 사용하기.
- 타입과 인터페이스가 모두 가능한 간단한 객체 타입이라면 일관성과 보강의 관점에서 타입을 고려해보기.
- 현재 코드베이스를 고려해서 일관된 스타일 확립하기.
- API의 경우는 인터페이스가 좋다. API 변경시 새로운 필드를 병합할 수 있어 유용하다.
- `프로젝트 내부적으로 사용되는 타입에 선언 병합이 발생하는 것은 잘못된 설계이다`.

## 아이템 14. 타입 연산과 제네릭 사용으로 반복 줄이기

### 타입 반복(중복)을 줄이는 방법

- 타입에 이름을 붙이고 재사용하라.
- 코드 타입을 공유하게 되면,중간에 속성이 추가되어도 타입 관계가 유지될 수 있다.

#### 1. 타입을 확장하라

```ts
interface Person {
  firstName: string;
  lastName: string;
}

// bad case
interface PersonWithBirthDate {
  firstName: string;
  lastName: string;
  birth: Date;
}

// good case
interface BetterPersonWithBirthDate extends Person {
  birth: Date;
}
```

#### 2. 타입을 분리해서 이름을 붙여라.

```ts
// bad case
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// good case
interface Point2D {
  x: number;
  y: number;
}

function distance(a: Point2D, b: Point2D) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
```

#### 3. 중복 사용되는 함수 타입 정의는 함수 시그니처로 분리하라.

```ts
// bad case
function get(url: string, opt: Options): Promise<Response> {}
function post(url: string, opt: Options): Promise<Response> {}

// good case
type HTTPFunction = (url: string, opt: Options) => Promise<Response>;

const get: HTTPFunction = (url, opt) => {};
const post: HTTPFunction = (url, opt) => {};
```

### 타입 중복 개선 관련 예시

#### 개선할 때 고려할 부분

- 앱 전체 상태 타입과 부분을 표현하는 타입이 있는 경우는 **인덱싱 사용**해서 **전체 앱의 상태를 하나의 인터페이스로 유지하도록 한다.**
- 목적에 따라 함께 그룹핑되어야 하는 값이라면, 하나의 타입 형태를 유지하는 게 좋다.

```ts
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}

// bad case : 타입 중복 발생
interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}

// a litte better case : `매핑된 타입` 사용해서 State[key] 반복 코드 제거하기
type TopNavState = {
  userId: State["userId"];
  pageTitle: State["pageTitle"];
  recentFiles: State["recentFiles"];
};

// good case
type GoodTopNavState = {
  [k in "userId" | "pageTitle" | "recentFiles"]: State[k];
};
```

### 매핑된 타입 활용 예시

- 매핑된 타입은 배열의 필드를 루프 도는 것과 같다.
- `Pick`은 제네릭 타입으로, 함수를 호출하는 것과 마찬가지이다. `T`,`K` 두 가지 타입을 받아서 결과 타입 반환한다.

```ts
// Pick 제네릭 함수 정의를 보면 키의 범위를 좁히기 위해서 부분 집합의 개념으로 extends를 사용한다.
type Pick<T, K extends keyof T> = { [k in K]: T[k] };
```

### 유니온 인덱싱 사용해서 반복없이 타입 정의하기

```ts
interface SaveAction {
  type: "save";
}

interface LoadAction {
  type: "load";
}

type Action = SaveAction | LoadAction;

// 타입 반복 발생
type ActionType = "save" | "load";

// 유니온을 인덱싱하면 반복 없이 정의 가능 - 유니온 타입 리턴
type ActionType2 = Action["type"];

// Pick 메서드 사용해서 인터페이스 리턴
type ActionType3 = Pick<Action, "type">;
```

### 생성하고 난 다음에 업데이트되는 클래스 정의

```ts
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}

// 타입 중복 발생
interface OptionsUpdate {
  width: number;
  height: number;
  color: string;
  label: string;
}

class UIWidget {
  constructor(init: Options) {}
  update(options: OptionsUpdate) {}
}

// keyof Options는 Options 속성타입의 유니온 반환과 동일하고, 이는 Partial 제네릭 함수와 동일하다
type OptionsUpdate2 = { [k in keyof Options]?: Options[k] };
type OptionsUpdate3 = Partial<Options>;
```

### 값에 형태에 해당하는 타입을 정의하고 싶을 때

- `typeof`, `ReturnType` 활용하기

```ts
// 타입스크립트 typeof 사용
// 값으로부터 타입 만들어낼 때 주의사항 - 값과 타입의 선언 순서가 중요하다.
const INIT_OPTIONS = {
  width: 200,
  height: 200,
  color: "#000000",
  label: "Color",
};

type InitOptionsType = typeof INIT_OPTIONS;

// 함수나 메서드의 반환 값에 명명된 타입 만들고 싶은 경우
function getUserInfo(userId: string) {
  return {
    userId,
    name,
    age,
    height,
  };
}

// 타입스크립트 ReturnType 사용
// 함수의 타입의 리턴 타입 가져오기
type UserInfo = ReturnType<typeof getUserInfo>;
```

### 제네릭 타입에서 매개변수를 좁히는 방법

- 제네릭 매개변수가 특정 타입을 확장한다고 선언하라.

```ts
interface Name {
  first: string;
  last: string;
}

type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
  { first: "Fred", last: "Astaire" },
  { first: "Ginger", last: "Rogers" },
];
```

#### 제네릭 매게변수 관련 오류 개선

```ts
interface Name {
  first: string;
  last: string;
}

// 선언부에 작성된 제네릭 매개변수에는 last 프로퍼티가 존재하는데,
// couple2의 제네릭 매개변수에는 last 프로퍼티가 존재하지 않아서 타입 에러 발생
const couple2: DancingDuo<{ first: string }> = [
  { first: "Fred" },
  { first: "Ginger" },
];

// 개선하려면 Partial을 사용해서 프로퍼티를 optional로 변경해줌
type CustomDancingDuo<T extends Partial<Name>> = [T, T];

const couple4: CustomDancingDuo<Pick<Name, "first">> = [
  { first: "Fred" },
  { first: "Ginger" },
];
```

### 요약

- 타입 공간에서도 반복적인 코드는 좋지 않다. `DRY 원칙`을 타입에도 최대한 적용하자.
- 인터페이스 필드의 반복은 `extends`를 사용해서 피하자.
- 타입들 간의 매핑을 위해 TS가 제공하는 도구인 `keyof`, `typeof`, `인덱스`, `매핑된 타입`을 활용하자.
- `Pick`, `Partial`, `ReturnType` 같은 제네릭 타입을 사용해서 타입을 매핑하자. 제네릭 타입을 제한하려면 부분 집합의 개념으로 `extends` 사용하기.
- 타입스크립트 목적은 유효한 프로그램은 통과시키고 무효한 프로그램에는 오류를 발생시키는 것이기 떄문에 `Pick`에 잘못된 키를 넣으면 오류가 발생해야 한다.

## 아이템 15. 동적 데이터에 인덱스 시그니처 사용하기

### 인덱스 시그니처 예시

```ts
type Rocket = { [property: string]: string };

const rocket: Rocket = {
  name: "Falcon 9",
  variant: "Block 5",
  thrust: "8,403 kN",
};

const text: Rocket = {};
```

### 인덱스 시그니처 의미

1. 키의 이름 - 키의 위치만 표시하는 용도, 타입 체커에서 사용하지 않음
2. 키의 타입 : `string`, `number`, `symbol` 조합이어야 하지만 보통 `string` 사용
3. 값의 타입 : 어떤 것이든 될 수 있다.

### 인덱스 시그니처의 단점

1.  `string`이라면 잘못된 키도 허용된다. name / Name 모두 가능
2.  **특정 키가 필수로 필요하지 않기 때문에 빈 객체도 유효한 Rocket 타입이다.**
3.  키마다 다른 값 타입을 가질 수 없다. only one type
4.  키 타입의 범위가 넓기 때문에 자동완성 기능을 사용할 수 없다.
5.  인덱스 시그니처는 부정확하다.

### 인터페이스 사용시 장점

- 타입 체크 허용
- 타입스크립트에서 제공하는 언어 서비스 모두 사용 : 자동 완성, 정의로 이동, 이름 바꾸기 등

```ts
// 키마다 다른 타입을 주고 싶은 경우 인터페이스 사용
interface DifferentRocket {
  name: string;
  variant: string;
  thrust_kN: number;
}

const customRocket: DifferentRocket = {
  name: "Falcon 9",
  variant: "Block 5",
  thrust_kN: 8403,
};
```

### 인덱스 시그니처를 사용해야 하는 경우

- 동적 데이터를 표현할 때
- 실무에서 사용헤 본 경험 : 데이터의 키가 랜덤 스트링으로 들어오는 경우

```ts
const parseCSV = (input: string): { [column: string]: string }[] => {
  const lines = input.split("\n");
  const [header, ...rows] = lines;
  const headerColumns = header.split(",");

  return rows.map((rowStr) => {
    // 열 이름 미리 알 수 없을 때는 인덱스 시그니처 사용
    const row: { [column: string]: string } = {};
    rowStr.split(",").forEach((cell, i) => {
      row[headerColumns[i]] = cell;
    });
    return row;
  });
};

interface ProductionRow {
  productId: string;
  name: string;
  price: string;
}

declare let csvData: string;

// 열 이름을 알고 있는 상황이라면 미리 선언해둔 타입으로 단언문 사용
// 단언문 사용해서  `[column: string]: string` 타입을 `ProductionRow` 타입으로 좁힘
const products = parseCSV(csvData) as unknown as ProductionRow;
```

#### 그런데 선언해둔 열이 런타임에 실제로 일치한다는 보장이 없다

- 걱정된다면 기존 함수를 한번 더 감싸는 함수(`safeParseCSV`) 만들고 값 타입에 `undefined` 추가
  하기

```ts
// undefined 타입이 추가된 케이스
const safeParseCSV = (
  input: string
): { [columnName: string]: string | undefined }[] => {
  return parseCSV(input);
};
```

- `undefined`를 리턴하기 떄문에 모든 열에서 `undefined` 여부를 체크해야 한다. 값 체크 여부가 추가되기 때문에 `undefined`를 타입에 추가할지는 상황에 맞게 판단하는 게 좋다.
- 연관 배열의 경우, 객체에 인덱스 시그니처 사용하는 대신 `Map 타입` 사용할 수 있다. (아이템 58에서 다룰 예정)

#### 어떤 타입에 가능한 필드가 제한되어 있는 경우라면, 인덱스 시그니처로 모델링하지 말기

- 데이터 A,B,C,D 같은 키가 얼마나 많이 있는지 모른다면 유니온 타입이나, 선택적 필드로 모델링하기

```ts
// 너무 넓은 타입
interface Row1 {
  [column: string]: number;
}

// good case - 선택적 필드
interface Row2 {
  a: number;
  b?: number;
  c?: number;
  d?: number;
}

// 유니온 타입을 모델링, 가장 정확하지만 번거로움
type Row3 =
  | { a: number }
  | { a: number; b?: number }
  | { a: number; b?: number; c?: number }
  | { a: number; b?: number; c?: number; d?: number };
```

### 인덱스 시그니처를 좀 더 narrow 하게 사용하는 방법 2가지

1. Recode 사용하기

```ts
type Vec3D = Record<"x" | "y" | "z", number>;
```

2. 매핑된 타입 사용하는 방법 : 키마다 별도의 타입을 사용이 가능하다.

```ts
type Vec3D2 = { [k in "x" | "y" | "z"]: number };

type Vec3DWithDifferentValueType = {
  [k in "x" | "y" | "z"]: k extends "x" ? string : number;
};
```

### 요약

- 런타임 때까지 객체의 속성을 알 수 없는 경우에만 `인덱스 시그니처` 사용하고 가능하다면 인덱스 시그니처보다 정확한 타입 사용하기
- 안전한 접근을 위해 인덱스 시그니처의 값 타입에 `undefined` 추가하는 것 고려해보기
