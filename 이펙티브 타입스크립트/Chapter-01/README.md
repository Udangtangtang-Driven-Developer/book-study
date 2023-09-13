# 1장. 타입스크립트 알아보기

## 아이템1. 타입스크립트와 자바스크립트 관계 이해하기

### 타입스크립트는 자바스크립트의 상위 집합이다.

- 타입스크립트 프로그램 = 자바스크립트 프로그램 + 타입 체커를 통과한 타입스크립트 프로그램
- 모든 JS는 TS이지만, 일부 JS, TS만이 타입 체크를 통과한다.
- 따라서 .js 확장자를 .ts로 바꾼다고 해도 달라지는 것은 없다. **모든 JS 프로그램은 이미 TS 프로그램이다.**
- **문법의 유효성과 동작이 이슈는 독립적인 문제다**. 문법에 문제가 있어도 타입스크립트는 여전히 작성된 코드를 파싱하고 자바스크립트로 변환할 수 있다. (TS 사용시 런타임 에러가 발생할 수 있는 이유)
- 타입스크립트는 초기값부터 타입을 추론하기 때문에 변수의 값을 알려주지 않아도 타입을 알 수 있다.
- 타입스크립트가 어떻게 타입을 추론하는지 알면 어떻게 사용해야 하는지 알 수 있다.

### 타입 스크립트 쓰면 좋은 점

- 코드는 2가지 종류가 있다.
  1. 오류가 발생한 코드
  2. 오류가 발생하지는 않지만 의도와 다르게 동작하는 코드
- **타입 구문을 추가하면 코드에 '의도'가 들어가기 때문에 훨씬 더 많은 오류를 찾아낼 수 있다.**

```ts
interface Food {
  name: string;
  color: string;
}

const foods: Food[] = [
  // coloor 프로퍼티 이름 달라서 에러 발생
  { name: "grape", coloor: "purple" },
  { name: "apple", coloor: "red" },
];

for (const food of foods) {
  console.log(food.color); // undefined
}
```

### 타입스크립트 쓰면 미리 잡을 수 있는 오류 예시

- 타입스크립트를 쓰는 목적은 런타임에 오류를 발생시킬 코드를 미리 찾는 것이다 (정적 타입 시스템 활용)
- 아래의 구문은 자바스크립트에서 어떠한 오류없이 실행되지만, 타입스크립트를 사용하면 미리 오류를 찾아낼 수 있다.

```ts
// 메서드 대소문자 잘못 입력한 경우
console.log(city.toUppercase()); // TypeError

// property 이름을 오타낸 경우
const foods = [
  { name: "grape", coloor: "purple" },
  { name: "apple", coloor: "red" },
];

for (const food of foods) {
  console.log(food.color); // undefined
}
```

### 타입 시스템은 자바스크립트의 런타임 동작을 '**모델링**'한다

- 실제로는 프로그램에 오류가 발생하지 않더라도 타입 체커가 오류를 표시한다.

```ts
// 자바스크립트 런타임 동작을 모델링하기에 아래코드를  타입 체커는 정상으로 인식함
const x = 2 + "3";

// 반대로 정상 동작 코드를 오류로 표시하기도 함
const a = null + 7; // JS에서는 7
const b = [] + 12; // JS에서는 '12'
```

### 타입 체크 통과하더라도 여전히 런타임 오류가 발생할 수 있다.

- 타입스크립트가 이해하는 값 타입과 실제 값에 차이가 있기 떄문이다.
- 타입스크립트가 만들어진 목적은 정적 타입의 정확성이 아니다. 런타임 안정성을 보장한다는 건 JS의 상위집합이 아니라는 의미고, 그럼 마이그레이션 과정이 매우 복잡할 것이다.
- TS는 자바스크립트 런타임 동작을 모델링하는 타입시스템을 가지기 때문에, 그래서 런타임 오류를 발생시키는 코드를 미리 찾아낼 수 있는 것이다.
- **그럼에도 불구하고 TS 타입 체커를 통과하면서도 런타임 오류를 발생시키는 상황이 존재할 수 있다.**

```ts
const likes = ["mallang", "dog"];
console.log(likes[2].toUpperCase());
```

---

## 아이템2. 타입스크립트 설정 이해하기 (tsconfig.json)

- noImplicitAny : 변수들이 미리 정의된 타입을 가져야 하는지 여부를 제어하는 설정 (암시적 any 혀용여부)
- strictNullChecks : null과 undefined가 모든 타입에서 허용되는지 확인하는 설정
- 엄격한 체크를 하고 싶다면 strict 설정 고려하기

