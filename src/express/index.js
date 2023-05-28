// express.js

const http = require('http');
const url = require('url');
const { parse: parseQuery } = require('querystring');
const fs = require('fs');

class Express {
    constructor() {
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
            USE: []
        };
    }

    get(path, handler) {
        this.routes.GET[path] = { handler, routePath: path };
    }

    post(path, handler) {
        this.routes.POST[path] = { handler, routePath: path };
    }

    put(path, handler) {
        this.routes.PUT[path] = { handler, routePath: path };
    }

    delete(path, handler) {
        this.routes.DELETE[path] = { handler, routePath: path };
    }

    use(middleware) {
        this.routes.USE.push(middleware);
    }

    handleRequest(req, res) {
        const { pathname, query } = url.parse(req.url, true);
        const method = req.method.toUpperCase();
        const routeHandler = this.routes[method];

        if (routeHandler) {
            // Iterate over the registered routes for the specific HTTP method
            for (const routePath in routeHandler) {
                const { handler } = routeHandler[routePath];
                const pathParams = this.extractPathParams(routePath, pathname);

                if (pathParams !== null) {
                    const body = [];
                    req.on('data', chunk => {
                        body.push(chunk);
                    });

                    req.on('end', () => {
                        let requestBody = Buffer.concat(body).toString();
                        if (req.headers['content-type'] === 'application/json') {
                            requestBody = JSON.parse(requestBody);
                        } else {
                            requestBody = parseQuery(requestBody);
                        }

                        req.body = requestBody;
                        req.params = pathParams;

                        const response = {
                            send: (data) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end(data.toString());
                            },
                            json: (data) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(data));
                            },
                            status: (statusCode) => {
                                return {
                                    json: (data) => {
                                        res.statusCode = statusCode;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.end(JSON.stringify(data));
                                    }
                                };
                            },
                            sendFile: (filePath) => {

                                fs.readFile(filePath, (err, data) => {
                                    if (err) {
                                        res.statusCode = 500;
                                        res.setHeader('Content-Type', 'text/plain');
                                        res.end('Internal Server Error');
                                    } else {
                                        res.statusCode = 200;
                                        res.end(data);
                                    }
                                });
                            }
                        };

                        // Apply middlewares
                        let currentMiddlewareIndex = 0;
                        const executeMiddleware = () => {
                            if (currentMiddlewareIndex < this.routes.USE.length) {
                                const middleware = this.routes.USE[currentMiddlewareIndex];
                                currentMiddlewareIndex++;
                                middleware(req, res, executeMiddleware);
                            } else {
                                handler(req, response);
                            }
                        };

                        executeMiddleware();
                    });

                    return;
                }
            }
        }

        res.statusCode = 404;
        res.end('Not Found');
    }


    extractPathParams(routePath, pathname) {
        const routePathParts = routePath.split('/');
        const pathnameParts = pathname.split('/');
        const pathParams = {};

        for (let i = 0; i < routePathParts.length; i++) {
            const routePart = routePathParts[i];
            const routePartValue = pathnameParts[i];
            if (routePart.startsWith(':')) {
                const paramName = routePart.slice(1);
                pathParams[paramName] = routePartValue;
            } else if (routePart !== routePartValue) {
                // If any part of the route path does not match the corresponding part in the actual pathname, return null
                return null;
            }
        }

        return pathParams;
    }


    start(port) {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
}

module.exports = Express;
