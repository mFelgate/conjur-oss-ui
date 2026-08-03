import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { policyService } from "../../services";

export default function PolicyDetails({ resource }) {
  const [loading, setLoading] = useState(true);
  const [effectivePolicy, setEffectivePolicy] = useState(null);
  const [error, setError] = useState("");
  const parts = String(resource.id ?? "").split(":");
  const serviceId = parts[2];

  useEffect(() => {
    let isMounted = true;

    async function loadPolicyResource() {
      setLoading(true);
      setError("");

      try {
        const policy = await policyService.getEffectivePolicy(serviceId);
        setEffectivePolicy(policy);
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load policy.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPolicyResource();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6" component="h2">
              Effective Policy
            </Typography>
            <Alert severity="info">
              The returned YAML statements may not be identical to the YAML
              statements used to create a policy. Additionally, the API has some
              known limitations (You can refer to the official doc's here{" "}
              <a
                href="https://docs.cyberark.com/secrets-manager-sh/latest/en/content/developer/conjur_api_effective_policy.htm?tocpath=Developer%7CSecrets%20Manager%20REST%20APIs%7CREST%C2%A0APIs%7C_____13"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              ). Please save all policy statements used to create a policy in a
              secure location, as they may be needed for future reference.
            </Alert>
            <Typography
              component="pre"
              variant="body2"
              sx={{
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
                m: 0,
              }}
            >
              {effectivePolicy
                ? effectivePolicy.trimStart()
                : "No effective policy available."}
            </Typography>
          </Stack>
        </Paper>

        {resource.policy_versions.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Policy History
            </Typography>

            <Stack spacing={1}>
              {resource.policy_versions.map((policy) => (
                <Accordion key={policy.version} variant="outlined">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Version {policy.version} —{" "}
                      {new Date(policy.created_at).toLocaleString()}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      <Typography
                        component="pre"
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          overflowX: "auto",
                          m: 0,
                        }}
                      >
                        {policy.policy_text.trimStart()}
                      </Typography>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
