import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { resourcesService } from "../../services";
import SecretDetails from "../secrets/SecretDetails.jsx";
import GroupDetails from "../members/GroupDetails.jsx";
import PolicyDetails from "../policies/policyDetails.jsx";

export function DetailRow({ label, value }) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export function ResourceInfo({ title, resource }) {
  return (
    <>
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h2">
          {title}
          </Typography>
      <Divider />
    </Stack>

    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6" color="text.secondary">
          Details
        </Typography>
        <DetailRow label="Name" value={resource.id} />
        <DetailRow label="Owner" value={resource.owner} />
        <DetailRow label="Policy" value={resource.policy} />
        <DetailRow label="Created At" value={resource.created_at} />
      </Stack>
    </Paper>

 {resource.annotations.length > 0 && (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6" color="text.secondary">
          Annotations
        </Typography>
        {resource.annotations.map((annotation) => (
          <Stack
            key={annotation.name}
            spacing={1}
            justifyContent="space-between"
          >
           <DetailRow label="Name" value={annotation.name} />
        <DetailRow label="Value" value={annotation.value} />
        <DetailRow label="Policy" value={annotation.policy} />
          </Stack>
        ))}
      </Stack>
    </Paper>)}

 {resource.permissions.length > 0 && (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6" color="text.secondary">
          Permissions
        </Typography>
        {resource.permissions.map((permission) => (
          <Stack
            key={`${permission.role}-${permission.privilege}`}

            direction="row"
            spacing={2}
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              {permission.privilege}
            </Typography>
            <Typography variant="body2">{permission.role}</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>)}
  </>);
}


export default function ResourceDetails() {
  const { serviceId, kind } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadResource() {
      setLoading(true);
      setError("");
      try {
        const resource = await resourcesService.get(kind, serviceId);
        if (isMounted) {
          setResource(resource);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load resource.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadResource();

    return () => {
      isMounted = false;
    };
  }, [serviceId, kind]);

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Stack spacing={3}>
          <Button
            component={Link}
            to={`/resources?kind=${kind}`}
            startIcon={<ArrowBackIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Resources
          </Button>

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading resource...</Typography>
            </Stack>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && resource && (
            <>
            <ResourceInfo title="Resource" resource={resource} />
             { kind === "variable" && <SecretDetails resource={resource} /> }
            </>
          )}

          {!loading && !error && resource && (
            <>
             { kind === "group" && <GroupDetails resource={resource} /> }
            </>
          )}

           {!loading && !error && resource && (
            <>
             { kind === "policy" && <PolicyDetails resource={resource} /> }
            </>
          )}

        </Stack>
      </Container>
    </Box>
  );
}
