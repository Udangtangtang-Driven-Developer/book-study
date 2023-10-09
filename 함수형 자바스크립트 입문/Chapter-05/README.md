# 5. 배열로 함수형 다루기

_이전 챕터에서도 마찬가지이지만 설명하는 함수들이 이미 JS의 Array prototype에 정의되어 있을 수 있다._

## 배열로 함수형 다루기

참고

> Projecting function: 배열에 함수를 적용하고 새로운 배열과 값 세트를 생성하는 것을 [프로젝션] 이라고 한다.

### map

배열을 순회하여 새로운 배열로 결과를 반환한다.

```ts
const map = <T, U>(
  arr: T[],
  callback: (value: T, index: number, array: T[]) => U
): U[] => {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i], i, arr));
  }
  return result;
};
console.log(map(["1", "2", "3"], (elem) => +elem)); // [1, 2, 3]
```

- map 함수는 이전 챕터의 `forEach` 와 매우 유사하다. 새로운 배열을 반환한다는 것만 다를 뿐이다.
- map 함수는 주어진 배열의 변형된 값을 반환하므로 `프로젝팅 함수` 이다.
  조금 더 현실의 예제를 살펴보자

```ts
type Review = {
  good?: number;
  excellent?: number;
};

type Book = {
  id: number;
  title: string;
  author: string;
  rating: number[];
  reviews: Review[];
};

const apressBooks: Book[] = [
  {
    id: 111,
    title: "C# 6.0",
    author: "Andrew Troelsen",
    rating: [4.7],
    reviews: [{ good: 4, excellent: 12 }],
  },
  {
    id: 222,
    title: "Efficient Learning Machines",
    author: "Rahul Khanna",
    rating: [4.5],
    reviews: [],
  },
  {
    id: 333,
    title: "Pro AngularJS",
    author: "Adam Freeman",
    rating: [4.0],
    reviews: [],
  },
  {
    id: 444,
    title: "Pro ASP.NET",
    author: "Adam Freeman",
    rating: [4.2],
    reviews: [{ good: 14, excellent: 12 }],
  },
];
```

서버에서 만약 `apressBooks` 배열을 응답하고 화면에 표시하기 위해 title과 author 로만 이루어진 배열이 필요하다고 가정하면 아래 처럼 map을 사용할 수있다.

```ts
type BookPreview = Pick<Book, "author" | "title">;

const bookPreviews = map<Book, BookPreview>(apressBooks, (book) => {
  return {
    title: book.title,
    author: book.author,
  };
});

// 개인적으로는 속성이 선언되어있다는게 확실하고 간단한 객체 변형이라면 아래와 같이 사용하는 것을 선호함
const bookPreviews2 = map<Book, BookPreview>(
  apressBooks,
  ({ title, author }) => ({
    title,
    author,
  })
);
```

### filter

배열을 순회하며 조건에 맞는 요소만 포함하는 새 배열을 반환한다.

```ts
const filter = <T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] => {
  const result: T[] = [];

  for (let i = 0; i < arr.length; i++)
    predicate(arr[i], i, arr) && result.push(arr[i]);

  return result;
};

const source = [1, 2, 3, 4, 5];

const result = filter(source, (value) => value % 2 === 0);

console.log(result); // [2, 4]
```

위의 `apressBooks` 배열에서 rating이 4.5 초과인 책만 추출해야한다고 하면

```ts
const apressBookTitleFilter = filter(
  apressBooks,
  (book) => book.rating[0] > 4.5
);

/**
 * [
    {
      id: 111,
      title: "C# 6.0",
      author: "Andrew Troelsen",
      rating: [ 4.7 ],
      reviews: [{ good: 4, excellent: 12 }]
    }
  ]
 */
console.log(apressBookTitleFilter);
```

## 연산 연결

- 목적을 구현하고자 여러 함수를 연결 (chain) 할 필요가 있다.

예를 들어 `apressBooks` 에서 rating 값이 4.3 이상인 항목 중에서 title 과 author 객체를 추출한다고 해보자

```ts
const goodRatingBookPreviews = map(
  filter(apressBooks, (book) => book.rating[0] >= 4.3),
  ({ author, title }) => ({ author, title })
);

/**
 * [
    {
      author: "Andrew Troelsen",
      title: "C# 6.0"
    }, {
      author: "Rahul Khanna",
      title: "Efficient Learning Machines"
    }
  ]
 */
console.log(goodRatingBookPreviews);
```

map과 filter 모두 프로젝션 함수이므로 항상 배열에서 변형이 적용된 후 데이터를 반환하기 때문에 연산을 연결할 수 있다.

### concatAll

- 중첩 배열을 단일 배열로 연쇄(concatenate) 시킨다.

예시를 위해 Book의 타입을 약간 변형해서 테스트 데이터를 정의

