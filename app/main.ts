import * as net from "net";
import process from "process";
import { readFile, writeFile } from "node:fs";
import * as zlib from "zlib";

const server = net.createServer((socket) => {
  const setResponse = (method: string, data: Buffer, urlPath: string) => {
    const urlPathWithoutSlashes = urlPath.split("/");
    const length = urlPathWithoutSlashes.length;
    const path = urlPathWithoutSlashes[length - 1];
    const urlContent = urlPath.split("/")[1];

    // console.log({ path });
    // console.log({ urlPathWithoutSlashes });

    let response = "";

    if (urlPath === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (urlContent === "echo") {
      const entireDataTwo = data.toString().split("\r\n");

      let encodingExtensions = "";

      const messageArray = urlPath.split("/");
      console.log({ messageArray });
      const message = messageArray[messageArray.length - 1];

      entireDataTwo.forEach((datum) => {
        if (datum.toLocaleLowerCase().includes("accept-encoding:")) {
          console.log({ datum });
          encodingExtensions = datum;
        }
      });

      if (encodingExtensions.includes("gzip")) {
        const buffer = Buffer.from(message, "utf8");
        const zipped = zlib.gzipSync(buffer);

        response = `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${zipped.length}\r\n\r\n${message}`;
        socket.write(zipped);
        return;
      } else {
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
      }
    } else if (urlPathWithoutSlashes[1] === "user-agent") {
      let userAgent = "";

      const entireDataTwo = data.toString().split("\r\n");

      // console.log({ entireDataTwo });

      entireDataTwo.forEach((datum) => {
        if (datum.toLocaleLowerCase().includes("user-agent:")) {
          const formattedText = datum.split(" ").slice(1).join("");
          userAgent = formattedText;
        }
      });

      console.log({ userAgent });

      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else if (urlPathWithoutSlashes[1] === "files") {
      const directory = process.argv[3];
      const filePath = directory + path;

      console.log({ filePath });

      if (method === "GET") {
        readFile(filePath, "utf-8", (error, data) => {
          if (error) {
            response = "HTTP/1.1 404 Not Found\r\n\r\n";
          } else {
            response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
          }
        });
      } else if (method === "POST") {
        const entireDataTwo = data.toString().split("\r\n");
        const length = entireDataTwo.length;
        const fileContent = entireDataTwo[length - 1];

        writeFile(filePath, fileContent, (error) => {
          if (error) {
            response = "HTTP/1.1 404 Not Found\r\n\r\n";
          } else {
            response = `HTTP/1.1 201 Created\r\n\r\n`;
          }
        });
      }
    } else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    socket.write(response);
  };

  const readData = (data: Buffer) => {
    console.log(`Received data: ${data}`);

    const entireData = data.toString().split(" ");
    const method = entireData[0];
    const urlPath = entireData[1];

    // console.log({ entireData });

    setResponse(method, data, urlPath);
  };

  const close = () => {
    socket.end();
  };

  socket.on("data", readData);

  socket.on("close", close);
});

// server.listen(4221, "localhost");

server.listen(4221, () => {
  console.log("Server listening on port 4221");
});
