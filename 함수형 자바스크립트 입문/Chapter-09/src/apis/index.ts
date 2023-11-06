import axios from "axios";
import { RedditApi } from "./reddit.api";
import { MockUserApi } from "./mock-user.api";

export const API = {
  reddit: new RedditApi(axios),
  user: new MockUserApi(),
};
