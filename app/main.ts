import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(`Received data: ${data}`);

    const entireData = data.toString().split(" ");
    const urlPath = entireData[1];
    const dynamicUrlArray = urlPath.split("/");
    const dynamicUrl = dynamicUrlArray[dynamicUrlArray.length - 1];

    // console.log({ dynamicUrlArray });

    let status = "";

    if (
      dynamicUrlArray.length === 2 &&
      dynamicUrlArray[0] === "" &&
      dynamicUrlArray[1] === ""
    )
      [(status = "200")];
    else if (dynamicUrlArray.length === 3 && dynamicUrl !== "") {
      status = "200";
    } else {
      status = "404";
    }

    socket.write(
      `HTTP/1.1 ${status} OK\r\nContent-Type: text/plain\r\nContent-Length: ${dynamicUrl.length}\r\n\r\n${dynamicUrl}`
    );
  });

  socket.on("close", () => {
    socket.end();
  });
});

// server.listen(4221, "localhost");

server.listen(4221, () => {
  console.log("Server listening on port 4221");
});
