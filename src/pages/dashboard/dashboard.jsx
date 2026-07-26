// React hooks for local component state and lifecycle side effects.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// MUI UI primitives used to build the page.
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Divider,
  Grid,
} from "@mui/material";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { resourcesService, authenticatorsService } from "../../services";

function ResourceCount({ title, type }) {
  const [resourceCount, setResourceCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Effect runs once on first render (equivalent idea to ngOnInit).
  useEffect(() => {
    // Prevents state updates if component unmounts before request completes.
    let isMounted = true;

    // Async function for data loading.
    async function loadResources() {
      // Request started: set loading true and clear previous error.
      setLoading(true);
      setError("");

      try {
        // Service call returns a Promise.
        // Endpoint can vary by backend/version:
        // - Resource[]
        // - { items: Resource[] }
        // - { resources: Resource[] }
        const response = await resourcesService.list({
          count: true,
          kind: type,
        });

        // Only update state if component still exists.
        if (isMounted) {
          setResourceCount(response);
        }
      } catch (requestError) {
        // Normalize unknown error into a readable string.
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load resources.",
          );
        }
      } finally {
        // Always clear loading after request finishes.
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Execute the async loader.
    loadResources();

    // Cleanup runs on unmount.
    return () => {
      isMounted = false;
    };
  }, [type]);

  return (
    // Outer page spacing wrapper.
    <Paper
      sx={{
        width: {
          xs: "100%",
          sm: 200,
        },
        minHeight: 120,
        p: 2,
      }}
    >
      {!loading && error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6" component="h2" sx={{ p: 2 }}>
        {title}
      </Typography>
      {loading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography variant="body2">Loading resource count...</Typography>
        </Stack>
      )}

      {!loading && !error && (
        <Typography variant="h4" component="p" sx={{ p: 2 }}>
          {resourceCount === 0 ? `No ${title} found.` : `${resourceCount.count}`}
        </Typography>
      )}
    </Paper>
  );
}

function AuthenticatorCount({ type }) {
  const [resourceCount, setResourceCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Effect runs once on first render (equivalent idea to ngOnInit).
  useEffect(() => {
    // Prevents state updates if component unmounts before request completes.
    let isMounted = true;

    // Async function for data loading.
    async function loadResources() {
      // Request started: set loading true and clear previous error.
      setLoading(true);
      setError("");

      try {
        // Service call returns a Promise.
        // Endpoint can vary by backend/version:
        // - Resource[]
        // - { items: Resource[] }
        // - { resources: Resource[] }
        const response = await authenticatorsService.list({
          type: type,
        });

        // Only update state if component still exists.
        if (isMounted) {
          setResourceCount(response.count);
        }
      } catch (requestError) {
        // Normalize unknown error into a readable string.
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load resources.",
          );
        }
      } finally {
        // Always clear loading after request finishes.
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Execute the async loader.
    loadResources();

    // Cleanup runs on unmount.
    return () => {
      isMounted = false;
    };
  }, [type]);

  return (
    // Outer page spacing wrapper.
    <Paper
      sx={{
        width: {
          xs: "100%",
          sm: 200,
        },
        minHeight: 120,
        p: 2,
      }}
    >
      {!loading && error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6" component="h2" sx={{ p: 2 }}>
        {type}
      </Typography>
      {loading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography variant="body2">Loading count...</Typography>
        </Stack>
      )}

      {!loading && !error && (
        <Typography variant="h4" component="p" sx={{ p: 2 }}>
          {`${resourceCount}`}
        </Typography>
      )}
    </Paper>
  );
}


export default function Dashboard() {
  function resourceTypes() {
    return {
      host: "Hosts",
      variable: "Variables",
      policy: "Policies",
      layer: "Layers",
      user: "Users",
      group: "Groups",
      webservice: "Webservices",
    };
  }

    function authenticatorTypes() {
        return {
        OIDC: "oidc",
        LDAP: "ldap",
        GCP: "gcp",
        JWT: "jwt",
        Kubernetes: "k8s",
        AWS: "iam",
        Azure: "azure",
        Certificate: "cert",
        };
    };

  return (
    <Box sx={{ width: "100%" }}>
      <Container>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          The dashboard provides a quick overview of the resources in your
          Conjur instance, including counts of hosts, variables, users, and
          groups.
        </Typography>

        <Box spacing={2} flexWrap="wrap" p={2} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h6" sx={{ mb: 2 }}>
            Resources
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {Object.keys(resourceTypes()).map((key, value) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <ResourceCount title={resourceTypes()[key]} type={key} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box spacing={2} flexWrap="wrap" p={2} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h6" sx={{ mb: 2 }}>
            Authenticators
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1} sx={{ mb: 2 }}>
            {Object.keys(authenticatorTypes()).map((key) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <AuthenticatorCount type={authenticatorTypes()[key]} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}