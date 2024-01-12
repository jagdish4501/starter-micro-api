import http from 'http';
import fs from 'fs';
import https from 'https';
import axios from 'axios';
import { makeApiRequest } from './ApiReq.js';
import compile from './compiler/compiler.js';
const PORT = 5000;

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Connection with cross Origin are enbled' }));
    }
    else if (req.url.match(/\/api\/everything/) && req.method === 'GET') {
        makeApiRequest('everything', req, res);
    } else if (req.url.match(/\/api\/top-headlines/) && req.method === 'GET') {
        makeApiRequest('top-headlines', req, res);
    } else if (req.url.match(/\/api\/compile/) && req.method === 'POST') {
        compile(req, res)
    } else if (req.url.match(/\/api/) && req.method === 'GET') {
        try {
            // Combine the base URL and the request URL
            const url = 'https://52.66.103.125' + req.url;
            console.log(url);
            // Make the GET request to the target server
            const targetResponse = await axios.get(url, {
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                responseType: 'stream', // Ensure the response is treated as a stream
            });

            // Forward the response headers to the client
            res.writeHead(targetResponse.status, targetResponse.headers);

            // Pipe the response from the target server to the client
            targetResponse.data.pipe(res);
        } catch (error) {
            console.error(error);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
    else {
        try {
            fs.readFile('page_404.html', (err, data) => {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            });
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('Something Unexpected Happened');
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});
