import { Maybe } from "../libs";
import { API } from "./apis";
import { T1Comment, T1Data } from "./models";

async function bootstrap(): Promise<void> {
  /**
   * Maybe map example
   */
  const profileImage = API.user
    .findAll()
    .map((users) => API.user.findByName(users[0].name))
    .map((user) => user.map((u) => u.id))
    .map((id) => API.user.findProfileByUserId(id.getOrElse(0)))
    .map((p) => p.map((p) => p.profileImage));

  console.log(profileImage.value()?.value());

  /**
   * Maybe Monad flatMap example
   */
  const profileImageWithMonad = API.user
    .findAll()
    .flatMap((users) => API.user.findByName(users[0].name))
    .map((user) => user.id)
    .flatMap((id) => API.user.findProfileByUserId(id))
    .map((p) => p.profileImage);

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
    .flatMapAsync((posts) =>
      Promise.all(
        posts.map((p) => ({
          id: p.id,
          title: p.title,
          comments: API.reddit.getComments(p.permalink),
        }))
      ).then((v) => Maybe.of(v))
    )
    .then((v) => v.value())
    .then((v) =>
      v?.flatMap(async (v) => ({ ...v, comments: await v.comments }))
    );

  if (res) {
    const promise1 = await res;
    if (promise1) {
      const promise2 = await promise1;
      promise2.forEach(async (r) => {
        const post = await r;
        const comments = post.comments
          .value()
          ?.map((c) => c.data)
          .flatMap((c) => c.children)
          .filter((c) => c.kind === "t1")
          .map<T1Comment>((c) => c.data as T1Comment)
          .map((c) => c.body)
          .slice(0, 3);

        console.log({
          id: post.id,
          title: post.title,
          comments,
        });
      });
    }
  }
}

bootstrap()
  .then(() => {})
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
