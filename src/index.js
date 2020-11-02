import("./index.scss");

import afn from "./a";

afn();
console.log("hello,webpack");
if (process.env.Node_ENV === "devellopment") {
  console.log("localhost");
} else {
  console.log("wwww");
}
