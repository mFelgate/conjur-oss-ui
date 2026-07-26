import { useEffect, useMemo, useState } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import { authenticatorsService } from "../../services";

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
          <Switch
            checked={authenticator.enabled}
            onChange={(event) => {
              handleToggleAuthenticator(authenticator, event.target.checked);
            }}
            inputProps={{
              "aria-label": `Toggle ${authenticator.name}`,
            }}
          />
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
    setAuthType(event.target.value);
    setPage(0);
  }


  async function loadAuthenticators(isMounted) {
      // Request started: set loading true and clear previous error.
      setLoading(true);
      setError("");

      try {
        // Service call returns a Promise.
        // Service normalizes the endpoint's supported response shapes into an array.
        const response = await authenticatorsService.list({
          offset: page * rowsPerPage,
          limit: rowsPerPage,
          type: authType || undefined,
        });

        // Only update state if component still exists.
        if (isMounted) {
          console.log("authenticators response:", response);
          setAuthenticators(response.authenticators);
          setCount(response.count);
        }
      } catch (requestError) {
        // Normalize unknown error into a readable string.
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load authenticators.",
          );
        }
      } finally {
        // Always clear loading after request finishes.
        if (isMounted) {
          setLoading(false);
        }
      }
    }

  async function handleToggleAuthenticator(authenticator, checked) {
    try {
      const updatedAuthenticator = await authenticatorsService.update(
        checked,
        authenticator.type,
        authenticator.name,
      );

      setAuthenticators((currentAuthenticators) =>
        currentAuthenticators.map((currentAuthenticator) =>
          currentAuthenticator.type === authenticator.type &&
          currentAuthenticator.name === authenticator.name
            ? updatedAuthenticator
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
      loadAuthenticators(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Update failed.");
    }
  }

  // Effect runs once on first render (equivalent idea to ngOnInit).
  useEffect(() => {
    // Prevents state updates if component unmounts before request completes.
    let isMounted = true;
    loadAuthenticators(isMounted);

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
              <MenuItem value="cert">Certificate</MenuItem>
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

          {!loading && !error && authenticators.length === 0 && (
            <Alert severity="info">No authenticators returned by API.</Alert>
          )}

          {!loading && !error && authenticators.length > 0 && (
            <TableContainer component={Paper}>
              <TablePagination
                component="div"
                count={count}
                page={page}
                onPageChange={(event, newPage) => {
                  setPage(newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
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
