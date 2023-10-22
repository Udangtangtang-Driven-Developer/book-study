# 4장. 타입 설계

## 아이템 28. 유효한 상태만 표현하는 타입을 지향하기

- 타입을 잘 설계하면 코드를 직관적으로 작성할 수 있다.
- 타입 설계할 떄 어떤 값을 포함하고 어떤 값을 제외할지 신중하게 생각해야 한다.
- **효과적으로 타입 설계하려면 유효한 상태만 표현할 수 있는 타입 만들어야 한다.**

### 무효한 상태를 포함하는 문제 코드 예시

```ts
// 페이지 상태 설계
interface PageState {
  pageText: string;
  isLoading: boolean;
  error?: string;
}

const renderPage = (state: PageState) => {
  if (state.error) {
    return `Error! Unable to load ${currentPage}: ${state.error}`;
  } else if (state.isLoading) {
    return `Loading ${currentPage}`;
  }
  return `<h1>${currentPage}</h1>\n${state.pageText}`;
};
```

### 코드에서 문제가 되는 부분

#### `renderPage` 함수 문제점

- `isLoading`이 `true`이고 동시에 `error` 값이 존재하는 경우에 대한 분기 조건이 불명확하다. (로딩 상태인지, 오류 발생한 상태인지)

#### `changePage` 함수 문제점

```ts
const changePage = async (state: PageState, newPage: string) => {
  state.isLoading = true;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}:${response.statusText}`);
    }
    const text = await response.text();
    state.isLoading = false;
    state.pageText = text;
  } catch (e) {
    state.error = " " + e;
  }
};
```

- 오류 발생했을 때 `state.isLoading`을 `false`로 설정하는 로직이 누락되었다.
- `state.error` 초기화 하지 않아서 페이지 전환 중에 로딩 메세지 대신 과거 에러 메세지 보여준다.
- 페이지 로딩 중에 사용자가 페이지를 바꿔버리면 어떤 일이 벌어질지 예상하기 어렵다. 새 페이기에 오류가 뜨거나, 응답이 오는 순서에 따라 두 번째 페이지가 아닌 첫 번째 페이지로 전환될 수 있다.

### 무효한 상태 허용되지 않도록 코드 개선하기

- 하나의 인터페이스로 관리하던 부분을 각 상태 인터페이스로 분리해서 작성하고, 유니온 타입으로 타입 정의 명확하게 변경함.

```ts
interface RequestPending {
  state: "pending";
}

interface RequestError {
  state: "error";
  error: string;
}

interface RequestSuccess {
  state: "ok";
  pageText: string;
}

type RequestState = RequestError | RequestPending | RequestSuccess;

interface State {
  currentPage: string;
  requests: { [page: string]: RequestState };
}

const renderPage = (state: State) => {
  const { currentPage } = state;
  const requestState = state.requests[currentPage];

  switch (requestState.state) {
    case "pending":
      return `Loading ${currentPage}`;
    case "error":
      return `Error! Unable to load ${currentPage}: ${requestState.error}`;
    case "ok":
      return `<h1>${currentPage}</h1>\n${requestState.pageText}`;
  }
};

const changePage = async (state: State, newPage: string) => {
  state.requests[newPage] = { state: "pending" };
  state.currentPage = newPage;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}:${response.statusText}`);
    }
    const pageText = await response.text();
    state.requests[newPage] = { state: "ok", pageText };
  } catch (e) {
    state.requests[newPage] = { state: "error", error: "" + e };
  }
};
```

### 요약

- 유효한 상태와 무효한 상태를 둘 다 표현하는 타입은 혼란을 초래하기 쉽고 오류를 유발한다.
- 코드 길어지더라도 유효한 상태만 표현하는 타입을 지향하기

## 아이템 29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

- 함수의 매개변수 타입의 범위는 넓어도 되지만, 반환 타입은 구체적이어야 한다.

### 문제 코드 예시

