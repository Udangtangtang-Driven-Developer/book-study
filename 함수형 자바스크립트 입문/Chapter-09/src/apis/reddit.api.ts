import { AxiosInstance } from "axios";
import { Reddit, T1Data, T3Data } from "../models";
import { Maybe } from "../../libs";

type RedditPost = Reddit<T3Data>;
type RedditComment = Array<Reddit<T1Data | T3Data>>;

export class RedditApi {
  #baseUrl = "https://www.reddit.com";

  public constructor(private readonly client: AxiosInstance) {}

  public async getPosts(query: string): Promise<Maybe<RedditPost>> {
    const url = `${this.#baseUrl}/search.json?q=${query}&limit=5`;

    return this.client
      .get<RedditPost>(url)
      .then((res) => Maybe.of(res.data))
      .catch(() => Maybe.nothing());
  }

  public async getComments(permalink: string): Promise<Maybe<RedditComment>> {
    const url = `${this.#baseUrl}${permalink}.json`;

    return this.client
      .get<RedditComment>(url)
      .then((res) => Maybe.of(res.data))
      .catch(() => Maybe.nothing());
  }
}
