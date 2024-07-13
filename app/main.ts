import * as net from "net";

const server = net.createServer((socket) => {
  const readData = (data: Buffer) => {
    console.log(`Received data: ${data}`);

    const entireData = data.toString().split("\r\n");
    const userAgentString = entireData[2];
    const userAgent = userAgentString.split(" ").slice(1).join(" ");
    // const userAgent = userAgentArray[1];

    console.log({ entireData });

    // console.log({ userAgentArray });

    console.log({ userAgent });

    socket.write(
      `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
    );
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
