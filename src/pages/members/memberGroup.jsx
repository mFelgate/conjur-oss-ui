import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { membershipsService } from "../../services";

function AddMember({ serviceId, onMemberAdded }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [editedValue, setEditedValue] = useState("");

  const startEdit = async () => {
    setEditing(true);
    setEditedValue("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditedValue("");
    setError("");
  };

  const addMember = async (serviceId) => {
    try {
      await membershipsService.addMember(
        "group",
        serviceId,
        editedValue,
      );

      cancelEdit();
      setError("");
      onMemberAdded();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add member.",
      );
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          width: "100%",
          mb: 2,
        }}
      >
        {!editing ? (
          <Button startIcon={<AddIcon />} onClick={startEdit}>
            Add Member
          </Button>
        ) : (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={() => addMember(serviceId)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Save
            </Button>

            <Button
              startIcon={<CloseIcon />}
              onClick={cancelEdit}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </Box>
      {editing ? (
        <TextField
          fullWidth
          multiline
          minRows={1}
          value={editedValue}
          placeholder="Example: conjur:user:alice"
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
        <Typography variant="body2" color="text.secondary">
          Add a member to this group.
        </Typography>
      )}
    </Stack>
  );
}

export default function MembershipGroups({ serviceId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  async function handleDeleteMember(member) {
    try {
      await membershipsService.removeMember("group", `${serviceId}`, member);
      loadMembers(serviceId, true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Update failed.");
    }
  }

  async function loadMembers(serviceId, isMounted) {
    setLoading(true);
    setError("");

    try {
      const response = await membershipsService.listMembers(
        "group",
        `${serviceId}`,
      );
      if (isMounted) {
        setMembers(response);
      }
    } catch (requestError) {
      if (isMounted) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load members.",
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let isMounted = true;

    loadMembers(serviceId, isMounted);

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  return (
    <>
      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && members?.length == 0 && (
        <Alert severity="info">No members found.</Alert>
      )}

      {members && members?.length > 0 && (
        <Stack spacing={1.5}>
          {members.map((member) => (
            <Stack
              key={member.member}
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {member.member}
              </Typography>
              <Tooltip title="Remove member">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteMember(member.member)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}

      {!loading && !error && (
        <AddMember
          serviceId={serviceId}
          onMemberAdded={() => loadMembers(serviceId, true)}
        />
      )}
    </>
  );
}
