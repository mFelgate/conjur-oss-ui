import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Button,
  Select,
  MenuItem,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { authenticatorsService } from "../../services";
import { ApiError } from "../../services/apiClient";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";


function AuthenticatorItem({ authenticator, handleDeleteAuthenticator, handleToggleAuthenticator }) {
    const navigate = useNavigate();
    return (
      <TableRow
        key={`${authenticator.type}:${authenticator.name}`}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {authenticator.name}
        </TableCell>
        <TableCell align="right">{authenticator.type}</TableCell>
        <TableCell align="right">
          <Tooltip
            title={
              authenticator.staticallyEnabled
                ? "Enabled by Conjur server configuration; disable it in CONJUR_AUTHENTICATORS or conjur.yml."
                : ""
            }
          >
            <span>
              <Switch
                checked={authenticator.enabled}
                disabled={authenticator.staticallyEnabled}
                onChange={(event) => {
                  handleToggleAuthenticator(authenticator, event.target.checked);
                }}
                inputProps={{
                  "aria-label": `Toggle ${authenticator.name}`,
                }}
              />
            </span>
          </Tooltip>
        </TableCell>
        <TableCell align="right">{authenticator.branch ?? ""}</TableCell>
        <TableCell align="right">
          <Tooltip title="View authenticator">
            <IconButton
              aria-label={`View ${authenticator.name}`}
              size="small"
              onClick={() =>
                navigate(
                  `/authenticators/${authenticator.type}/${authenticator.name}`,
                )
              }
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete authenticator">
            <IconButton
              aria-label={`Delete ${authenticator.name}`}
              size="small"
              color="error"
              onClick={() => handleDeleteAuthenticator(authenticator)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  }

export default function Authenticators() {
    const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [count, setCount] = useState(0);
  const [authType, setAuthType] = useState(0);
  const [authenticators, setAuthenticators] = useState([]);

  const [loading, setLoading] = useState(true);
  // Stores friendly error text when a request fails.
  const [error, setError] = useState("");
  // Controlled input value for search text.

  function handleTypeChange(event) {
    setLoading(true);
    setError("");
    setAuthType(event.target.value);
    setPage(0);
  }

  async function handleToggleAuthenticator(authenticator, checked) {
    if (authenticator.staticallyEnabled && !checked) {
      setError(
        "This authenticator is enabled by Conjur server configuration. Disable it in CONJUR_AUTHENTICATORS or conjur.yml.",
      );
      return;
    }
    try {
      const updatedAuthenticator = await authenticatorsService.update(
        checked,
        authenticator.type,
        authenticator.name,
      );

      // A v2 disable cannot override static configuration. Re-read Conjur's
      // effective list so that a successful PATCH is not mistaken for a
      // successful disable.
      const effectiveState = await authenticatorsService.index();
      const identifier = `authn-${authenticator.type}/${authenticator.name}`;
      const remainsEnabled = !checked && effectiveState.enabled?.includes(identifier);

      if (remainsEnabled) {
        setError(
          "Conjur server configuration still enables this authenticator. Disable it in CONJUR_AUTHENTICATORS or conjur.yml.",
        );
      }

      setAuthenticators((currentAuthenticators) =>
        currentAuthenticators.map((currentAuthenticator) =>
          currentAuthenticator.type === authenticator.type &&
          currentAuthenticator.name === authenticator.name
            ? {
                ...updatedAuthenticator,
                enabled: remainsEnabled || updatedAuthenticator.enabled,
                staticallyEnabled: remainsEnabled,
              }
            : currentAuthenticator,
        ),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Update failed.");
    }
  }

  async function handleDeleteAuthenticator(authenticator) {
    try {
      await authenticatorsService.delete(
        authenticator.type,
        authenticator.name,
      );
      setAuthenticators((currentAuthenticators) =>
        currentAuthenticators.filter(
          (currentAuthenticator) =>
            !(
              currentAuthenticator.type === authenticator.type &&
              currentAuthenticator.name === authenticator.name
            ),
        ),
      );
      setCount((currentCount) => Math.max(0, currentCount - 1));

    } catch (error) {
      setError(error instanceof Error ? error.message : "Update failed.");
    }
  }

  // Effect runs once on first render (equivalent idea to ngOnInit).
  useEffect(() => {
    // Prevents state updates if component unmounts before request completes.
    let isMounted = true;
    async function loadAuthenticators() {
      try {
        const [response, effectiveState] = await Promise.all([
          authenticatorsService.list({
            offset: page * rowsPerPage,
            limit: rowsPerPage,
            type: authType || undefined,
          }),
          authenticatorsService.index(),
        ]);

        const staticallyEnabled = new Set(effectiveState.enabled ?? []);
        const authenticatorsWithEffectiveState = response.authenticators.map(
          (authenticator) => {
            const identifier = `authn-${authenticator.type}/${authenticator.name}`;
            const effectivelyEnabled = staticallyEnabled.has(identifier);
            // When v2 says disabled but the effective list says enabled, the
            // authenticator is definitively enabled by static configuration.
            const enabledByStaticConfig =
              !authenticator.enabled && effectivelyEnabled;

            return {
              ...authenticator,
              enabled: authenticator.enabled || effectivelyEnabled,
              staticallyEnabled: enabledByStaticConfig,
            };
          },
        );

        if (isMounted) {
          setAuthenticators(authenticatorsWithEffectiveState);
          setCount(response.count);
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          const compatibilityError =
            requestError instanceof ApiError && requestError.status === 404
              ? "Authenticator management requires Conjur OSS 1.24.0 or later."
              : null;
          setError(
            compatibilityError ?? (requestError instanceof Error
              ? requestError.message
              : "Failed to load authenticators."),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAuthenticators();

    // Cleanup runs on unmount.
    return () => {
      isMounted = false;
    };
  }, [page, rowsPerPage, authType]);

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            Authenticators
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/authenticators/create")}
          >
            Create Authenticator
          </Button>
        </Box>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Select
              value={authType || ""}
              onChange={handleTypeChange}
              displayEmpty
            >
              <MenuItem value="">All Authenticators</MenuItem>
              <MenuItem value="oidc">OIDC</MenuItem>
              <MenuItem value="azure">Azure</MenuItem>
              <MenuItem value="ldap">LDAP</MenuItem>
              <MenuItem value="gcp">GCP</MenuItem>
              <MenuItem value="certificate">Certificate</MenuItem>
              <MenuItem value="jwt">JWT</MenuItem>
              <MenuItem value="k8s">K8s</MenuItem>
            </Select>
          </Stack>
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading authenticators...</Typography>
            </Stack>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && authenticators?.length === 0 && (
            <Alert severity="info">No authenticators returned by API.</Alert>
          )}

          {!loading && !error && authenticators?.length > 0 && (
            <TableContainer component={Paper}>
              <TablePagination
                component="div"
                count={count}
                page={page}
                onPageChange={(event, newPage) => {
                  setLoading(true);
                  setError("");
                  setPage(newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setLoading(true);
                  setError("");
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="authenticators table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Type</TableCell>
                    <TableCell align="right">Enabled</TableCell>
                    <TableCell align="right">Branch</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {authenticators.map((authenticator) => (
                    <AuthenticatorItem
                      key={`${authenticator.type}:${authenticator.name}`}
                      authenticator={authenticator}
                      handleDeleteAuthenticator={handleDeleteAuthenticator}
                      handleToggleAuthenticator={handleToggleAuthenticator}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
