import { Buffer } from "buffer";

console.log("buff:", Buffer.from("a$bc"));
console.log("buff:", Buffer.from(Buffer.from("abc", "utf-8").toString()));
