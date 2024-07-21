import * as net from "net";
import process from "process";
import { readFileSync, writeFileSync } from "node:fs";

const server = net.createServer((socket) => {
  const setResponse = (method: string, data: Buffer, urlPath: string) => {
    const urlPathWithoutSlashes = urlPath.split("/");
    const length = urlPathWithoutSlashes.length;
    const path = urlPathWithoutSlashes[length - 1];
    const urlContent = urlPath.split("/")[1];

    let userAgent = "";
    let encoding = "";

    console.log({ path });
    console.log({ urlPathWithoutSlashes });

    let response = "";

    if (urlPath === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (urlContent === "echo") {
      const entireDataTwo = data.toString().split("\r\n");

      let encodingExtension = "";

      entireDataTwo.forEach((datum) => {
        if (datum.toLocaleLowerCase().includes("accept-encoding:")) {
          console.log({ datum });
          encodingExtension = datum.split(" ")[1];
          console.log({ encodingExtension });
        }
      });

      if (encodingExtension === "gzip") {
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\n\r\n`;
      } else {
        // response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n`;
        const messageArray = urlPath.split("/");
        console.log({ messageArray });
        const message = messageArray[messageArray.length - 1];
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
      }
    } else if (urlPathWithoutSlashes[1] === "user-agent") {
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

      try {
        if (method === "GET") {
          const fileContent = readFileSync(filePath);

          response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
        } else if (method === "POST") {
          const entireDataTwo = data.toString().split("\r\n");
          const length = entireDataTwo.length;
          const fileContent = entireDataTwo[length - 1];

          writeFileSync(filePath, fileContent);

          response = `HTTP/1.1 201 Created\r\n\r\n`;
        }
      } catch (error) {
        response = "HTTP/1.1 404 Not Found\r\n\r\n";
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

    console.log({ entireData });

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
