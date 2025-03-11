import http from "http";
/**
 * Get port from environment and store in Express.
 */
import dotenv from "dotenv";
if (process.env.DOTENV_MODE) {
  dotenv.config({
    path: `${process.cwd()}/.env.${process.env.DOTENV_MODE}`,
  });
} else {
  dotenv.config({
    path: `${process.cwd()}/.env`,
  });
}
// 防止dotenv无法读取到环境变量
const app = require("./app").default;

const port = normalizePort(process.env.SERVER_PORT || "3000");
// app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: any; }) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.log(bind + " requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.log(bind + " is already in use");
            process.exit(1);
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    console.log(`bookroom-api server is starting at port ${port}`);
}
