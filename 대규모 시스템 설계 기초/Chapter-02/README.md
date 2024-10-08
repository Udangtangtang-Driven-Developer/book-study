# 2. 개략적인 규모 추정

> "개략적인 규모 추정(back-of-the-envelope estimation)은 보편적으로 통용되는 성능 수치상에서 사고 실험(thought experiment)을 행하여 추정치를 계산하는 행위로서, 어떤 설계가 요구사항에 부합할 것인지 보기 위한 것이다." - jeff dean -

개략적인 규모 추정을 효과적으로 하려면 '2의 제곱수' 나 latency , 가용성 같은 수치들을 표현하는 기본기를 이해할 수 있어야 한다.

## 2.1. 2의 제곱수

데이터 볼륨의 크기는 일반적으로 2의 제곱수로 표현된다.

| 2의 제곱수 | 근사치 (단위) | 데이터 볼륨 이름       | 축약형 |
| :--------: | :-----------: | :--------------------- | :----- |
|    2^10    |     1 천      | 1 킬로바이트(Kilobyte) | 1 KB   |
|    2^20    |    1 백만     | 1 메가바이트(Megabyte) | 1 MB   |
|    2^30    |     10 억     | 1 기가바이트(Gigabyte) | 1 GB   |
|    2^40    |     1 조      | 1 테라바이트(Terabyte) | 1 TB   |
|    2^50    |    1000 조    | 1 페타바이트(Petabyte) | 1 PB   |

## 2.2 모든 프로그래머가 알아야 하는 응답지연 값

구글의 jeff dean은 2010년에 통상적인 컴퓨터에서 구현된 연산들의 응답지연 값을 공개했다. **이들 가운데 몇몇은 더 빠른 컴퓨터가 등장하면서 유효하지 않게 되었지만 아직도 이 수치들은 컴퓨터 연산들의 처리 속도를 이해하는 데 도움이 된다.**

| 연산명                                          |          시간           |
| :---------------------------------------------- | :---------------------: |
| L1 캐시 참조                                    |         0.5 ns          |
| 분기 예측 오류 (branch mis-predict)             |          5 ns           |
| L2 캐시 참조                                    |          7 ns           |
| 뮤텍스(mutex) lock / unlock                     |         100 ns          |
| 주 메모리 참조                                  |         100 ns          |
| Zippy 1KB 압축                                  |    10,000 ns = 10 µs    |
| 메모리에서 1 MB 순차적으로 read                 |   250,000 ns = 250 µs   |
| 같은 데이터 센터 내에서의 메시지 왕복 지연시간  |   500,000 ns = 500 µs   |
| 디스크 탐색(seek)                               |  10,000,000 ns = 10 ms  |
| 네트워크에서 1 MB 순차적으로 read               |  10,000,000 ns = 10 ms  |
| 디스크에서 1MB 순차적으로 read                  |  30,000,000 ns = 30 ms  |
| 한 패킷의 CA(캘리포니아) - 네덜란드 간 지연시간 | 150,000,000 ns = 150 ms |

제시된 수치들을 분석하면 다음과 같은 결론이 나온다.

- 메모리는 빠르지만 디스크는 아직도 느리다.
- 디스크 탐색(seek)은 가능한 한 피해야 한다.
- 단순한 압축 알고리즘은 빠르다.
- 데이터를 인터넷으로 전송하기 전에 가능하면 압축하라.
- 데이터 센터는 보통 여러 지역(region)에 분산되어 있고, 센터들 간에 데이터를 주고 받는 데는 시간이 걸린다.

## 2.3 가용성에 관계된 수치들

고가용성(high availability, HA)은 시스템이 오랜 시간 동안 지속적으로 중단 없이 운영될 수 있는 능력을 지칭하는 용어다.

고가용성을 표현하는 값은 퍼센트(%)로 표현하는데 대부분의 시스템은 99%에서 100% 사이의 값을 가진다.

SLA(Service Level Agreement)는 서비스 사업자(Service provider)가 보편적으로 사용하는 용어로, 서비스 사업자와 고객 사이에 맺어진 합의를 의미한다. 이 합의에는 서비스 사업자가 제공하는 서비스의 가용시간(up-time)이 공식적으로 기술되어 있다.

가용시간은 **관습적으로 숫자 9를 사용해 표시한다.** (9가 많을수록 좋다고 보면 된다.)

|  가용률  | 하루당 장애시간 | 주당 장애시간 | 월간 장애시간 | 연간 장애시간 |
| :------: | :-------------: | :-----------: | :-----------: | :-----------: |
|   99%    |     14.40분     |   1.68시간    |   7.31시간    |    3.65일     |
|  99.9%   |     1.44분      |    10.08분    |    43.83분    |   8.77시간    |
|  99.99%  |     8.64초      |    1.01분     |    4.38분     |    52.60분    |
| 99.999%  |  864.00밀리초   |    6.05초     |    26.30초    |    5.26분     |
| 99.9999% |   86.40밀리초   | 604.80밀리초  |    2.63초     |    31.56초    |

### 2.3.1 예제: 트위터 QPS (Query Per Second) 와 저장소 요구량 측정

> ※ 다음 제시된 수치들은 연습용이며 트위터의 실제 수치와는 무관하다.

#### 가정

- MAU는 3억(300 million) 명이다.
- 50%의 사용자가 트위터를 매일 사용한다.
- 평균적으로 각 사용자는 매일 2건의 트윗을 올린다.
- 미디어를 포함하는 트윗은 10% 정도다.
- 데이터는 5년간 보관된다.

#### 추정

QPS(Query Per Second) 추정치

- DAU = 3억 X 50% = 1.5억 (150 million)
- QPS = (DAU X 평균 트윗 수) / 86400 = (1.5억 X 2) / 86400 = 3472 QPS (약 3500 QPS)
- 최대 QPS(Peek QPS) = 2 X QPS = 6944 QPS (약 7000 QPS)
- 5년간 미디어를 보관하기 위한 저장소 요구량 = 30TB X 365 X 5 = 54,750 TB (약 55PB)

## 2.4. 팁

개략적인 규모 추정과 관계된 면접에서 가장 중요한 것은 **문제를 풀어 나가는 절차** 이다. 올바른 절차를 밟느냐가 결과를 내는 것보다 중요하다.

면접자가 보고 싶어하는 것은 **여러분의 문제 해결 능력** 이다.

- 근사치를 활용한 계산(rounding and approximation) : 면접장에서 복잡한 계산을 하는 것은 어려운 일이다. 예를 들어, "99987/9.1" 의 계산 결과는 무엇인가? 이런 데 시간을 쓰는 것은 낭비다. 계산 결과의 정확함을 평가하는 것이 목적이 아니기 때문이다. 적절한 근사치를 활용하여 시간을 절약하라. (99987/9.1 ≈ 10000/10)
- 가정(assumption) 들은 적어 두라. 나중에 살펴볼 수 있도록
- 단위(unit) 를 붙이라. 5라고만 적으면 5KB인지 5MB인지 알 수 없다. 나중에는 여러분 스스로 헷갈리게 될 것이다. 단위를 붙이는 습관을 들여두면 모호함을 방지할 수 있다.
- 많이 출제되는 개략적 규모 추정 문제는 QPS, 최대 QPS, 저장소 요구량, 캐시 요구량, 서버 수 등을 추정하는 것이다. 면접에 임하기 전에 이런 값들을 계산하는 연습을 미리 하도록 하자. 완벽함을 달성하는 방법은 연습뿐이다.
