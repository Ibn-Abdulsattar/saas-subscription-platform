import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTeam,
  addMembersToTeam,
  fetchTeamMembers,
  getAllTeams,
} from "../redux/slices/teamSlice";
import { allUsers } from "../redux/slices/authSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Avatar,
  Chip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Groups,
  PersonAdd,
  Search,
  PeopleAlt,
  Close,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const roleOf = (user) => user?.role ?? "user";
const canManage = (role) => role === "admin" || role === "manager";
const avatarColor = (name = "") => {
  const colors = [
    "#4f46e5",
    "#0891b2",
    "#059669",
    "#d97706",
    "#dc2626",
    "#7c3aed",
    "#db2777",
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

const TeamCard = ({ team, currentUser, onAddMembers, onViewMembers }) => {
  const manage = canManage(roleOf(currentUser));
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Groups sx={{ fontSize: 22, color: "#3b82f6" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            {team.name}
          </h3>
          {team.description && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.85rem",
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              {team.description}
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          borderTop: "1px solid #f1f5f9",
          paddingTop: 14,
        }}
      >
        <button
          onClick={() => onViewMembers(team)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#374151",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <PeopleAlt sx={{ fontSize: 15 }} /> Members
        </button>
        {manage && (
          <button
            onClick={() => onAddMembers(team)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <PersonAdd sx={{ fontSize: 15 }} /> Add
          </button>
        )}
      </div>
    </div>
  );
};

export default function TeamPage() {
  const dispatch = useDispatch();
  const { user, allUsers: users } = useSelector((s) => s.auth);
  const { teams, currentTeamMembers, loading } = useSelector((s) => s.team);
  const [createOpen, setCreateOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [viewMembersOpen, setViewMembersOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  const role = roleOf(user);
  const manage = canManage(role);

  useEffect(() => {
    if (manage) dispatch(allUsers());
    dispatch(getAllTeams());
  }, [dispatch, manage]);
  const handleCreate = async () => {
    if (!newTeam.name.trim()) return toast.error("Team name is required");
    try {
      await dispatch(createTeam(newTeam)).unwrap();
      toast.success("Team created successfully");
      setCreateOpen(false);
      setNewTeam({ name: "", description: "" });
    } catch {
      toast.error("Failed to create team");
    }
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length) return toast.error("Select at least one user");
    try {
      await dispatch(
        addMembersToTeam({ teamId: selectedTeam.id, userIds: selectedUsers }),
      ).unwrap();
      toast.success("Members added successfully");
      setAddMembersOpen(false);
      setSelectedUsers([]);
    } catch {
      toast.error("Failed to add members");
    }
  };

  const openViewMembers = async (team) => {
    setSelectedTeam(team);
    await dispatch(fetchTeamMembers(team.id));
    setViewMembersOpen(true);
  };

  const openAddMembers = (team) => {
    setSelectedTeam(team);
    setSelectedUsers([]);
    setSearchUser("");
    setAddMembersOpen(true);
  };

  const toggleUser = (id) =>
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );

  const filteredUsers = (users || []).filter(
    (u) =>
      u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()),
  );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        padding: "28px 32px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Teams
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            {teams.length} team{teams.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {manage && (
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <Add sx={{ fontSize: 18 }} /> New Team
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <CircularProgress />
        </div>
      ) : teams.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            background: "#fff",
            borderRadius: 12,
            border: "1px dashed #cbd5e1",
          }}
        >
          <Groups sx={{ fontSize: 48, color: "#94a3b8" }} />
          <p style={{ color: "#64748b", marginTop: 12 }}>No teams yet</p>
          {manage && (
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                marginTop: 12,
                padding: "9px 22px",
                borderRadius: 8,
                border: "1px solid #3b82f6",
                background: "#fff",
                color: "#3b82f6",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create your first team
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              currentUser={user}
              onAddMembers={openAddMembers}
              onViewMembers={openViewMembers}
            />
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Create New Team
        </DialogTitle>
        <DialogContent
          sx={{
            pt: "12px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Team Name"
            fullWidth
            size="small"
            required
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            size="small"
            value={newTeam.description}
            onChange={(e) =>
              setNewTeam({ ...newTeam, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <button
            onClick={() => setCreateOpen(false)}
            style={{
              padding: "8px 18px",
              borderRadius: 7,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newTeam.name.trim()}
            style={{
              padding: "8px 18px",
              borderRadius: 7,
              border: "none",
              background: newTeam.name.trim() ? "#3b82f6" : "#93c5fd",
              color: "#fff",
              cursor: newTeam.name.trim() ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
          >
            Create Team
          </button>
        </DialogActions>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog
        open={addMembersOpen}
        onClose={() => setAddMembersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
          Add Members — {selectedTeam?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            sx={{ mb: 1.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <div
            style={{
              maxHeight: 320,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {filteredUsers.map((u) => {
              const uid = u.user_id || u.id;
              const selected = selectedUsers.includes(uid);
              return (
                <div
                  key={uid}
                  onClick={() => toggleUser(uid)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: selected ? "#bfdbfe" : "#f1f5f9",
                    background: selected ? "#eff6ff" : "#fff",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: 14,
                      bgcolor: avatarColor(u.name || ""),
                    }}
                  >
                    {(u.name || u.email || "U")[0].toUpperCase()}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {u.username}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {u.email}
                    </div>
                  </div>
                  <Checkbox
                    checked={selected}
                    size="small"
                    sx={{ p: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleUser(uid)}
                  />
                </div>
              );
            })}
          </div>
          {selectedUsers.length > 0 && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {selectedUsers.map((id) => {
                const u = (users || []).find((u) => (u.user_id || u.id) === id);
                return u ? (
                  <Chip
                    key={id}
                    label={u.name}
                    size="small"
                    onDelete={() => toggleUser(id)}
                  />
                ) : null;
              })}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <button
            onClick={() => setAddMembersOpen(false)}
            style={{
              padding: "8px 18px",
              borderRadius: 7,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={!selectedUsers.length}
            style={{
              padding: "8px 18px",
              borderRadius: 7,
              border: "none",
              background: selectedUsers.length ? "#3b82f6" : "#93c5fd",
              color: "#fff",
              cursor: selectedUsers.length ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
          >
            Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
          </button>
        </DialogActions>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog
        open={viewMembersOpen}
        onClose={() => setViewMembersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {selectedTeam?.name} — Members
          <Close
            sx={{ cursor: "pointer", color: "#94a3b8" }}
            onClick={() => setViewMembersOpen(false)}
          />
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {!currentTeamMembers.length ? (
            <p
              style={{
                textAlign: "center",
                color: "#64748b",
                padding: "24px 0",
              }}
            >
              No members yet
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {currentTeamMembers.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 14,
                      bgcolor: avatarColor(m.user.username || ""),
                    }}
                  >
                    {(m.user.username || m.user.email || "U")[0].toUpperCase()}
                  </Avatar>
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {m.user.username}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {m.user.email}
                    </div>
                  </div>
                  <Chip
                    label={m.user.jobTitle || "user"}
                    size="small"
                    sx={{ ml: "auto" }}
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
