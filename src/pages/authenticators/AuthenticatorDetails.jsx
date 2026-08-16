import { useEffect, useState, Fragment } from "react";

import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DetailRow } from "../resources/ResourceDetails.jsx";
import { SecretValueField } from "../secrets/SecretDetails.jsx";

import { authenticatorsService } from "../../services";
import MembershipGroups from "../members/memberGroup.jsx";


function MapSecrets({ data, resource_id }) {
  return (
    <>
      {Object.entries(data).map(([key, value]) =>
        key === "identity" ? (
          <MapSecrets key={key} data={value} resource_id={resource_id} />
        ) : (
          <Fragment key={key}>
            <Typography variant="h6" component="h2">
              {key}
            </Typography>
            <SecretValueField
              resource={{
                id: `account:variable:${resource_id}/${key.replaceAll("_", "-")}`,
              }}
            />
          </Fragment>
        )
      )}
    </>
  );
}

export default function AuthenticatorDetails() {
  const { type, name } = useParams();
  const [authenticator, setAuthenticator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const resource_id = `conjur/authn-${type}/${name}`;

  useEffect(() => {
    let isMounted = true;

    async function loadAuthenticator() {
      setLoading(true);
      setError("");

      try {
        const response = await authenticatorsService.get(type, name);

        if (isMounted) {
          setAuthenticator(response);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load authenticator.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAuthenticator();

    return () => {
      isMounted = false;
    };
  }, [type, name]);

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Stack spacing={3}>
          <Button
            component={Link}
            to="/authenticators"
            startIcon={<ArrowBackIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Authenticators
          </Button>

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading authenticator...</Typography>
            </Stack>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && authenticator && (
            <>
              <Stack spacing={0.5}>
                <Typography variant="h4" component="h1">
                  {authenticator.name}
                </Typography>
              </Stack>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <DetailRow label="Type" value={authenticator.type} />
                  <DetailRow
                    label="Enabled"
                    value={authenticator.enabled ? "Yes" : "No"}
                  />
                  <DetailRow
                    label="Branch"
                    value={authenticator.branch ?? ""}
                  />
                  <DetailRow
                    label="Owner"
                    value={authenticator.owner?.id ?? ""}
                  />
                </Stack>
              </Paper>

              <Stack spacing={1.5}>
                {authenticator.data &&
                Object.entries(authenticator.data)?.length > 0 ? (
                    <MapSecrets data={authenticator.data} resource_id={resource_id} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No config returned.
                  </Typography>
                )}
              </Stack>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" component="h2">
                    Members
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Apps
                  </Typography>

                  <MembershipGroups serviceId={`${resource_id}/apps`} />
                  <Typography variant="body1" color="text.secondary">
                    Operators
                  </Typography>

                  <MembershipGroups serviceId={`${resource_id}/operators`} />
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
