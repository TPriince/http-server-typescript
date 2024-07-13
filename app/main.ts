import * as net from "net";

const server = net.createServer((socket) => {
  const readData = (data: Buffer) => {
    console.log(`Received data: ${data}`);

    let userAgent = "";

    const entireData = data.toString().split("\r\n");
    const entireDataTwo = data.toString().split(" ");
    const urlPath = entireDataTwo[1];

    console.log({ entireDataTwo });

    entireData.forEach((datum) => {
      if (datum.toLocaleLowerCase().includes("user-agent:")) {
        console.log({ datum });
        const formattedText = datum.split(" ").slice(1).join("");
        userAgent = formattedText;
      }
    });

    console.log({ x: urlPath.split("/") });

    const urlContent = urlPath.split("/")[1];

    let response = "";

    if (!urlContent) {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (urlContent === "echo") {
      const messageArray = urlPath.split("/");
      const message = messageArray[messageArray.length - 1];
      console.log({ message });
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
    } else if (userAgent) {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    socket.write(response);
  };

  socket.on("data", readData);

  socket.on("close", () => {
    socket.end();
  });
});

// server.listen(4221, "localhost");

server.listen(4221, () => {
  console.log("Server listening on port 4221");
});
