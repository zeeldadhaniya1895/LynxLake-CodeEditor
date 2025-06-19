import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Box, Typography, CircularProgress, Button, Alert } from "@mui/material";
import { useParams } from "react-router-dom";

const THEMES = [
  { label: "VS Dark", value: "vs-dark" },
  { label: "VS Light", value: "vs-light" },
  { label: "High Contrast", value: "hc-black" },
];

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "JSON", value: "json" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Markdown", value: "markdown" },
  { label: "Shell", value: "shell" },
];

const DEFAULT_LANGUAGE = "javascript";
const DEFAULT_THEME = "vs-dark";

function ModernCodeEditor({
  value = "",
  language = DEFAULT_LANGUAGE,
  theme = DEFAULT_THEME,
  onChange,
  ...props
}) {
  const { projectId } = useParams();
  const [code, setCode] = useState(value);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Auth-Token': localStorage.getItem('authToken') || '',
    'X-Username': localStorage.getItem('username') || ''
  });

  useEffect(() => {
    setCode(value);
  }, [value]);

  const handleEditorChange = (newValue) => {
    setCode(newValue);
    if (onChange) onChange(newValue);
  };

  // Fetch file content when selectedFile changes
  useEffect(() => {
    if (!props.selectedFile) return;
    setLoading(true);
    setError("");
    setCode("");
    setSaveMsg("");
    fetch(`/api/editor/${projectId}/files/${props.selectedFile.id}/content`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setCode(data.data.file_data || "");
        else setError(data.message || "Failed to load file content");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [props.selectedFile, projectId]);

  // Save file content
  const handleSave = async () => {
    if (!props.selectedFile) return;
    setSaving(true);
    setError("");
    setSaveMsg("");
    try {
      const res = await fetch(`/api/editor/${projectId}/files/${props.selectedFile.id}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ file_data: code })
      });
      const data = await res.json();
      if (data.success) setSaveMsg("Saved!");
      else setError(data.message || "Failed to save file");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 1500);
    }
  };

  if (!props.selectedFile) {
    return (
      <Box sx={{ p: 3, color: "#666", display: "flex", alignItems: "center", height: "100%" }}>
        <Typography variant="h6">Select a file to start editing</Typography>
      </Box>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar for language/theme selection */}
      <div style={{ padding: "8px", background: "#23272f", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ marginRight: 16, fontWeight: 600 }}>Monaco Code Editor</span>
        <label style={{ marginRight: 8 }}>
          Language:
          <select
            value={currentLanguage}
            onChange={e => setCurrentLanguage(e.target.value)}
            style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </label>
        <label style={{ marginRight: 8 }}>
          Theme:
          <select
            value={currentTheme}
            onChange={e => setCurrentTheme(e.target.value)}
            style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
          >
            {THEMES.map(theme => (
              <option key={theme.value} value={theme.value}>{theme.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MonacoEditor
          height="100%"
          width="100%"
          language={currentLanguage}
          theme={currentTheme}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 16,
            minimap: { enabled: true },
            automaticLayout: true,
            autoClosingBrackets: "always",
            formatOnType: true,
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
          }}
          />
      </div>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {saveMsg && <Typography sx={{ color: "green" }}>{saveMsg}</Typography>}
          </Box>
    </div>
  );
}

export default ModernCodeEditor; 