import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.on('data', (data) => {
    const request: string = data.toString();
    const path: string = request.split(" ")[1];

    const query = path.split('/')[1];
    console.log(`path body`, query);

    let response = `HTTP/1.1 200 OK\r\n`;

    if (path === '/') {
      response += `\r\n`;
    }
    else if (path === `/echo/${query}`) {
      response += `Content-Type: text/plain\r\nContent-Length: ${query}.length\r\n\r\n${query}`;
    }
    else {
      response = `HTTP/1.1 404 Not Found\r\n`;
    }
    socket.write(response);
    socket.end();
  })
});

server.listen(4221, "localhost");
