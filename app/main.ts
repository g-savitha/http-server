import { readFileSync, writeFileSync } from "fs";
import * as net from "net";
import * as pathModule from "path";
import { gzipSync } from "zlib";

type HttpRequest = {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
}

type HttpResponse = {
  statusCode: number;
  statusText: String;
  headers: Record<string, string>;
  body: string | Buffer;
}

const parseRequest = (data: Buffer): HttpRequest => {
  const [requestLine, ...headerLines] = data.toString().split("\r\n");
  const [method, path] = requestLine.split(" ");
  const [body] = headerLines.splice(headerLines.length - 1);

  const headers: Record<string, string> = {};
  headerLines.forEach(line => {
    const [key, value] = line.split(": ");
    if (key && value) {
      headers[key] = value;
    }
  });
  return { method, path, headers, body };
}
const createResponse = (response: HttpResponse): Buffer => {
  const { statusCode, statusText, headers, body } = response;
  let headerString = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;

  Object.entries(headers).forEach(([key, value]) => {
    headerString += `${key}: ${value}\r\n`
  });

  headerString += `\r\n`;

  const headerBuffer = Buffer.from(headerString);
  const bodyBuffer = typeof body === 'string' ? Buffer.from(body) : body;

  return Buffer.concat([headerBuffer, bodyBuffer || Buffer.alloc(0)])
}

const handleEchoRequest = (path: string, headers: Record<string, string>): HttpResponse => {
  const echoText = path.split('/')[2];
  const baseHeaders = {
    'Content-Type': 'text/plain',
  }

  const acceptEncoding = headers['Accept-Encoding'];
  const hasGzipEncoding = acceptEncoding === 'gzip' || acceptEncoding?.split(',').map(enc => enc.trim()).includes('gzip');

  if (hasGzipEncoding) {
    const textBuffer = Buffer.from(echoText, 'utf8');
    const compressedBody = gzipSync(textBuffer);
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Encoding': 'gzip',
        ...baseHeaders,
        'Content-Length': compressedBody.length.toString(),
      },
      body: compressedBody
    }
  }
  return {
    statusCode: 200,
    statusText: 'OK',
    headers: {
      ...baseHeaders,
      'Content-Length': echoText.length.toString()
    },
    body: echoText
  };
}

const handleUserAgentRequest = (headers: Record<string, string>): HttpResponse => {
  const userAgent = headers['User-Agent'];
  return {
    statusCode: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': userAgent.length.toString()
    },
    body: userAgent
  };
}

const handleFilesRequest = (request: HttpRequest, directory: string): HttpResponse => {
  const fileName = request.path.split('/')[2];
  const filePath = pathModule.join(directory, fileName);

  if (request.method === 'POST') {
    writeFileSync(filePath, request.body);
    return {
      statusCode: 201,
      statusText: 'Created',
      headers: {},
      body: ''
    };
  }
  try {
    const fileContent = readFileSync(filePath);
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.length.toString()
      },
      body: fileContent
    }

  }
  catch (error) {
    return {
      statusCode: 404,
      statusText: 'Not Found',
      headers: {},
      body: ''
    };
  }
}

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = parseRequest(data);
    let response: HttpResponse;

    const route = request.path.split('/')[1];
    switch (route) {
      case '':
        response = { statusCode: 200, statusText: 'OK', headers: {}, body: '' };
        break;
      case 'echo':
        response = handleEchoRequest(request.path, request.headers);
        break;
      case 'user-agent':
        response = handleUserAgentRequest(request.headers);
        break;
      case 'files':
        const [_, directory] = process.argv.slice(2);
        response = handleFilesRequest(request, directory);
        break;
      default:
        response = { statusCode: 404, statusText: 'Not Found', headers: {}, body: '' }
    }

    socket.write(createResponse(response));
    socket.end();

  })
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
