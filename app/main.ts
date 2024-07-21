import * as net from "net";
import process from "process";
import { readFileSync, writeFileSync } from "node:fs";
import * as zlib from "node:zlib";

const server = net.createServer((socket) => {
  // Function to set the HTTP response based on the request method, data, and URL path
  const setResponse = (method: string, data: Buffer, urlPath: string) => {
    // Split the URL path to get the last segment and main path without slashes
    const urlPathWithoutSlashes = urlPath.split("/");
    const length = urlPathWithoutSlashes.length;
    const path = urlPathWithoutSlashes[length - 1];
    const urlContent = urlPath.split("/")[1];

    let response = "";

    // Handle root URL
    if (urlPath === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    }
    // Handle echo path
    else if (urlContent === "echo") {
      const entireDataTwo = data.toString().split("\r\n");

      let encodingExtensions = "";

      const messageArray = urlPath.split("/");
      const message = messageArray[messageArray.length - 1];

      // Check for Accept-Encoding header
      entireDataTwo.forEach((datum) => {
        if (datum.toLocaleLowerCase().includes("accept-encoding:")) {
          encodingExtensions = datum;
        }
      });

      // If gzip is accepted, gzip the message
      if (encodingExtensions.includes("gzip")) {
        const buffer = Buffer.from(message, "utf8");
        const zipped = zlib.gzipSync(buffer);

        response = `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${zipped.length}\r\n\r\n`;
        socket.write(response);
        socket.write(zipped);
        return;
      }
      // Otherwise, send the message in plain text
      else {
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
      }
    }
    // Handle user-agent path
    else if (urlPathWithoutSlashes[1] === "user-agent") {
      let userAgent = "";

      const entireDataTwo = data.toString().split("\r\n");

      // Extract the User-Agent header
      entireDataTwo.forEach((datum) => {
        if (datum.toLocaleLowerCase().includes("user-agent:")) {
          const formattedText = datum.split(" ").slice(1).join("");
          userAgent = formattedText;
        }
      });

      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    }
    // Handle files path
    else if (urlPathWithoutSlashes[1] === "files") {
      const directory = process.argv[3];
      const filePath = directory + path;

      try {
        // Handle GET request to read a file
        if (method === "GET") {
          const fileContent = readFileSync(filePath);
          response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
        }
        // Handle POST request to write a file
        else if (method === "POST") {
          const entireDataTwo = data.toString().split("\r\n");
          const length = entireDataTwo.length;
          const fileContent = entireDataTwo[length - 1];
          writeFileSync(filePath, fileContent);
          response = `HTTP/1.1 201 Created\r\n\r\n`;
        }
      } catch (error) {
        response = "HTTP/1.1 404 Not Found\r\n\r\n";
      }
    }
    // Handle unknown paths
    else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    socket.write(response);
  };

  // Function to read and process incoming data
  const readData = (data: Buffer) => {
    console.log(`Received data: ${data}`);

    // Split the data to get the HTTP method and URL path
    const entireData = data.toString().split(" ");
    const method = entireData[0];
    const urlPath = entireData[1];

    setResponse(method, data, urlPath);
  };

  // Function to close the socket
  const close = () => {
    socket.end();
  };

  // Set up event handlers for data and close events
  socket.on("data", readData);
  socket.on("close", close);
});

// server.listen(4221, "localhost");

server.listen(4221, () => {
  console.log("Server listening on port 4221");
});
