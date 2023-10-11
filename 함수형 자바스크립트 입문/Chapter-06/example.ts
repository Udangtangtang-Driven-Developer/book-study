type SortOrder = "asc" | "desc";

type VariadicFunction = (...args: any[]) => any;

const $Functional = {
  curry: <F extends VariadicFunction>(fn: F) => {
    const arity = fn.length;

    return function _curry(...args: any[]) {
      if (args.length < arity) {
        return function (...innerArgs: any[]) {
          return _curry(...args, ...innerArgs);
        };
      }

      return fn(...args);
    };
  },
  partial: <R>(
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
        if (boundArgs[i] === undefined) boundArgs[i] = laterArgs[argIdx++];

      return fn.apply(null, boundArgs);
    };
  },
};

class Person {
  public id!: number;
  public name!: string;
  public age!: number;

  constructor(params: Person) {
    Object.assign(this, params);
  }
}

const people: Person[] = [
  new Person({ id: 3, name: "a", age: 30 }),
  new Person({ id: 2, name: "b", age: 20 }),
  new Person({ id: 1, name: "c", age: 10 }),
];

function compareWithNumber<T>(order: SortOrder, property: keyof T) {
  return (a: T, b: T) => {
    if (order === "asc") {
      return a[property] > b[property] ? 1 : -1;
    } else {
      return a[property] < b[property] ? 1 : -1;
    }
  };
}

const sortByAge = $Functional.partial(
  compareWithNumber<Person>,
  undefined,
  "age"
);

/**
 * [
  {
    id: 3,
    name: "a",
    age: 30
  }, {
    id: 2,
    name: "b",
    age: 20
  }, {
    id: 1,
    name: "c",
    age: 10
  }
]
 */
console.log(people.sort(sortByAge("desc")));

/**
 * [
  {
    id: 1,
    name: "c",
    age: 10
  }, {
    id: 2,
    name: "b",
    age: 20
  }, {
    id: 3,
    name: "a",
    age: 30
  }
]
 */
console.log(people.sort(sortByAge("asc")));
