import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// Endpoint para recibir el audio y transcribirlo
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;

    // 1️⃣ Enviamos el archivo a Whisper (STT)
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    console.log("Texto transcrito:", transcription.text);

    // 2️⃣ Respondemos al frontend con el texto
    res.json({ text: transcription.text });
  } catch (error) {
    console.error("Error en /transcribe:", error);
    res.status(500).json({ error: "Error al transcribir el audio" });
  }
});

// Servidor escuchando
app.listen(5000, () => {
  console.log("Servidor backend corriendo en http://localhost:5000");
});