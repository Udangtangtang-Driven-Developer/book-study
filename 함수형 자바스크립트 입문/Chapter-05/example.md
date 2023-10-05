### zip 함수를 실무에서 사용할 수 있는 예시

문제

> **api 서버에 subscription plan 리스트를 조회**해서 화면에 렌더링을 해야한다.\
> 화면에 보여줘야하는 **플랜별 ReactNode 는 프론트엔드에 정의**되어 있다고할 때 \
> 서버에서 받아온 plan 리스트와 프론트엔드의 플랜별 ReactNode 리스트를 **하나의 리스트로 합치자**

#### API 정의

```ts
type SubscriptionPlan = {
  id: number;
  name: string;
  price: number;
  description: string;
};

type GetSubscriptionPlans = () => Promise<SubscriptionPlan[]>;

interface SubscriptionApi {
  getSubscriptionPlans: GetSubscriptionPlans;
}
```

#### 예시용 더미 api 구현

```ts
const dummySubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Basic",
    price: 100,
    description: "Basic plan",
  },
  {
    id: 2,
    name: "Premium",
    price: 200,
    description: "Premium plan",
  },
  {
    id: 3,
    name: "Enterprise",
    price: 300,
    description: "Enterprise plan",
  },
];

const dummySubscriptionApi: SubscriptionApi = {
  getSubscriptionPlans: () => Promise.resolve(dummySubscriptionPlans),
};
```

#### 프론트엔드에 정의된 Subscription Plan 뷰 컴포넌트 리스트

```ts
type SubscriptionComponent = {
  name: string;
  element: ReactNode;
};

const dummySubscriptionComponents: SubscriptionComponent[] = [
  {
    name: "Basic",
    element: <div>Basic plan</div>,
  },
  {
    name: "Premium",
    element: <div>Premium plan</div>,
  },
  {
    name: "Enterprise",
    element: <div>Enterprise plan</div>,
  },
];
```

#### 두 리스트를 병합

```ts
const subscriptionPlans = zip(
  await dummySubscriptionApi.getSubscriptionPlans(), // 더미 api 호출
  dummySubscriptionComponents,
  (plan, component) =>
    plan.name === component.name && {
      ...plan,
      component: component.element,
    }
);
```

#### 화면에 렌더링

```ts
const SubscriptionPlans = () => {
  return (
    <>
      {subscriptionPlans.map((plan) => (
        <div key={plan.id}>
          <div>{plan.name}</div>
          <div>{plan.price}</div>
          <div>{plan.description}</div>
          <div>{plan.element}</div>
        </div>
      ))}
    </>
  );
};
```
