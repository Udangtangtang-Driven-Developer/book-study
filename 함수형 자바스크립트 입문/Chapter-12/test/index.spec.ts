import { assert } from "chai";
import { Container, curryN, sum } from "..";
import Sinon from "sinon";

describe("first test", () => {
  it("should be true", () => {
    assert.equal(sum(1, 2), 3);
  });
});

describe("curryN", () => {
  it("should  return a function", () => {
    const curried = curryN(sum);
    assert.isFunction(curried);
  });

  it("should throw if a function is not provided", () => {
    assert.throws(curryN as any, Error);
  });

  it("calling curried function and original function with same arguments should return same result", () => {
    const curried = curryN(sum);
    assert.equal(curried(1, 2), sum(1, 2));
    assert.equal(curried(1)(2), sum(1, 2));
  });
});

describe("Functor", () => {
  it("should store a value", () => {
    const container = Container.of(1);
    assert.equal(container.value, 1);
  });

  it("should implement map", () => {
    const container = Container.of(1);
    assert.equal(typeof container.map, "function");

    const received = container.map((x) => x + 1);
    assert.equal(received.value, 2);
  });
});

describe("asynchronous code", () => {
  it("Promise should resolve", async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve("resolved");
      }, 1000);
    });

    const result = await promise;
    assert.equal(result, "resolved");
  });
});

it("fake test", () => {
  const testObject = {
    doSomething: (callback: Function) => {
      const x = 1;
      return callback(x);
    },
  };

  const fake = Sinon.fake();
  testObject.doSomething(fake);
  assert(fake.calledWith(1));
});

it("Stub test", () => {
  const testObject = {
    tenTimes: (x: number) => x * 10,
  };

  const fakeFunction = Sinon.stub(testObject, "tenTimes");
  fakeFunction.withArgs(10).returns(100);

  const received = testObject.tenTimes(10);

  assert.equal(received, 100);
});

it("mock test", async () => {
  const httpClient = {
    get: async (url: string) => {
      return await fetch(url);
    },

    getOne: async (url: string) => {
      try {
        const response = await httpClient.get(url);
        return response.json();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };

  const mock = Sinon.mock(httpClient);
  mock
    .expects("get")
    .once()
    .withArgs("https://jsonplaceholder.typicode.com/todos/1")
    .returns(
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, title: "delectus aut autem" }),
      })
    );

  const received = await httpClient.getOne(
    "https://jsonplaceholder.typicode.com/todos/1"
  );

  assert.deepEqual(received, { id: 1, title: "delectus aut autem" });
});
