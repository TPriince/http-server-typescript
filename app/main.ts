import * as net from "net";

// const server = net.createServer((socket) => {
//   socket.write("HTTP/1.1 200 OK\r\n\r\n");
//   socket.on("close", () => {
//     socket.end();
//   });
// });

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    // console.log(`Received data: ${data}`);

    const entireData = data.toString().split(" ");
    console.log({ entireData });
    const urlPath = entireData[1];

    socket.write(
      urlPath === "/"
        ? "HTTP/1.1 200 OK\r\n\r\n"
        : "HTTP/1.1 404 Not Found\r\n\r\n"
    );
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");

// server.listen(4221, () => {
//   console.log("Server listening on port 4221");
// });
