import express from "express"

//Used to create an HTTP server.
import { createServer } from "http"
//Imports the Server class from Socket.IO. This class creates a WebSocket server.
import { Server } from "socket.io"
//YSocketIO connects Yjs  with Socket.IO.
import { YSocketIO } from "y-socket.io/dist/server"


const app = express()
// Create an HTTP server using the Express app
const httpServer = createServer(app)

// Create a Socket.IO server and allow connections from any origin
const io = new Server(httpServer, {
    cors: {
        origin: "*",           // Allow all origins
        methods: ["GET", "POST"] // Allowed HTTP methods
    }
});

// Create a Yjs Socket.IO server
const ySocketIO = new YSocketIO(io)
// Start Yjs collaboration service
ySocketIO.initialize()

// Test route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "hello world",
        success: true
    })
})

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true
    })
})

// Start the server on port 3000
httpServer.listen(3000, () => {
    console.log("Server is running on port 3000")
})