```ts
declare  const setCamera = (camera : CameraOptions) : void;
declare const viewportForBounds = (bounds : LngLatBounds) : CameraOptions;

type LngLat = {lng : number; lat: number} | {log: number; lat: number} | [number,number]

interface CameraOptions {
  center?:LngLat;
  zoom?:number;
  bearing?:number;
  pitch?:number;
}

type LngLatBounds = {northeast : LngLat, southwest : LngLat} | [LngLat,LngLat] | [number,number,number,number]


// 뷰포트 조절하고 새 뷰포트를 URL에 저장하는 함수
const focusOnFeature = (f:Feature) => {
  const bounds = calculateBoundingBox(f);
  const camera = viewportForBounds[bounds]
  setCamera(camera)
  const {center : {lat,lng},zoom} = camera // 타입 에러 발생, lat, lng 속성 없음
  zoom;  // 타입이 number | undefined
}

```

- `viewportForBounds` 함수의 자유도가 너무 높다.
- 매개변수 타입의 범위가 넓으면 사용하기 편리하지만, 반환 타입의 범위가 넓으면 불편하다.

#### 코드 개선하기

- 유니온 타입 `LngLat` 타입을 배열과 배열 같은것 타입으로 구분하기
- `CameraOptions`를 엄격하게 정의된 `Camera` 타입과 `Camera` 타입이 부분적으로 정의된 버전으로 구분하기 (!!!!)

```ts

interface LngLat {lng : number; lat: number}
type LngLatLike = LngLat |  {log: number; lat: number} | [number,number]

type LngLatBounds = {northeast : LngLatLike, southwest : LngLatLike} | [LngLatLike,LngLatLike] | [number,number,number,number]

// 엄격한 타입
interface Camera {
  center:LngLat;
  zoom:number;
  bearing:number;
  pitch:number;
}


// 엄격한 Camera 타입의 조건 완화해서 느슨한 타입 만들기
interface CameraOptions extends Omit<Partial<Camera>,"center">{
  cetner?:LngLatLike
}

declare const setCamera = (camera : CameraOptions) : void;
declare const viewportForBounds = (bounds : LngLatBounds) : Camera;
```

### 요약

- 보통 매개변수 타입은 반환 타입에 비해 범위가 넓은 편이다. 선택적 속성과 유니온 타입은 반환 타입보다 매개변수 타입에 더 일반적이다.
- **매개변수와 반환 타입을 재사용하기 위해서 기본 형태(반환 타입)와 느슨한 형태(매새변수 타입)을 도입하는 것이 좋다. (!!!!!!!!)**

## 아이템 30. 문서에 타입 정보를 쓰지 않기

### 주석이 문제가 되는 경우

1. 코드를 보면 알수있는 정보를 작성한 경우
2. 불필요하게 장황한 주석을 남기는 경우
3. 코드와 주석 정보가 맞지 않는 경우

   - 실무에서 주석과 로직이 다른 코드를 본 적이 있다. 이런 경우는 본래 주석의 목적인 코드의 이해도를 높이기 보다 혼란을 초래하게 된다. 그 경험을 통해서 주석도 코드 변경사항과 일치하기 위해 관리를 해야한다는 걸 배웠다. (코드와 구현의 동기화 필수)

### 주석 활용 코드 예시

```ts
// good case
/** 애플리케이션 또는 특정 페이지의 전경색을 가져옵니다. */
const getForegroundColor = (page?: string): Color => {};
```

- 특정 매개변수를 설명하고 싶다면 `JSDoc`의 `@param` 구문 사용

### 변경되지 않아야 하는 값을 표현할 때는 `readonly` 사용하기

- 주석은 강제성이 없지만, `readonly`는 강제성 부여할 수 있다.

```ts
// bad case
/** nums를 변경하기 않습니다 */
const sort1 = (nums: number[]) => {
  nums[0] = 1; // 타입 체커 통과
};

// good case
const sort2 = (nums: readonly number[]) => {
  nums[0] = 1; // 타입 에러 발생
};
```

### 주석과 동일하게 변수에도 타입 정보 넣지 말기

- 타입으로 확인 가능한 부분은 주석에 포함하지 않듯이, 변수 이름에도 타입 정보 넣지 말기 (단위가 있는 숫자는 예외!)

#### 예시