```ts
type Review = {
  good?: number;
  excellent?: number;
};

type Book = {
  name: string;
  bookDetails: Array<{
    id: number;
    title: string;
    author: string;
    rating: number[];
    reviews: Review[];
  }>;
};

const apressBooks: Array<Book> = [
  {
    name: "beginners",
    bookDetails: [
      {
        id: 111,
        title: "C# 6.0",
        author: "Andrew Troelsen",
        rating: [4.7],
        reviews: [{ good: 4, excellent: 12 }],
      },
      {
        id: 222,
        title: "Efficient Learning Machines",
        author: "Rahul Khanna",
        rating: [4.5],
        reviews: [],
      },
    ],
  },
  {
    name: "pro",
    bookDetails: [
      {
        id: 333,
        title: "Pro AngularJS",
        author: "Adam Freeman",
        rating: [4.0],
        reviews: [],
      },
      {
        id: 444,
        title: "Pro ASP.NET",
        author: "Adam Freeman",
        rating: [4.2],
        reviews: [{ good: 14, excellent: 12 }],
      },
    ],
  },
];
```

- 앞 절의 "rating 값이 4.3 이상인 항목 중에서 title 과 author 객체를 추출" 하는 문제를 위의 데이터로 다시 해결해보자

먼저 bookDetails 데이터를 가져온다.

```ts
const details = map(apressBooks, (book) => book.bookDetails);
```

`details`은 bookDetails가 이미 배열이기 때문에 중첩 배열이 된다. 이 `details`을 filter에 전달해도 중첩배열이기 때문에 동작하지 않는다.

이 때 concatAll을 사용할 수 있다.

```ts
const concatAll = <T>(arr: T[][]): T[] => {
  const result: T[] = [];

  for (const value of arr) result.push.apply(result, value);

  return result;
};

// map, concatAll, filter를 순서대로 연결하여 문제를 해결한다.
const details = filter(
  concatAll(map(apressBooks, (book) => book.bookDetails)),
  (bookDetail) => bookDetail.rating[0] >= 4.3
);
```

**※ 책에서 나온 concatAll은 js Array.prototype 의 `flat()`의 동작과 유사하다.**

## 함수 축소

### reduce

숫자 배열 요소들의 합을 구하는 문제를 해결해야한다고하자

```ts
const source = [1, 2, 3, 4, 5];

let result = 0;
forEach(source, (value) => {
  result += value;
});
```

위와 같이 forEach를 사용해 간단하게 해결할 수 있다.

- 여기서 단일 요소로 만들고자 누산기(accumulator)를 지정하고 배열을 순회하는 모든 과정을 `배열 축소` 라고 한다.

`배열 축소` 하는 연산을 함수로 추상화 할 때 `reduce`를 사용할 수 있다.

```ts
const reduce = <T, U>(
  arr: T[],
  callback: (acc: U, value: T, index: number, array: T[]) => U,
  initialValue?: U
): U => {
  let acc: U = initialValue === undefined ? (arr[0] as any) : initialValue;

  for (let i = initialValue === undefined ? 1 : 0; i < arr.length; i++)
    acc = callback(acc, arr[i], i, arr);

  return acc;
};

const sum = reduce([1, 2, 3, 4, 5], (acc, value) => acc + value, 0);
const mux = reduce([1, 2, 3, 4, 5], (acc: number, value) => acc * value);
```

- reduce는 initialValue가 주어지지 않으면 배열의 첫번째 요소를 누산기의 초깃값으로 지정한다.

`apressBook` 에서 리뷰의 good과 excellent의 합을 구해야한다고 해보자

```ts
type ArrayItem<T> = T extends Array<infer U> ? U : never;

const result = reduce<ArrayItem<Book["bookDetails"]>, Required<Review>>(
  concatAll(map(apressBooks, (book) => book.bookDetails)),
  (acc, value) => {
    if (value.reviews.length > 0) {
      acc.good += value.reviews[0].good || 0;
      acc.excellent += value.reviews[0].excellent || 0;
    }
    return acc;
  },
  { good: 0, excellent: 0 }
);

console.log(result); //{ good: 18, excellent: 24}
```

**※ 잠깐 1. 책에는 없지만 위 예시의 함수 chaining이 가독성이 좋지 않으니 js의 Array.prototype 을 사용한 예제**

```ts
const result = apressBooks
  .map((book) => book.bookDetails)
  .flat()
  .reduce<Required<Review>>(
    (acc, value) => {
      if (value.reviews.length > 0) {
        acc.good += value.reviews[0].good || 0;
        acc.excellent += value.reviews[0].excellent || 0;
      }
      return acc;
    },
    { good: 0, excellent: 0 }
  );

// 또는 map과 flat을 합친 flatMap을 사용하여 더 짧은 코드를 만들 수 있다.
const result = apressBooks
  .flatMap((book) => book.bookDetails)
  .reduce<Required<Review>>(
    (acc, value) => {
      if (value.reviews.length > 0) {
        acc.good += value.reviews[0].good || 0;
        acc.excellent += value.reviews[0].excellent || 0;
      }
      return acc;
    },
    { good: 0, excellent: 0 }
  );
```

