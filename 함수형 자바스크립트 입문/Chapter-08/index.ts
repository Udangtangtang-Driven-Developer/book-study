import { MayBe } from "./functors";
import { API } from "./apis";
import { Either, isRight, left, map, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

const getTopPosts = async (subreddit: string) =>
  MayBe.of(await API.reddit.getPosts(subreddit))
    .map((posts) => posts.data)
    .map((data) => data && data.children)
    .map(
      (children) =>
        children &&
        children.map((child) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          url: child.data.url,
        }))
    ).value;

// 성공 케이스
console.log(await getTopPosts("new"));

// 실패 케이스
console.log(await getTopPosts("wrong-subreddit"));

// *************** Either ***************

const getTopPostsEither = async (subreddit: string) => {
  const posts = await API.reddit.getPostsEither(subreddit);

  /**
   * Either의 경우에는 isLeft, isRight를 사용해서
   * 에러인지 아닌지를 판단할 수 있습니다.
   * 여기서는 isLeft를 사용해서 에러인 경우에는 그대로 반환하도록 했습니다.
   */
  if (posts.isLeft()) return posts.value;

  return posts
    .map((posts) => posts.data)
    .map((data) => data && data.children)
    .map(
      (children) =>
        children &&
        children.map((child) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          url: child.data.url,
        }))
    ).value;
};

// 성공 케이스
console.log(await getTopPostsEither("new"));

/**
 * 실패 케이스
 * {
    message: "Something went wrong",
    code: 404
  }
 */
console.log(await getTopPostsEither("wrong-subreddit"));

// *************** AnyEither ***************

const getTopPostsAnyEither = async (subreddit: string) =>
  (await API.reddit.getPostsAnyEither(subreddit))
    .map((posts: any) => posts.data)
    .map((data: any) => data && data.children)
    .map(
      (children: any) =>
        children &&
        children.map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          url: child.data.url,
        }))
    ).value;

// 성공 케이스
console.log(await getTopPostsAnyEither("new"));

/**
 * 실패 케이스
 * {
    message: "Something went wrong",
    code: 404
  }
 */
console.log(await getTopPostsEither("wrong-subreddit"));

// *************** fp-ts Either ***************

const parse =
  (errorMessage: string) =>
  (input: string): Either<string, number> => {
    const n = parseInt(input, 10);
    return isNaN(n) ? left(errorMessage) : right(n);
  };

const res = pipe(
  "4",
  parse("error"),
  map((n) => n * 2),
  map((n) => n + 1)
);

console.log(isRight(res) ? res.right : res.left);
