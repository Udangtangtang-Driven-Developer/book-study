import { Maybe } from "../libs";
import { API } from "./apis";
import { T1Comment, T1Data } from "./models";

async function bootstrap(): Promise<void> {
  /**
   * Maybe map example
   */
  const profileImage = API.user
    .findAll() // Maybe<User[]>
    .map((users) => API.user.findByName(users[0].name)) // Maybe<Maybe<User>>
    .map((user) => user.map((u) => u.id)) // Maybe<Maybe<number>>
    .map((id) => API.user.findProfileByUserId(id.getOrElse(0))) // Maybe<Maybe<Profile>>
    .map((p) => p.map((p) => p.profileImage)); // Maybe<Maybe<string>>

  console.log(profileImage.value()?.value());

  /**
   * Maybe Monad flatMap example
   */
  const profileImageWithMonad = API.user
    .findAll() // Maybe<User[]>
    .flatMap((users) => API.user.findByName(users[0].name)) // Maybe<User>
    .map((user) => user.id) // Maybe<number>
    .flatMap((id) => API.user.findProfileByUserId(id)) // Maybe<Profile>
    .map((p) => p.profileImage); // Maybe<string>

  console.log(profileImageWithMonad.getOrElse("none"));

  /**
   * Maybe Monad flatMapAsync example
   * 비동기 처리와 함께 사용하면 체인마다 promise 가 반환되므로 체이닝의 복잡도가 높아진다.
   * 굳이 사용할 필요가 없다면 사용하지 않는 것이 좋다.
   */
  const res = (await API.reddit.getPosts("functional programming"))
    .map((posts) => posts.data)
    .map((data) => data.children)
    .map((children) =>
      children.map((c) => ({
        id: c.data.id,
        title: c.data.title,
        permalink: c.data.permalink,
      }))
    )
    .mapAsync(async (posts) =>
      posts.map(async (p) => ({
        id: p.id,
        title: p.title,
        comments: await API.reddit.getComments(p.permalink),
      }))
    )
    .then((posts) =>
      posts.map((post) => {
        return post.map(async (p) => {
          const data = await p;

          // 또다른 처리들
        });
      })
    );
}

bootstrap()
  .then(() => {})
  .catch((err) => {
    console.error(err);
  });
