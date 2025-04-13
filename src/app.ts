import express from "express";
import bodyParser from "body-parser";

import chatRoutes from "@/routes/chat.routes"; // RAG chat routes

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use("/api/rag", chatRoutes);

// app.use("/api/documents", documentRoutes);

// @ts-expect-error This is fine
app.get("/", (req, res) => {
  res.send("Hello World! boy");
});

// Start the server
app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});
