import { AxiosInstance } from "axios";
import { ErrorResponse, RedditResponse, T1Data, T3Data, T3Post } from "./types";

export class RedditApi {
  #baseUrl = "https://www.reddit.com";

  public constructor(private readonly client: AxiosInstance) {}

  public async getPosts(
    query: string
  ): Promise<RedditResponse<T3Data> | ErrorResponse> {
    const url = `${this.#baseUrl}/search.json?q=${query}&limit=1`;

    return this.client
      .get<RedditResponse<T3Data>>(url)
      .then((res) => res.data)
      .catch((err) => ({
        message: "Something went wrong",
        code: err.response?.status,
      }));
  }

  public async getComments(
    permalink: string
  ): Promise<Array<RedditResponse<T1Data | T3Data>> | ErrorResponse> {
    const url = `${this.#baseUrl}${permalink}.json`;

    return this.client
      .get<Array<RedditResponse<T1Data | T3Data>>>(url)
      .then((res) => res.data)
      .catch((err) => ({
        message: "Something went wrong",
        code: err.response?.status,
      }));
  }
}
