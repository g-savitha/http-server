import * as net from "net";
import type { HttpRequest, HttpResponse } from './types'
import { createResponse, parseRequest } from './http'
import { routeRequest } from "./router";



// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = parseRequest(data);
    let response = routeRequest(request);

    socket.write(createResponse(response));
    socket.end();

  })
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
