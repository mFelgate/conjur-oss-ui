import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [selectedType, setSelectedType] = useState(
    () => searchParams.get("kind") ?? "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [count, setCount] = useState(0);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function handleTypeChange(event) {
    setSelectedType(event.target.value);
    setPage(0);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadResources() {
      setLoading(true);
      setError("");

      try {
        const response = await resourcesService.list({
          kind: selectedType || undefined,
          search: searchTerm || undefined,
          offset: page * rowsPerPage,
          limit: rowsPerPage,
        });

        const countRespons = await resourcesService.list({
          kind: selectedType || undefined,
          search: searchTerm || undefined,
          count: true,
        });

        if (isMounted) {
          setResources(response);
          setCount(countRespons.count);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load resources.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      isMounted = false;
    };
  }, [selectedType, searchTerm, page, rowsPerPage]);

  return (
    <Box sx={{ width: "100%" }}>
      <Container>
        <Stack sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Resources
          </Typography>

          <Typography variant="body1">
            Browse and manage all resources in your Conjur instance.
          </Typography>
        </Stack>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <TextField
              label="Search resources"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type id or kind"
              fullWidth
            />

            <Select
              value={selectedType || ""}
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
              variant="contained"
              onClick={() => setSearchTerm(searchInput)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Search
            </Button>
          </Stack>

          {loading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Loading resources...</Typography>
            </Stack>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && resources?.length === 0 && (
            <Alert severity="info">No resources returned by API.</Alert>
          )}

          {!loading && !error && resources?.length > 0 && (
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
