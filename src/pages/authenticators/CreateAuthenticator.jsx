import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import { authenticatorSchemas } from "./authenticatorSchema";
import { authenticatorsService } from "../../services";

function AuthenticatorFields({ schema, data, onChange }) {
  const fields = schema?.forms || [];

  return (
    <>
      {fields.map((field) => (
        <TextField
          key={field.key}
          label={field.label}
          type={field.type === "password" ? "password" : "text"}
          required={field.required}
          multiline={field.type === "textarea"}
          minRows={field.rows}
          value={data[field.key] ?? ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          helperText={field.helperText}
          fullWidth
        />
      ))}
    </>
  );
}
export default function CreateAuthenticator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "OIDC (Conjur UI/Conjur CLI)",
    name: "",
    enabled: true,
    data: {},
    annotations: {},
  });

  const [error, setError] = useState(null);
  function updateData(key, value) {
    setForm((previous) => ({
      ...previous,
      data: {
        ...previous.data,
        [key]: value,
      },
    }));
  }

  async function submit(event) {
    event.preventDefault();

    const payload = {
      type: authenticatorSchemas[form.type].authType,
      name: form.name,
      enabled: form.enabled,
      annotations: form.annotations,
      ...(Object.keys(form.data)?.length > 0 && { data: form.data }),
    };

    try {
      // Split flat "identity.foo" keys into a nested identity object
      const identityPrefix = "identity.";
      const identity = {};
      const flatData = {};

      for (const [key, value] of Object.entries(payload.data ?? {})) {
        if (key.startsWith(identityPrefix)) {
          identity[key.slice(identityPrefix?.length)] = value;
        } else {
          flatData[key] = value;
        }
      }

      if (Object.keys(identity)?.length > 0) {
        flatData.identity = identity;
      }
      payload.data = flatData;
      if (
        payload.type === "jwt" &&
        typeof payload.data.public_keys === "string"
      ) {
        payload.data.public_keys = JSON.parse(payload.data.public_keys);
      }
      const response = await authenticatorsService.create(payload);
      setError(null);

      navigate(`/authenticators/${response.type}/${response.name}`);
    } catch (error) {
      setError(
        error.response?.message ||
          error.body?.message ||
          error.message ||
          "Failed to create authenticator.",
      );
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h5">Create Authenticator</Typography>

        <Select
          value={form.type}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              type: event.target.value,
              data: {},
            }))
          }
        >
          {Object.keys(authenticatorSchemas).map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Name"
          value={form.name}
          required={true}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              name: event.target.value,
            }))
          }
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.enabled}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  enabled: event.target.checked,
                }))
              }
            />
          }
          label="Enabled"
        />

        <AuthenticatorFields
          schema={authenticatorSchemas[form.type]}
          data={form.data}
          onChange={updateData}
        />

        <Button type="submit" variant="contained">
          Create Authenticator
        </Button>
      </Box>
      {error && (
        <Alert color="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}
