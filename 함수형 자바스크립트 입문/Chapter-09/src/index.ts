import { API } from "./apis";
import { ErrorResponse, T1Comment, T1Data } from "./apis/types";

async function bootstrap(): Promise<void> {
  const res = await API.reddit.getPosts("reactjs");

  const isErrorResponse = (res: any): res is ErrorResponse => {
    return res.message !== undefined;
  };

  if (isErrorResponse(res)) {
    console.error(res.message);
    process.exit(1);
  }
  console.log(res.data.children[0].data);

  const comment = await API.reddit.getComments(
    `${res.data.children[0].data.permalink}`
  );

  if (isErrorResponse(comment)) {
    console.error(comment.message);
    process.exit(1);
  }

  const c = comment
    .flatMap((c) => c.data.children)
    .filter((c) => c.kind === "t1")
    .map<T1Comment>((c) => c.data as T1Comment)
    .map((c) => c.body);

  console.log(c);
}

bootstrap()
  .then(() => {})
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