```ts
// strictNullChecks 해제
const x: number = null;
// strictNullChecks 설정
// 명시적으로 null을 허용한다는 의도를 드러내기 때문에 오류를 잡아내지만, 코드 작성을 어렵게 한다.
const y: number | null = null;
```

---

## 아이템3. 코드 생성과 타입이 관계없음을 이해하기

### 타입스크립트 컴파일러(tsc)가 하는 일

1. 최신 TS, JS를 브라우저에서 동작할 수 있도록 구버전의 JS로 트랜스파일한다.**(코드 생성 = 컴파일)**
2. 코드의 타입 오류를 체크한다. **(타입 체크)**

## 코드 생성과 타입 체크는 독립적이다.

- JS 변환될 때 타입은 아무런 영향도 주지 않는다. 실행 시점에서도 마찬가지!

## 코드 생성과 타입 체크는 독립적이어서 발생하는 일

1. **타입 오류가 있는 코드도 컴파일이 가능하다**. 타입 체크와 컴파일은 독립적이기 떄문에. 문제가 있다고 알려주지만, 빌드를 멈추지는 않는다. 오류가 있을 때 컴파일하지 않으려면, noEmitOnError 설정하기
2. 런타임에는 타입 체크가 불가능하다.

```ts
// 타입 에러 발생
interface Square {
  width: number;
}

interface Rectangle extends Square {
  height: number;
}

type Shape = Square | Rectangle;
const calculateArea = (shape: Shape) => {
  // instanceof 체크는 런타임에 일어나고, Rectangle은 타입이라서 런타임 시점에서 활용할 수 없다.
  if (shape instanceof Rectangle) {
    return shape.width & shape.height;
  }
};
```

### 런타임 시점에서 타입 정보를 활용하고 싶다면

- JS로 컴파일 되는 과정에서 모든 인터페이스, 타입, 타입 구문, 타입 연산이 제거되도 타입 정보를 활용할 수 있는 방법이 있다.

#### 1. 속성 존재하는지 체크

```ts
interface Square {
  width: number;
}

interface Rectangle extends Square {
  height: number;
}

type Shape = Square | Rectangle;
const caculateArea = (shape: Shape) => {
  if ("height" in shape) {
    // 타입이 Rectangle
    return shape.width * shape.height;
  } else {
    // 타입이 Square
    return shape.width;
  }
};
```

#### 런타임에 접근 가능한 타입 정보 명시적 저장 - 태그 기법

```ts
interface Square {
  kind: "Square";
  width: number;
}

interface Rectangle {
  kind: "Rectangle";
  width: number;
  height: number;
}

type Shape = Square | Rectangle;
const caculateArea = (shape: Shape) => {
  // 태그된 유니온 기법
  if (shape.kind === "Rectangle") {
    // 타입이 Rectangle
    return shape.width * shape.height;
  } else {
    // 타입이 Square
    return shape.width;
  }
};
```

#### 클래스 타입과 인스턴스 활용 - 타입(런타임 접근 불가)과 값(런타임 접근 가능)을 둘다 사용하는 방법

- 클래스 선언시 타입과 값으로 모두 사용할 수 있다.

```ts
class Square {
  constructor(public width: number) {}
}

class Rectangle extends Square {
  constructor(public width: number, public height: number) {
    super(width);
  }
}

// 타입으로 참조
type Shape = Square | Rectangle;

const caculateArea = (shape: Shape) => {
  // 값으로 참조
  if (shape instanceof Rectangle) {
    // 타입이 Rectangle
    return shape.width * shape.height;
  } else {
    // 타입이 Square
    return shape.width;
  }
};
```

### 값 정제가 필요한 경우

- 타입 연산은 런타임에 영향을 주지 않는다. 따라서 값 정제가 필요하다면, 런타임의 타입을 체크해야 하고, JS 연산을 통해 변환을 수행해야 한다.

```ts
const asNumber = (value: number | string) => {
  return value as number;
};

// JS로 변환시 코드 정제 과정 모두 사라짐
const asNumberInJS = (value) => {
  return value;
};

const correctAsNumber = (value: number | string) => {
  return typeof value === "string" ? Number(value) : value;
};
```

### 런타임 타입은 선언된 타입과 다를 수 있다.

- 따라서 타입이 달라지는 상황은 가능한 피하는게 좋다. **선언된 타입이 언제든지 달라질 수 있다는 것을 명심하기**

```ts
// 런타임에서 bollean타입은 제거된다.
const setLightSwitch = (value: boolean) => {
  switch (value) {
    case true:
      turnLightOn();
      break;
    case false:
      turnLightOff();
      break;
    default:
      console.log("실행되나요?");
  }
};

// 실수로 문자열로 호출하는 경우
setLightSwitch("ON");
```

