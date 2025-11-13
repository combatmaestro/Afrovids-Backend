import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const PORT = process.env.PORT || 5001;

// Create HTTP server from Express app
const server = http.createServer(app);

// ✅ Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://afro-vids.vercel.app","https://afro-vids-frontend.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Map to track connected clients (frontend users)
const clients = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("register", (clientId) => {
    clients.set(clientId, socket.id);
    console.log(`🆔 Registered client: ${clientId} -> ${socket.id}`);
  });

  socket.on("disconnect", () => {
    const entry = [...clients.entries()].find(([_, id]) => id === socket.id);
    if (entry) clients.delete(entry[0]);
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Make `io` and `clients` accessible inside route handlers or controllers
app.set("io", io);
// app.set("clients", clients);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running locally at http://localhost:${PORT}`);
});
