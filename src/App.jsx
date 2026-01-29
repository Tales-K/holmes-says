import React, { useState, useEffect } from "react";
import logo from "../assets/logo.svg";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import {
  CloudUpload,
  Download,
  Language,
  Link as LinkIcon,
  Summarize,
  Delete,
} from "@mui/icons-material";
import { saveAs } from "file-saver";
import { useDropzone } from "react-dropzone";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

const GLASS_STYLE = {
  background: "rgba(40, 40, 60, 0.85)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.22)",
  color: "#f3f3f3",
};

const LOCAL_KEY = "transcriptions";

function App() {
  // Summarize for history items
  const [historySummaries, setHistorySummaries] = useState({});
  const handleSummarizeHistory = async (item) => {
    if (!item.text || !apiKey) return;
    setLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `Resuma o seguinte texto em ${
                language === "pt" ? "português" : "inglês"
              }:\n${item.text}`,
            },
          ],
          max_tokens: 200,
        }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setHistorySummaries((s) => ({
        ...s,
        [item.file]: data.choices?.[0]?.message?.content?.trim() || "",
      }));
    } catch (e) {
      setHistorySummaries((s) => ({ ...s, [item.file]: "Erro ao resumir." }));
    }
    setLoading(false);
  };
  const [showTranscription, setShowTranscription] = useState({});
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("openai_api_key") || ""
  );
  useEffect(() => {
    localStorage.setItem("openai_api_key", apiKey);
  }, [apiKey]);
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("pt");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) setHistory(JSON.parse(saved));
    const savedSummaries = localStorage.getItem("transcription_summaries");
    if (savedSummaries) setHistorySummaries(JSON.parse(savedSummaries));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(history));
      localStorage.setItem(
        "transcription_summaries",
        JSON.stringify(historySummaries)
      );
    } catch (e) {
      // fallback: do nothing
    }
  }, [history, historySummaries]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length) setAudioFile(acceptedFiles[0]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/mp3": [], "audio/ogg": [] },
  });

  const handleTranscribe = async () => {
    if (!apiKey || !audioFile) return;
    // Check for duplicate transcription
    const alreadyTranscribed = history.find((h) => h.file === audioFile.name);
    if (alreadyTranscribed) {
      setTranscription(alreadyTranscribed.text);
      setToast({
        open: true,
        message: "Este áudio já foi transcrito!",
        severity: "warning",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");
      formData.append("language", language === "pt" ? "pt" : "en");
      formData.append("response_format", "text");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );
      if (!response.ok) throw new Error("API error");
      const text = await response.text();
      setTranscription(text);
      setHistory([
        { file: audioFile.name, text, date: new Date().toISOString() },
        ...history,
      ]);
      setToast({
        open: true,
        message: "Transcrição concluída!",
        severity: "success",
      });
    } catch (e) {
      setTranscription("Erro ao transcrever.");
      setToast({
        open: true,
        message: "Erro ao transcrever.",
        severity: "error",
      });
    }
    setLoading(false);
  };
  const handleDeleteTranscription = (fileName) => {
    setHistory(history.filter((h) => h.file !== fileName));
    if (audioFile && audioFile.name === fileName) {
      setTranscription("");
      setSummary("");
    }
    setToast({
      open: true,
      message: "Transcrição removida!",
      severity: "info",
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        minWidth: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
        p: 0,
        m: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          ...GLASS_STYLE,
          width: { xs: "90vw", sm: "80vw", md: "70vw", lg: "60vw" },
          height: { xs: "auto", md: "80vh" },
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: "border-box",
          display: { md: "flex" },
          flexDirection: { md: "row" },
          gap: { md: 4 },
          alignItems: "stretch",
          justifyContent: "center",
          overflowY: { xs: "auto", md: "hidden" },
          mt: 0,
          maxHeight: { xs: "100vh", md: "80vh" },
        }}
      >
        {/* Current transcription side */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: { md: "100%" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <img
              src={logo}
              alt="Holmes Says Logo"
              style={{
                height: 48,
                width: 48,
                borderRadius: 12,
                boxShadow: "0 2px 8px #0002",
              }}
            />
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                color: "#fff",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              Holmes Says
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: "#fff" }}>Idioma</InputLabel>
            <Select
              value={language}
              label="Idioma"
              onChange={(e) => setLanguage(e.target.value)}
              startAdornment={<Language />}
              sx={{
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#646cff" },
              }}
              MenuProps={{
                PaperProps: { sx: { background: "#232526", color: "#fff" } },
              }}
            >
              <MenuItem value="pt">Português (pt-BR)</MenuItem>
              <MenuItem value="en">English (EN)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="OpenAI API Key"
            type="password"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ mb: 2, input: { color: "#fff" }, label: { color: "#fff" } }}
            InputProps={{
              endAdornment: (
                <IconButton
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener"
                  title="Criar API Key"
                >
                  <LinkIcon sx={{ color: "#646cff" }} />
                </IconButton>
              ),
            }}
          />
          <Box
            {...getRootProps()}
            sx={{
              ...GLASS_STYLE,
              border: "2px dashed #646cff",
              p: 3,
              textAlign: "center",
              mb: 2,
              cursor: "pointer",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 40, mb: 1, color: "#646cff" }} />
            <Typography sx={{ color: "#fff" }}>
              {isDragActive
                ? "Solte o arquivo aqui..."
                : audioFile
                ? audioFile.name
                : "Arraste ou clique para selecionar um arquivo MP3/OGG"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: "1rem", md: "1.1rem" },
              color: "#fff",
            }}
            onClick={handleTranscribe}
            disabled={loading || !apiKey || !audioFile}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Transcrever"
            )}
          </Button>
          {transcription && (
            <Paper
              sx={{
                ...GLASS_STYLE,
                p: 2,
                mb: 2,
                color: "#fff",
                flex: "0 0 auto",
              }}
            >
              <Typography variant="h6" sx={{ color: "#fff" }}>
                Transcrição
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", mb: 2, color: "#fff" }}>
                {transcription}
              </Typography>
              {summary && (
                <Typography sx={{ mt: 2, fontStyle: "italic", color: "#fff" }}>
                  {summary}
                </Typography>
              )}
            </Paper>
          )}
          {/* Removed redundant 'Criar API Key OpenAI' button */}
        </Box>
        {/* History side */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            pl: { md: 4 },
            mt: { xs: 3, md: 0 },
            display: "flex",
            flexDirection: "column",
            height: { md: "100%" },
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
            Transcrições anteriores
          </Typography>
          <Box sx={{ flex: 1, overflowY: "auto", mb: 2, minHeight: 0 }}>
            {history.length === 0 && (
              <Typography sx={{ color: "#fff" }}>
                Nenhuma transcrição salva.
              </Typography>
            )}
            {history.map((item, idx) => (
              <Paper
                key={idx}
                sx={{
                  ...GLASS_STYLE,
                  p: 1,
                  mb: 1,
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setShowTranscription((s) => ({
                      ...s,
                      [item.file]: !s[item.file],
                    }))
                  }
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: "#fff" }}
                  >
                    {item.file}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      startIcon={<Download />}
                      onClick={(e) => {
                        e.stopPropagation();
                        const blob = new Blob([item.text], {
                          type: "text/plain;charset=utf-8",
                        });
                        saveAs(blob, `${item.file}.txt`);
                      }}
                      variant="outlined"
                      color="secondary"
                      sx={{ color: "#fff", minWidth: 0, px: 1 }}
                    >
                      Baixar
                    </Button>
                    <Button
                      startIcon={<Summarize />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSummarizeHistory(item);
                      }}
                      variant="outlined"
                      color="info"
                      sx={{ color: "#fff", minWidth: 0, px: 1 }}
                    >
                      Resumir
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTranscription(item.file);
                      }}
                    >
                      <Delete sx={{ color: "red" }} />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: "#fff" }}>
                  {new Date(item.date).toLocaleString(
                    language === "pt" ? "pt-BR" : "en-US"
                  )}
                </Typography>
                {showTranscription[item.file] !== false && (
                  <>
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.9em",
                        color: "#fff",
                      }}
                    >
                      {item.text}
                    </Typography>
                    {historySummaries[item.file] && (
                      <Typography
                        sx={{ mt: 2, fontStyle: "italic", color: "#fff" }}
                      >
                        {historySummaries[item.file]}
                      </Typography>
                    )}
                  </>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
