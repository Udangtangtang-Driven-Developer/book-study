# 2장, 타입스크립트의 타입 시스템

## 아이템6. 편집기를 사용하여 타입 시스템 탐색하기

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

## 아이템7. 타입이 값들의 집합이라고 생각하기

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

## 아이템9, 타입 단언보다는 타입 선언 사용하기

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

## 아이템 10 객체 래퍼 타입 피하기

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

## 아이템 11 잉여 속성 체크의 한계 인지하기

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
