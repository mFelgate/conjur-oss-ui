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
  Button,
  Typography,
  Select,
  MenuItem,
  TablePagination,
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

// Service-layer import (Angular-style service pattern).
// The page calls this service; it does not call fetch() directly.
import { resourcesService } from "../../services";

import { useSearchParams } from "react-router-dom";

function ResourceItem({ resource }) {
  const navigate = useNavigate();
  const parts = String(resource.id ?? "").split(":");
  return (
    <TableRow
      key={resource.id}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {parts[2]}
      </TableCell>
      <TableCell align="right">{parts[0]}</TableCell>
      <TableCell align="right">{parts[1]}</TableCell>
      <TableCell align="right">{resource.owner}</TableCell>
      <TableCell align="right">{resource.policy}</TableCell>
      <TableCell align="right">
        <Tooltip title="View resource">
          <IconButton
            aria-label={`View ${resource.id}`}
            size="small"
            onClick={() =>
              navigate(
                `/resources/${encodeURIComponent(parts[1])}/${encodeURIComponent(parts[2])}`,
              )
            }
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    type: searchParams.get("kind") ?? "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [count, setCount] = useState(0);

  // Stores fetched resources from the API.
  const [resources, setResources] = useState([]);

  // Tracks loading state so we can show spinner/feedback.
  const [loading, setLoading] = useState(true);

  // Stores friendly error text when a request fails.
  const [error, setError] = useState("");

  function handleTypeChange(event) {
    setFilters((prev) => ({
      ...prev,
      type: event.target.value,
    }));
    setPage(0);
  }

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
          kind: filters.type || undefined,
          search: filters.search || undefined,
          offset: page * rowsPerPage,
          limit: rowsPerPage,
        });

        const countRespons = await resourcesService.list({
          kind: filters.type || undefined,
          search: filters.search || undefined,
          count: true,
        });

        // Only update state if component still exists.
        if (isMounted) {
          setResources(response);
          setCount(countRespons.count);
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
  }, [filters.type, filters.search, page, rowsPerPage]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      type: searchParams.get("kind") ?? "",
    }));
    setPage(0);
  }, [searchParams]);

  return (
    // Outer page spacing wrapper.
    <Box sx={{ width: "100%" }}>
      {/* Content width container */}
      <Container>
        {/* Page title */}
        <Stack justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Resources
          </Typography>

          {/* <Stack direction="row" spacing={2} flexWrap="wrap" p={1} sx={{ mb: 2 }}>
          <ResourceCount type="host" />
          <ResourceCount type="variable" />
          <ResourceCount type="user" />
          <ResourceCount type="group" />
        </Stack> */}

          <Typography variant="body1">
            Browse and manage all resources in your Conjur instance.
          </Typography>
        </Stack>
        {/* Vertical stack for form + status + list */}
        <Stack spacing={2} sx={{ mt: 3 }}>
          {/* Search field (client-side filter) */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Search resources"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type id or kind"
              fullWidth
            />

            <Select
              value={filters.type || ""}
              onChange={handleTypeChange}
              displayEmpty
            >
              <MenuItem value="">All Resources</MenuItem>
              <MenuItem value="host">Hosts</MenuItem>
              <MenuItem value="variable">Variables</MenuItem>
              <MenuItem value="group">Groups</MenuItem>
              <MenuItem value="user">Users</MenuItem>
              <MenuItem value="webservice">Webservices</MenuItem>
              <MenuItem value="layer">Layers</MenuItem>
              <MenuItem value="policy">Policy</MenuItem>
            </Select>

            <Button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  search: searchInput,
                }))
              }
            >
              Search
            </Button>
          </Stack>

          {/* Loading state UI */}
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading resources...</Typography>
            </Stack>
          )}

          {/* Error state UI */}
          {!loading && error && <Alert severity="error">{error}</Alert>}

          {/* Empty state (no data returned) */}
          {!loading && !error && resources.length === 0 && (
            <Alert severity="info">No resources returned by API.</Alert>
          )}

          {/* Data list */}
          {!loading && !error && resources.length > 0 && (
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
                aria-label="a dense table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Resource</TableCell>
                    <TableCell align="right">Account</TableCell>
                    <TableCell align="right">Kind</TableCell>
                    <TableCell align="right">Owner</TableCell>
                    <TableCell align="right">Policy</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((resource) => (
                    <ResourceItem resource={resource} />
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
