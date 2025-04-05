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
    let params = path.split('/')[1];
    console.log(params);

    const writeResponse = (response: string): void => {
      socket.write(response);
      socket.end();
    }

    let response = `HTTP/1.1 200 OK\r\n`;

    switch (params) {
      case '': {
        response += '\r\n';
        writeResponse(response);
        break;
      }
      case 'echo': {
        const query = path.split('/')[2];
        response += `Content-Type: text/plain\r\nContent-Length: ${query.length}\r\n\r\n${query}`;
        writeResponse(response);
        break;
      }
      case 'user-agent': {
        const userAgent: string = request.split("\r\n")[2].split(":")[1].trim();
        response += `Content-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        writeResponse(response);
        break;
      }
      default: {
        response = `HTTP/1.1 404 Not Found\r\n\r\n`;
        writeResponse(response);
        break;
      }
    }
    socket.end();
  })
});

server.listen(4221, "localhost");
