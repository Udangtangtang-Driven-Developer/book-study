# 코어 자바스크립트 3장 (this) 퀴즈

### 1. Node.js 환경에서 다음 코드의 결과를 추측하고, 이유를 말해주세요

```js
const a = 'hi there?';
module.exports = {
  a,
};

console.log(this);
console.log(this === module.exports);
```

<details> <summary>해답</summary>

#### 실행결과

```bash
{}
false
```

#### 이유

> - 도서에는 전역공간에서 `this` 를 출력하면 `global` 객체를 가리킨다고 하지만 실제로는 `{}` 혹은 `undefined` 를 가리키게 된다.
> - Node.js에서 모듈은 자체적인 스코프를 가지므로, 모듈의 최상위 레벨에서 `this`는 전역 객체인 **global을 가리키지 않으며**, 대신 모듈의 지역적인 컨텍스트에 속하게 됩니다.
> - Node.js의 모듈의 최상위 스코프에서 `this`는 모듈의 `exports` 객체를 가리키는 것으로 시작합니다. 그러나 module.exports에 직접 다른 객체를 할당하면, this와 module.exports 간의 연결이 끊어집니다.

</details>

### 2. Node.js 환경에서 다음 코드의 결과를 추측하고, 만약 에러가 발생한다면 이유를 말하고 정상 동작 할 수 있도록 수정해주세요

```ts
const UNSET_NUMBER = -1;
const UNSET_STRING = '';

const User = {
  id: UNSET_NUMBER,
  name: UNSET_STRING,
  age: UNSET_NUMBER,

  new: (id: number, name: string, age: number) => {
    (this as any).id = id;
    (this as any).name = name;
    (this as any).age = age;

    return this;
  },

  show() {
    console.log(`id: ${this.id}, name: ${this.name}, age: ${this.age}`);
  },
};

const u = User.new(1, 'Taro', 30);
console.log(u);
u.show();
```

<details> 
<summary>해답</summary>

#### 실행결과

```bash
{ id: 1, name: 'Taro', age: 30 }
TypeError: u.show is not a function
(생략)
```

#### 에러 발생이유

> - `new` 에 할당된 arrow 함수는 `this` 를 가지지 않는다 파라미터로 전달 받은 값들을 할당하는 `this` 는 전역공간의 `this`를 가리키게 된다. 즉 `User` 객체를 가리키지 않으므로 `new()` 가 반환하는 값은 `show()` 메서드를 가지지 않으므로 `show()`를 호출하면 에러가 발생한다.

#### 수정된 코드

```ts
const User = {
  id: UNSET_NUMBER,
  name: UNSET_STRING,
  age: UNSET_NUMBER,

  /**
   * 익명함수를 사용하여 `메서드` 로 호출했을 때 User 객체를 반환하도록 한다.
   * `show()` 처럼 메서드로 선언해도 된다.
   */
  new: function (id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
    return this;
  },

  show() {
    console.log(`id: ${this.id}, name: ${this.name}, age: ${this.age}`);
  },
};
```

</details>

### 3. 다음 코드의 결과를 추측하고, 만약 에러가 발생한다면 이유를 말하고 정상 동작 할 수 있도록 수정해주세요

```ts
const UNSET_NUMBER = -1;
const UNSET_STRING = '';

const User = {
  id: UNSET_NUMBER,
  name: UNSET_STRING,
  age: UNSET_NUMBER,

  new(id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
    return this;
  },
  show() {
    console.log(`id: ${this.id}, name: ${this.name}, age: ${this.age}`);
  },
};

const createNewUser = User.new;
const u = createNewUser(1, 'John', 20);
u.show();
```

<details>
    <summary>해답</summary>

#### 실행 결과

```bash
TypeError: Cannot set properties of undefined (setting 'id')
```

#### 에러 발생 이유

> new 메서드를 새로운 변수(`createNewUser`)에 할당하면 `this` 가 `undefined` 가 된다.

#### 수정된 코드

```ts
// 생략

// call로 강제로 this 를 User에 바인딩
const u = createNewUser.call(User, 1, 'John', 20);
```

</details>

### 4. 다음 코드의 결과를 추측하고, 만약 에러가 발생한다면 이유를 말하고 정상 동작 할 수 있도록 수정해주세요

```ts
const UNSET_NUMBER = -1;
const UNSET_STRING = '';

const User = {
  id: UNSET_NUMBER,
  name: UNSET_STRING,
  age: UNSET_NUMBER,

  new(id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;

    logInitMessage();

    function logInitMessage() {
      console.log(this.getInitLogMessage());
    }

    return this;
  },

  getInitLogMessage() {
    return 'User 객체를 초기화합니다.';
  },

  show() {
    console.log(`id: ${this.id}, name: ${this.name}, age: ${this.age}`);
  },
};

const u = User.new(1, 'John', 20);
u.show();
```

<details>
    <summary>해답</summary>

#### 실행 결과

```bash
TypeError: Cannot read properties of undefined (reading 'getInitLogMessage')
```

#### 에러 발생 이유

> `function` 키워드로 객체의 메서드의 내부 함수 선언시 `this` 가 `undefined` 가 되기 때문

#### 수정된 `new` 메서드

```ts
new(id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;

    // call로 this 바인딩
    logInitMessage.call(this);

    function logInitMessage(this: typeof User) {
        console.log(this.getInitLogMessage());
    }

    return this;
},
```

</details>

### 5. `Array.prototype` 의 메서드를 사용해서 `Set<number>` 의 각 요소들을 제곱해서 반환하는 코드를 작성하라

<details>
    <summary>해답</summary>

```ts
const set = new Set<number>([1, 2, 3]);

const result = Array.prototype.map.call(set, (x) => x * x);

console.log(result);
```

</details>