**※ 잠깐 2. 책의 설명이 부족해서 추가,, reduce는 일반적인 함수형 프로그래밍의 [fold](<https://ko.wikipedia.org/wiki/Fold_(%EA%B3%A0%EC%B0%A8_%ED%95%A8%EC%88%98)>) 고차 함수 계열 중 하나이다.**

- 도서의 예시는 모두 fold_left 연산으로 fold_right (혹은 reduce_right) 연산도 존재한다.
  - reduce_right는 예를 들어 문자열 반전처럼 배열의 뒷부분부터 순회하며 축소할 때 유용하다

```ts
const reduceRight = <T, U>(
  arr: T[],
  callback: (acc: U, value: T, index: number, array: T[]) => U,
  initialValue?: U
): U => {
  let acc: U = initialValue === undefined ? (arr[0] as any) : initialValue;

  for (let i = arr.length - 1; i >= 0; i--) acc = callback(acc, arr[i], i, arr);

  return acc;
};
```

## 함수 압축

### zip

주어진 두 배열을 합친다

```ts
const zip = <T, U, R>(
  leftArr: T[],
  rightArr: U[],
  fn: (leftElem: T, rightElem: U) => R
): R[] => {
  const results: R[] = [];
  for (let i = 0; i < Math.min(leftArr.length, rightArr.length); ++i)
    results.push(fn(leftArr[i], rightArr[i]));
  return results;
};

// [ "1a", "2b", "3c" ]
console.log(zip([1, 2, 3], ["a", "b", "c"], (l, r) => l + r));
```

만약 `apressBook` 데이터가 서버에서 응답되는 데이터고 reviews 데이터는 분리된 api로 호출해서 가져온다고 가정해보자

```ts
type Review = {
  id: number;
  good?: number;
  excellent?: number;
};

type Book = {
  name: string;
  bookDetails: Array<{
    id: number;
    title: string;
    author: string;
    rating: number[];
  }>;
};

const apressBooks: Array<Book> = [
  {
    name: "beginners",
    bookDetails: [
      {
        id: 111,
        title: "C# 6.0",
        author: "Andrew Troelsen",
        rating: [4.7],
      },
      {
        id: 222,
        title: "Efficient Learning Machines",
        author: "Rahul Khanna",
        rating: [4.5],
      },
    ],
  },
  {
    name: "pro",
    bookDetails: [
      {
        id: 333,
        title: "Pro AngularJS",
        author: "Adam Freeman",
        rating: [4.0],
      },
      {
        id: 444,
        title: "Pro ASP.NET",
        author: "Adam Freeman",
        rating: [4.2],
      },
    ],
  },
];

const reviews: Array<Review> = [
  { id: 111, good: 4, excellent: 12 },
  { id: 222, good: 14, excellent: 12 },
  { id: 333, good: 4, excellent: 12 },
  { id: 444, good: 4, excellent: 12 },
];
```

bookDetail만 있는 배열에 review 필드를 추가해야한다면 zip 함수를 사용할 수 있다.

```ts
const compare = <T extends { id: number }>(a: T, b: T) => a.id - b.id;

const bookDetails = concatAll(map(apressBooks, (book) => book.bookDetails));

type BookDetail = ArrayItem<Book["bookDetails"]> & {
  review: Omit<Review, "id">;
};

const mergedBookDetails = zip(
  // 책엔 없지만 sort를 추가한 이유는 api 호출을 가정한다면 id가 정확히 같은 순서로 올 것을 기대할 수 없기 때문
  bookDetails.sort(compare),
  reviews.sort(compare),
  (book, review) => {
    if (book.id === review.id) {
      return {
        ...book,
        review: { excellent: review.excellent, good: review.good },
      } as BookDetail;
    }
  }
);

/**
 * [
  {
    id: 111,
    title: "C# 6.0",
    author: "Andrew Troelsen",
    rating: [ 4.7 ],
    review: {
      excellent: 12,
      good: 4
    }
  }, {
    id: 222,
    title: "Efficient Learning Machines",
    author: "Rahul Khanna",
    rating: [ 4.5 ],
    review: {
      excellent: 12,
      good: 14
    }
  }, {
    id: 333,
    title: "Pro AngularJS",
    author: "Adam Freeman",
    rating: [ 4 ],
    review: {
      excellent: 12,
      good: 4
    }
  }, {
    id: 444,
    title: "Pro ASP.NET",
    author: "Adam Freeman",
    rating: [ 4.2 ],
    review: {
      excellent: 12,
      good: 4
    }
  }
]
*/
console.log(mergedBookDetails);
```
