import { readFileSync, writeFileSync } from "fs";
import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.on('data', (data) => {
    const [requestLine, ...headers] = data.toString().split("\r\n");
    const [body] = headers.splice(headers.length - 1);
    const [httpMethod, path] = requestLine.split(" ");
    let params = path.split('/')[1];


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
        const userAgent: string = headers[1].split("User-Agent: ")[1];
        console.log("user agent", userAgent)
        response += `Content-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        writeResponse(response);
        break;
      }
      case 'files': {
        const fileName = path.split('/')[2];
        console.log(`fileName : ${fileName}`);
        if (httpMethod !== 'POST') {
          const args = process.argv.slice(2);
          const [_, absPath] = args;
          console.log('args' + args);
          const filePath = absPath + fileName;
          try {
            const fileContent = readFileSync(filePath);
            response += `Content-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`
            writeResponse(response);
          }
          catch (error) {
            response = `HTTP/1.1 404 Not Found\r\n\r\n`;
            writeResponse(response);
          }
        }
        else {
          writeFileSync(fileName, body);
          response = `HTTP/1.1 201 Created\r\n\r\n`;
          writeResponse(response);
        }
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
