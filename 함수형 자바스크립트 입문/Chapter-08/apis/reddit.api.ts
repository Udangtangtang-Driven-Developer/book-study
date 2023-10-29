import { AxiosInstance } from "axios";
import { AnyEither, Either, Left, Nothing, Right, Some } from "../functors";

export type RedditPost = {
  kind: string;
  data: {
    modhash: string;
    children: Array<{
      kind: string;
      data: {
        id: string;
        author: string;
        title: string;
        url: string;
        // 더 많은 타입이 있지만 생략
      };
    }>;
    after: null;
    before: null;
  };
};

export type RedditError = {
  message: string;
  code: number;
};

export class RedditAPI {
  #BASE_URL = "https://www.reddit.com/r/subreddit";

  constructor(private readonly axios: AxiosInstance) {}

  /**
   * 의도적으로 axios.get에 응답 타입을 지정하지 않았습니다.
   * catch 에서 에러를 잡아서 반환하는 타입이 달라지기 때문에
   * 호출하는 쪽에서 MayBe를 사용해서 error 상황을 처리하도록 했습니다.
   */
  public async getPosts(type: string): Promise<RedditPost> {
    return this.axios
      .get(`${this.#BASE_URL}/${type}.json?limit=10`)
      .then((res) => res.data)
      .catch((err) => ({
        message: "Something went wrong",
        code: err.response?.status,
      }));
  }

  public async getPostsEither(
    type: string
  ): Promise<Either<RedditError, RedditPost>> {
    return this.axios
      .get<RedditPost>(`${this.#BASE_URL}/${type}.json?limit=10`)
      .then((res) => Right.of<RedditPost>(res.data))
      .catch((err) =>
        Left.of<RedditError>({
          message: "Something went wrong",
          code: err.response?.status,
        })
      );
  }

  public async getPostsAnyEither(type: string): Promise<AnyEither> {
    return this.axios
      .get(`${this.#BASE_URL}/${type}.json?limit=10`)
      .then((res) => Some.of(res.data))
      .catch((err) =>
        Nothing.of({
          message: "Something went wrong",
          code: err.response?.status,
        })
      );
  }
}
