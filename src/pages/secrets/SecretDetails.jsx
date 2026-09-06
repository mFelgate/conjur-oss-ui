import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { secretsService } from "../../services";

function formatValue(value) {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return value;
    }
  }

  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? String(value)
    : JSON.stringify(value, null, 2);
}

function AddSecretField({ resource, onSaved }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const parts = String(resource.id ?? "").split(":");
  const serviceId = parts[2];
  const kind = parts[1];
  const canSave = Boolean(kind && serviceId);

  const saveSecret = async () => {
    if (!canSave) {
      setError("Invalid resource id. Expected format: account:kind:id");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await secretsService.set(kind, serviceId, value);
      setSuccess("Secret saved.");
      onSaved?.();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save secret.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Add Secret</Typography>

      <TextField
        fullWidth
        multiline
        minRows={8}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          mt: 2,
          "& textarea": {
            fontFamily: "monospace",
          },
        }}
      />

      <Button sx={{ mt: 2 }} variant="contained" onClick={saveSecret} disabled={saving}>
        Save Secret
      </Button>
      {success && <Alert sx={{ mt: 2 }} severity="success">{success}</Alert>}
      {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
    </Paper>
  );
}

export function SecretValueField({ resource }) {
  const parts = String(resource.id ?? "").split(":");
  const serviceId = parts[2];
  const kind = parts[1];
  const [editing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canSave = Boolean(kind && serviceId);

  const startEdit = async () => {
    if (!canSave) {
      setError("Invalid resource id. Expected format: account:kind:id");
      return;
    }

    setError("");
    setSuccess("");
    setEditing(true);
    const value = await secretsService.get(kind, serviceId);
    setEditedValue(formatValue(value));
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditedValue("");
  };

  const saveSecret = async (serviceId) => {
    if (!canSave) {
      setError("Invalid resource id. Expected format: account:kind:id");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await secretsService.set(kind, serviceId, editedValue);
      setSuccess("Secret updated.");
      cancelEdit();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update secret.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h1">
            Secret
          </Typography>

          {!editing ? (
            <Button startIcon={<EditIcon />} onClick={startEdit}>
              Edit
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => saveSecret(serviceId)}
                disabled={saving}
              >
                Save
              </Button>

              <Button startIcon={<CloseIcon />} onClick={cancelEdit} disabled={saving}>
                Cancel
              </Button>
            </Stack>
          )}
        </Box>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {editing ? (
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={12}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            spellCheck={false}
            sx={{
              "& textarea": {
                fontFamily: "monospace",
                whiteSpace: "pre",
              },
            }}
          />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: "monospace",
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            ************
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function SecretDetails({ resource }) {
  const [hasSecretOverride, setHasSecretOverride] = useState(null);
  const hasSecret =
    hasSecretOverride ??
    (Array.isArray(resource?.secrets) && resource.secrets.length > 0);

  return (
    <Box sx={{ py: 4 }}>
        <Stack spacing={3}>

          {!hasSecret && (
            <>
              <Alert severity="info">Secret not found.</Alert>
              <AddSecretField
                resource={resource}
                onSaved={() => setHasSecretOverride(true)}
              />
            </>
          )}

        {hasSecret && (
            <>
              <SecretValueField resource={resource} />
            </>
          )}
        </Stack>
    </Box>
  );
}
