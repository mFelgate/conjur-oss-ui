import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Editor from "@monaco-editor/react";
import { policyService } from "../../services/policyService";
import PolicyCreated from "./policyCreated.jsx";
import PolicyDeleted from "./policyDeleted.jsx";
import PolicyUpdates from "./policyUpdates.jsx";

export default function PolicyLoad() {
  const [policyText, setPolicyText] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [policyResponse, setPolicyResponse] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const [createdItems, setCreatedItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [branch, setBranch] = useState("root");
  const [error, setError] = useState("");
  const [method, setMethod] = useState("POST");
  const decorationsRef = useRef([]);

  //  User for the editor instance and monaco instance
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const clearErrors = () => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    monaco.editor.setModelMarkers(model, "dry-run", []);
    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      [],
    );
  };

  const resetPolicyPreview = () => {
    setPolicyResponse(null);
    setResponseStatus(null);
    setCreatedItems([]);
    setDeletedItems([]);
    setError("");
    clearErrors();
  };

  const showErrors = (errors) => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const errorDecorations = (errors.response?.errors ?? []).map((error) => ({
      range: new monaco.Range(error.line, 1, error.line, 1),
      options: {
        isWholeLine: true,
        className: "errorLine",
      },
    }));

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      errorDecorations,
    );

    const markers = (errors.response?.errors ?? []).map((error) => ({
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.column + 1,
      message: error.message,
      severity: monaco.MarkerSeverity.Error,
    }));

    monaco.editor.setModelMarkers(model, "dry-run", markers);
  };

  const handleSubmit = async () => {
    clearErrors();
    setLoading(true);
    setError("");

    try {
      // TODO: Call policyService.loadPolicy(policyText, dryRun)
      const response = await policyService.loadPolicy(
        policyText,
        branch,
        method,
        dryRun,
      );
      setPolicyResponse(response.data);
      setResponseStatus(response.status);

      if (dryRun) {
        setCreatedItems(response.data.created?.items ?? []);
        setDeletedItems(response.data.deleted?.items ?? []);
      }
    } catch (err) {
      if (dryRun) {
        showErrors(err);
      }
      setError(err instanceof Error ? err.message : "Failed to load policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Stack spacing={3}>
          <Typography variant="h4">Load Policy</Typography>

          <TextField
            label="Branch"
            value={branch}
            onChange={(event) => {
              setBranch(event.target.value);
              resetPolicyPreview();
            }}
            placeholder="Type branch name"
            fullWidth
          />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={dryRun}
                      onChange={(e) => {
                        setDryRun(e.target.checked);
                        resetPolicyPreview();
                      }}
                    />
                  }
                  label="Dry Run"
                />
                <ToggleButtonGroup
                  value={method}
                  exclusive
                  onChange={(event, value) => {
                    if (value !== null) {
                      setMethod(value);
                      resetPolicyPreview();
                    }
                  }}
                  aria-label="policy operation"
                >
                  <ToggleButton value="POST">Create</ToggleButton>
                  <ToggleButton value="PATCH">Update</ToggleButton>
                  <ToggleButton value="PUT">Replace</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Editor
                height="600px"
                defaultLanguage="yaml"
                value={policyText}
                onMount={handleEditorDidMount}
                onChange={(value) => {
                  setPolicyText(value ?? "");
                  resetPolicyPreview();
                }}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Stack direction="column" spacing={2} alignItems="flex-start">
                <Button
                  variant="contained"
                  sx={{ alignSelf: "flex-start", width: "fit-content" }}
                  onClick={handleSubmit}
                  disabled={loading || !policyText.trim()}
                >
                  {dryRun ? "Run Validation" : "Load Policy"}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {!error && policyResponse && !dryRun && (
            <Paper>
              <Stack spacing={2} sx={{ p: 2 }}>
                <Typography sx={{ mt: 1 }}>
                  Policy loaded successfully: Version {policyResponse.version}
                </Typography>

                {policyResponse.created_roles && (
                  <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
                    {Object.values(policyResponse.created_roles).map((role) => (
                      <Box key={role.id}>
                        <Typography variant="subtitle1">{role.id}</Typography>

                        <Typography
                          variant="body2"
                          component="code"
                          sx={{ wordBreak: "break-all" }}
                        >
                          API Key: {role.api_key}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {!error && policyResponse && responseStatus === 200 && (
            <Stack spacing={2}>
              <PolicyCreated items={createdItems} />
              <PolicyDeleted items={deletedItems} />
              <PolicyUpdates UpdatedResources={policyResponse.updated} />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
