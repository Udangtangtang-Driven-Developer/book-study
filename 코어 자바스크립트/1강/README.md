# 1강, 데이터 타입

## 질문 리스트

<details>

<summary>기본형 데이터 타입 종류를 말하시오.</summary>
<ul>
<li>boolean</li>
<li>number</li>
<li>string</li>
<li>symbol</li>
<li>null</li>
<li>undefined</li>
</ul>
</details>

<details>
<summary>기본형 데이터와 참조형 데이터를 비교해서, 할당된 값 변경시 변수의 주소값에 대해 설명하시오. (메모리 개념 포함)</summary>
<ul>
<li>기본형 데이터는 불변값을 가지기 때문에 다른 값이 할당되면, 메모리 빈 공간에 해당 값이 할당되고, 변수에 새로운 주소값이 적용된다.
  </li>
<li>참조형 데이터는 새로 객체를 복사하지 않으면 동일한 메모리 주소값에서 프로퍼티의 값의 주소를 바꾼다.</li>
</ul>
</details>

<details>
<summary>불변 객체가 왜 중요한가요? 어느 경우에 사용해야 할까요?</summary>
<ul>
<li>원본 객체가 유지되어야 할 때는 불변 객체가 보장되어야 한다.</li>
<li>예시 : 이전 값과 현재 값을 비교해야 하는 경우</li>
</ul>
</details>

<details>
<summary>얇은 복사와 깊은 복사의 정의와 깊은 복사가 왜 필요한지 설명하시오.</summary>

<ul>
<li>얇은 복사 : 바로 아래 단계 프로퍼티의 주소값만 새롭게 복사하는 경우</li>
<li>깊은 복사 : 모든 프로퍼티의 주소값을 새롭게 복사하는 경우</li>
<li>얇은 복사시 바로 아래 단계는 완전히 새로운 데이터로 만들어주는 반면 중첩된 프로퍼티는 기존 데이터를 그대로 참조하기 때문에 값 변경시 원본도 변경된다.</li>
</ul>
  </details>

<details>
<summary><code>typeof null</code>의 타입은 무엇일까요?</summary>

<code>object</code>

</details>

<details>
<summary>자바스크립트가 undefined를 리턴하는 경우 3가지를 설명하시오.</summary>

<ul>
<li>값이 할당되지 않은 변수에 접근할 때</li>
<li>아무것도 return하지 않을 때</li>
<li>존재하지 않는 프로퍼티를 참조할 때</li>
</ul>
  </details>
