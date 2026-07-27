import { useState, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Typography,
} from "@mui/material";
import Editor from "@monaco-editor/react";
import { configureMonacoYaml } from "monaco-yaml";
import { policyService } from "../../services/policyService";
import { ResourceInfo, DetailRow } from "../resources/resourceDetails.jsx";
import PolicyResourceInfo from "./policyinfo.jsx";
import PolicyUpdates from "./policyUpdates.jsx";

export default function PolicyLoad() {
  const [policyText, setPolicyText] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [policyResponse, setPolicyResponse] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const [createdItems, setCreatedItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [updatedItems, setUpdatedItems] = useState([]);
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

  const handleUpdate = (value) => {
    clearErrors;
    setPolicyText(value ?? "");
  };

  const showErrors = (errors) => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const errorDecorations = errors.response?.errors.map((error) => ({
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

    const markers = errors.response?.errors.map((error) => ({
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
        setUpdatedItems(response.data.updated?.items ?? []);
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
            onChange={(event) => setBranch(event.target.value)}
            placeholder="Type branch name"
            fullWidth
          />

          <Alert severity="info">
            Paste a Conjur policy below. Enable Dry Run to validate the policy
            before applying it.
          </Alert>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
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
                onChange={(value) => setPolicyText(value ?? "")}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !policyText.trim()}
                >
                  {dryRun ? "Run Validation" : "Load Policy"}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {!error && policyResponse && responseStatus == "200" && (
            <Stack spacing={2}>
              {!createdItems ||
                (createdItems.length != 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Resource to Be Created
                    </Typography>
                    <Stack spacing={1}>
                      {createdItems.map((resource) => (
                        <Paper
                          key={resource.id}
                          variant="outlined"
                          sx={{ p: 2 }}
                        >
                          <PolicyResourceInfo
                            key={resource.id}
                            title="Created Resource"
                            resource={resource}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </>
                ))}

              {!deletedItems ||
                (deletedItems.length != 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Resource to Be Deleted
                    </Typography>
                    <Stack spacing={1}>
                      {deletedItems.map((resource) => (
                        <Paper
                          key={resource.id}
                          variant="outlined"
                          sx={{ p: 2 }}
                        >
                          <PolicyResourceInfo
                            key={resource.id}
                            title="Deleted Resource"
                            resource={resource}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </>
                ))}

              <Typography variant="h6" sx={{ mt: 1 }}>
                Resource To Be Updated
              </Typography>
              <PolicyUpdates UpdatedResources={policyResponse.updated} />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