- `ageNum` 보다는 `age`

#### 예외 케이스

- 타입이 명확하지 않은 경우에는 변수명에 단위 정보 포함하는 것도 좋다.

  - `time` 보다는 `timeMs`

  - `temperature` 보다는 `temperatureC`

### 요약

- 주석과 변수명에 타입 정보 적는 것 피하기. 타입 정보에 모순이 발생하게 된다.
- 타입이 명확하지 않는 경우 변수명에 단위 정보 포함하는 것이 좋다.

## 아이템 31. 타입 주변에 null 값 배치하기

### 타입에 null을 추가하는 이유

- 값이 전부 null이거나 전부 null이 아닌 경우가 값이 섞여 있을 때보다 다루기 쉽다.

### 숫자들의 최솟값과 최댓값을 계산하는 `extent` 함수 예시

```ts
const extent = (nums: number[]) => {
  let min, max;
  for (const num of nums) {
    if (!min) {
      min = num;
      max = num;
    } else {
      min = Math.min(min, num);
      max = Math.max(max, num);
    }
  }
  return [min, max];
};
```

#### 코드 문제점

```ts
// 1번 예시
console.log(extent([0, 1, 2])); // [ 1, 2 ]

// 2번 예시
console.log(extent([])); // [ undefined, undefined ]
```

1. 최솟값이나, 최대값이 0인 경우 값이 덧씌어져버린다.
2. 빈 배열이 들어오는 경우, `[ undefined, undefined ]` 리턴한다. `undefined`를 포함하는 객체는 다루기 어려워서 절대 권장하지 않는다.
3. 반환 타입이 `(number | undefined)[]` 라서 `extent` 호출하는 곳마다 오류 형태로 나타난다.

#### 단일 객체 사용해서 코드 개선하기

- `min`, `max`를 각각 값 체크하지 말고 `min`, `max`를 한 객체 안에 넣고 `null`이거나 `null`이 아니게 하기

```ts
// 함수 시그니처 const extent: (nums: number[]) => [number, number] | null
const extent = (nums: number[]) => {
  let result: [number, number] | null = null;
  for (const num of nums) {
    if (!result) {
      result = [num, num];
    } else {
      result = [Math.min(num, result[0]), Math.max(num, result[1])];
    }
  }
  return result;
};

console.log(extent([0, 1, 2])); // [ 0, 2 ]
console.log(extent([])); // null
```

#### `extent` 함수 사용 예시

- `null 아님 단언(!)` 사용한 경우

```ts
const [min, max] = extent([0, 1, 2])!;
const span = max - min;
```

- if 구문으로 값 체크하는 경우

```ts
const range = extent([0, 1, 2]);
if (range) {
  const [min, max] = range;
  const span = max - min;
}
```

### null과 null이 아닌 값을 섞어서 사용하는 클래스 예시

```ts
type UserInfo = any;
type Post = any;

// 사용자와 사용자 포럼 게시글 나타내는 클래스
class UserPosts {
  user: UserInfo | null;
  posts: Post[] | null;

  constructor() {
    this.user = null;
    this.posts = null;
  }

  async Init(userId: string) {
    return Promise.all([
      async () => (this.user = await fetchUser(userId)),
      async () => (this.posts = await fetchPostsForUseR(userId)),
    ]);
  }

  getUserName() {}
}
```

#### 코드 문제점

- 두 번의 네트워크 요청이 로드되는 동안 `user`,`posts` 속성은 `null` 상태다. (둘 다 `null`이거나, `null`이 아니거나, 둘 중 하나만 `null`이거나)
- 속성값의 불확실성으로 `null`체크가 난무해지기 떄문에 클래스 모든 메서드에 나쁜 영향을 준다.

#### 개선하기

필요한 데이터가 모두 준비된 후에 클래스 만들도록 변경

```ts
type UserInfo = any;
type Post = any;

class UserPosts {
  user: UserInfo | null;
  posts: Post[] | null;

  constructor(user: UserInfo, posts: Post[]) {
    this.user = null;
    this.posts = null;
  }

  static async Init(userId: string): Promise<UserPosts> {
    const [user, posts] = await Promise.all([
      fetchUser(userId),
      fetchPostsForUseR(userId),
    ]);
    return new UserPosts(user, posts);
  }

  getUserName() {}
}
```