### TS 타입으로는 함수를 오버로드 할 수 없다.

- TS에서는 타입과 런타임 동작이 무관하기 때문에 함수 오버로딩(동일한 이름에 매개변수만 다른 여러 버전의 함수 허용) 불가능하다

### 타입스크립트 타입은 런타임 성능에 영향을 주지 않는다.

---

## 아이템4. 구조적 타이핑에 익숙해지기

### 타입스크립트는 JS의 덕 타이핑을 그대로 모델링한다.

- JS는 덕 타이핑 기반이라서 매개변수 값이 주어진다면, 값을 신경쓰지 않고 사용한다.
- TS도 JS 덕 타이핑을 그대로 모델링해서 매개변수 값이 요구사항을 만족한다면, 타입이 무엇인지 신경쓰지 않는다.

```ts
interface Vector2D {
  x: number;
  y: number;
}

interface NamedVector {
  name: string;
  x: number;
  y: number;
}

const calculateLength = (v: Vector2D) => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

const v: NamedVector = { x: 3, y: 4, name: "Zee" };
// Vector2D와 NamedVector 관계를 전혀 선언하지 않아도 에러 발생하지 않음
calculateLength(v);
```

### 구조가 호환되기 때문에 함수 호출이 가능하다 (구조적 타이핑)

- 구조가 같으면 값 할당을 허용하기 떄문에 매개변수 타입이 봉인되어 있지 않고 오픈되어 있다고 할 수 있다. (정확한 타입만 허용하지 않음)
- 따라서 함수를 작성할 때, 함수가 매개변수의 타입에 선언된 속성 이외의 속성을 가진 타입이 들어올 수 있다는 걸 감안해야 한다.
- 오픈 되어 있다는 건, 다시 말하면 타입 시스템이 정확한 타입을 확정지을 수 없다는 의미이다.

```ts
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

const calculateLength1 = (v: Vector3D) => {
  let length = 0;
  // axis 타입이 "x","y","z" 중 하나가 아니라 string임.
  // 매개변수 타입이 봉인되어 있지 않기 때문에, v는 어떤 속성이든 가질 수 있고,
  // v[axis]가 어떤 타입을 가지게 될지 TS는 확정지을 수 없음
  for (const axis of Object.keys(v)) {
    const coord = v[axis];
  }
};
```

- 루프보다 모든 속성을 각각 더하는 구현이 더 낫다.

```ts
const calculateLength1 = (v: Vector3D) => {
  return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
};
```

### 클래스도 구조적 타이핑 규칙을 따른다.

- 클래스도 다르지 않기 떄문에, 클래스 인스턴스가 예상과 다를 수 있다. 구조적으로 필요한 속성과 생성자가 존재하기 떄문에 타입 할당이 가능해진다.

```ts
class C {
  foo: string;
  constructor(foo: string) {
    this.foo = foo;
  }
}

const c = new C("instance of C");
// string타입의 foo 속성을 가짐
// 생성자(Object.prototype)를 가짐
const d: C = { foo: "object literal" };
```

### 테스트 작성할 떄는 구조적 타이핑이 유리하다.

---

## 아이템5. any 타입 지양하기

### any의 장점

- 점진적, 선택적으로 타입을 추가하게 해주는 친구이다. migration할 때 매우 유용함.

### 그럼에도 불구하고 any 사용을 자제해야 하는 이유

1.  any 타입에는 타입 안정성이 없다. 정의된 타입과 다른 타입도 할당할 수 있다.

```ts
let age: number;
age = "12" as any;
```

2. any는 함수 시그니처를 무시해버린다. 함수 작성시 중요한 게 시그니처로, 약속된 타입을 입력받고, 약속된 타입을 출력 반환해야 한다. any 사용시 정의된 타입과 다른데도 오류없이 실행된다.

```ts
const calculateAge = (birthDate: Date): number => {};

let birthDate: any = "1212";
calculateAge(birthDate);
```

3. 자동완성기능과 도움말, 이름 동시 변경과 같은 언어 서비스 적용되지 않는다.
4. any 타입은 코드 리팩터링할 때 버그를 감춘다. 타입 체크를 통과하게 만들어서 에러를 발견할 수가 없기 때문에 타입시스템의 신뢰도를 낮춘다.

```ts
interface ComponentProps {
  onSelectItem: (id: number) => void;
}

const renderSelector = (props: ComponentProps) => {};

let selectedId: number = 0;

const handleSelecItem = (item: any) => {
  selectedId = item.id;
};

// onSelectItem와 handleSelecItem의 타입이 달라도 오류 발생하지 않음
renderSelector({ onSelectItem: handleSelecItem });
```
