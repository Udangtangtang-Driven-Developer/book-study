import axios from "axios";
import { RedditAPI } from "./reddit.api";

export const API = {
  reddit: new RedditAPI(axios),
};