### 요약

- 한 값의 `null` 여부가 다른 값의 `null` 여부에 암시적으로 관련되도록 설계하면 안된다.
- API 작성 시에는 반환 타입을 큰 객체로 만들고, 반환 타입 전체가 `null`이거나 `null`이 아니게 만들어야 사람과 타입 체커 모두에서 명료한 코드가 된다.
- 클래스를 만들 떄는 필요한 모든 값이 준비되었을 때 생성하여 `null`이 존재하지 않도록 하는게 좋다. (!!!)
- `strictNullChecks`는 `null`값과 관련데 문제점 찾아낼 수 있어서 반드시 필요하다.

## 아이템 32. 유니온의 인터페이스보다 인터페이스의 유니온을 사용하기

### 태그된 유니온 패턴 예시 1

- type 속성 '태그' 사용해서 `Layer` 타입 범위 좁히기
- 어떤 데이터타입을 태그된 유니온으로 표현할 수 있다면 그렇게 하는 게 보통 좋다.

```ts
//  bad case
interface Layer {
  layout: FillLayout | LineLayout | PointLayout; // 레이아웃 제어
  paint: FillPaint | LinePaint | PointPaint; // 스타일 제어
}

// good case
interface FillLayer {
  type: "fill";
  layout: FillLayout;
  paint: FillPaint;
}
interface LineLayer {
  type: "line";
  layout: LineLayout;
  paint: LinePaint;
}
interface PointLayer {
  type: "paint";
  layout: PointLayout;
  paint: PointPaint;
}

type Layer = FillLayer | LineLayer | PointLayer;

const drawLayer = (layer: Layer) => {
  if (layer.type === "fill") {
    const { paint } = layer; // 타입이 FillPaint
    const { layout } = layer; // 타입이 FillLayout
  } else if (layer.type === "line") {
    const { paint } = layer; // 타입이 LinePaint
    const { layout } = layer; // 타입이 LineLayout
  } else {
    const { paint } = layer; // 타입이 PointPaint
    const { layout } = layer; // 타입이 PointLayout
  }
};
```

### 태그된 유니온 패턴 예시 2

- 여러 개의 선택적 필드가 동시에 값이 있거나 `undefined`인 경우 사용한다.
- **서로 연관된 속성은 하나의 객체로 모으는 게 더 나은 설계이다.** 이 방법은 `null`값을 경계로 두는 방법과 비슷하다. (아이템 31에서 다룰 예정)

```ts
// bad case - 관련된 필드임에도 불구하고 타입에는 반영되지 않음
interface Person {
  name: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
}

// good case - 연관된 두개의 속성 하나의 객체로 모음
interface Person2 {
  name: string;
  birth?: {
    place: string;
    date: string;
  };
}

// use case
const alanT: Person2 = {
  name: "Alan Turing",
  birth: {
    place: "Londone",
  }, // place만 있고 date 없는 경우 오류 발생
};

// Person 객체를 매개변수로 받는 함수 - birth하나만 체크하면 된다
const eulogize = (p: Person2) => {
  console.log(p.name);
  const { birth } = p;

  if (birth) {
    console.log(`was born on ${birth.date} in ${birth.place}`);
  }
};
```

### API의 결과라서 타입 구조를 변경할 수 없는 경우 해결 방법

- 인터페이스의 유니온 사용해서 속성 사이의 관계 모델링하기
- 타입 정의를 통해 속성 간의 관계를 더 명확하게 만들기
  - 두 타입으로 구분한 방법을 실무에서 써봐야겠다!

```ts
interface Name {
  name: string;
}

interface PersonWithBirth extends Name {
  placeOfBirth: string;
  dateOfBirth: Date;
}

type Person = Name | PersonWithBirth;

const eulogize = (p: Person) => {
  if ("placeOfBirth" in p) {
    p; // 타입이 PersonWithBirth
    const { dateOfBirth } = p; // 타입이 Date
  }
};
```

