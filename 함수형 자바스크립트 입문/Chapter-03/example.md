## 고차 함수를 사용하는 예제

_조금 억지스럽지만 비즈니스 룰로 나올만한 예시임_

### Requirement

- repository 클래스로부터 artwork의 리스트를 조회한뒤 첫 5개 요소에 대해서는 랜덤 정렬을 하고 나머지 요소에 대해서는 `artwork.updatedAt`의 내림차순으로 정렬하라

```ts
const randomableArtworks = await artworkRepository.find({})
  .then((artworks) => artworks.sort((a, b) =>
    // 첫 5개 요소에 대해서 랜덤 정렬
    (artworks.indexOf(a) < 5 && artworks.indexOf(b) < 5)
    ? Math.random() - 0.5
    // 첫 5개 요소가 아닌 나머지 요소에 대해서는 updatedAt의 내림차순으로 정렬
    : return b.updatedAt.getTime() - a.updatedAt.getTime();
  ))
```
