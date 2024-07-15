import * as net from "net";
import process from "process";
import { readFileSync } from "fs";

const server = net.createServer((socket) => {
  const setResponse = (data: Buffer, urlPath: string, userAgent: string) => {
    const urlPathWithoutSlashes = urlPath.split("/");
    const length = urlPathWithoutSlashes.length;
    const path = urlPathWithoutSlashes[length - 1];
    const urlContent = urlPath.split("/")[1];

    console.log({ path });
    console.log({ urlPathWithoutSlashes });

    let response = "";

    if (urlPath === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (urlContent === "echo") {
      const messageArray = urlPath.split("/");
      const message = messageArray[messageArray.length - 1];
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
    } else if (urlPathWithoutSlashes[1] === "user-agent") {
      const entireDataTwo = data.toString().split("\r\n");

      // console.log({ entireDataTwo });

      entireDataTwo.forEach((datum) => {
        if (datum.toLocaleLowerCase().includes("user-agent:")) {
          const formattedText = datum.split(" ").slice(1).join("");
          userAgent = formattedText;
        }
      });

      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else if (urlPathWithoutSlashes[1] === "files") {
      const directory = process.argv[2];
      const filePath = directory + path;

      console.log({ filePath });

      try {
        const fileContent = readFileSync(filePath);

        console.log({ fileContent });
        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
      } catch (error) {
        response = "HTTP/1.1 404 Not Found\r\n\r\n";
      }

      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    socket.write(response);
  };

  const readData = (data: Buffer) => {
    console.log(`Received data: ${data}`);

    const entireData = data.toString().split(" ");
    const urlPath = entireData[1];

    // console.log({ urlPath });

    let userAgent = "";

    let response = ``;

    setResponse(data, urlPath, userAgent);
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
