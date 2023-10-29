import axios from "axios";
import { RedditApi } from "./reddit.api";

export const API = {
  reddit: new RedditApi(axios),
};
