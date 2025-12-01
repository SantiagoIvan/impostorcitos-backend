import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";

// import authRoutes from "./routes/auth.routes";
// import { setupSocket } from "./websockets/socket";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Rutas REST
// app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;

// Creamos un servidor HTTP para conectar Express + WebSockets
const server = http.createServer(app);

// Inicializamos WebSockets
// setupSocket(server);

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
