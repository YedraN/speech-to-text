import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determinar el formato disponible
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = sendAudioToServer;

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      alert("No se puede acceder al microfono.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendAudioToServer = async () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "grabacion.webm");

    setTranscript("Transcribiendo...");

    try {
      const response = await axios.post(
        "http://localhost:5000/transcribe",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTranscript(response.data.text || "(sin texto)");
    } catch (error) {
      console.error(error);
      setTranscript("Error al transcribir audio");
    }
  };

  return (
    <>
      <div
        style={{
          textAlign: "center",
          marginTop: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Transcriptor de Voz con IA</h1>
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            backgroundColor: recording ? "red" : "green",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {recording ? "Detener" : "Grabar"}
        </button>

        <div style={{ marginTop: "30px" }}>
          <h3>Texto transcrito:</h3>
          <p
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "80%",
              margin: "10px auto",
              borderRadius: "8px",
              minHeight: "100px",
              textAlign: "left",
            }}
          >
            {transcript}
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