### 요약

- 인터페이스에서 유니온 타입 속성을 여러개 가지는 경우, 속성 간의 관계가 분명하지 않아서 실수가 자주 발생하므로 주의하기
- **유니온의 인터페이스보다 인터페이스의 유니온이 더 좋은 설계이다.**
- 타입스크립트가 제어 흐름을 분석할 수 있도록 타입에 태그 속성 추가하는 태그된 유니온 패턴 자주 사용하기

## 아이템 33. string 타입보다 더 구체적인 타입 사용하기

### `string` 남발 코드 예시 (stringly typed)

- `string`은 `any`처럼 잘못 사용하면 무효한 값을 허용하고, 타입 간의 관계도 감추어 버린다.

```ts
// bad case
interface Album {
  artist: string;
  title: string;
  releaseDate: string; // YYYY-MM-DD
  recordingType: string; // "live" 또는 "studio"
}


const kingOfBlue: Album = {
  artist: "mallang",
  title: "kind dog",
  releaseDate: "October 19th, 2023" // Album 타입에 정의된 날짜 형식과 다름
  recordingType: "Studio", // 대문자 사용
};

const recordRelease = (title: string, date: string) => {};
recordRelease(kingOfBlue.releaseDate, kingOfBlue.artist);


```

#### 코드의 문제점

1.  `string` 타입이라서 타입 정의할 때 의도된 형식이 아니어도 문제 발생하지 않음
2.  `recordRelease` 함수의 매개변수가 모두 `string이기` 때문에, 매개변수 순서가 바뀌어도 에러 발생 하지 않음

#### 타입 좁혀서 코드 개선하기

1. `realeaseDate`는 `Date` 객체 사용 -> 날짜 형식으로 제한
2. `recordingType`은 유니온 타입으로 선언하기

```ts
/** 이 녹음은 어떤 환경에서 이루어졌는지? */
type RecordType = "live" | "studio";

// good case
interface Album {
  artist: string;
  title: string;
  releaseDate: Date;
  recordingType: RecordType;
}

const getAlbumsOfType = (recordingType: RecordType): Album[] => {
  return [];
};
```

#### 위 코드의 장점

1. 타입을 명시적 정의했기 떄문에 값이 다른 곳으로 전달되어도 타입 정보 유지된다.
2. **타입을 명시적으로 정의하고, 해당 타입의 의미를 설명하는 주석을 넣을 수 있다.** (!!!)
   ![image](https://github.com/mmyeon/til/assets/57064447/c9772593-fc86-4d4b-af3b-f74055191a03)
3. `keyof` 연산자로 더욱 세밀하게 객체 속성 체크 가능

```ts
// 배열에서 필드 값만 추출하는 함수 - Underscore 라이브러리 pluck 함수
const pluck = (records, key) => {
  return records.map((record) => record[key]);
};

// 타입 시그니처 추가
// 제네릭 타입 사용해서 key의 타입을 records의 유효한 키로 좁히기
// 반환 타입도 추론된다.
// T[keyof T] : T 객체내의 가능한 모든 값의 타입

const pluck = <T>(records: T[], key: keyof T) => {
  return records.map((record) => record[key]);
};

const releaseDates1 = pluck1(albums, "releaseDate"); // 타입이 (string | Date)[]
```

#### `relaseDates1`의 타입을 `Date[]`로 좁히기

- 두 번째 매개 변수인 키의 타입을 구체화하기 위해서 제내릭 매개변수 `K` 도입하기

```ts
const pluck2 = <T, K extends keyof T>(records: T[], key: K): T[K][] => {
  return records.map((record) => record[key]);
};

const releaseDates2 = pluck2(albums, "releaseDate"); // 타입이 Date[]
```

### 요약

- 모든 문자열 허용하는 `string`보다 구체적인 타입 사용하기
- 변수의 범위를 보다 정확하게 표현할 때는 문자열 리터럴 타입의 유니언 사용하기
- 객체의 속성 이름을 함수 매개변수로 받을 때는 `string`보다 `keyof T` 사용하기
