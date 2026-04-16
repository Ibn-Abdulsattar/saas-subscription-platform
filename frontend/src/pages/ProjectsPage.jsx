import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchProjects,
  createProject,
  deleteProject,
  updateProject,
  setCurrentProject,
} from "../redux/slices/projectSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  Add,
  MoreVert,
  Delete,
  Edit,
  Visibility,
  PictureAsPdf,
  FolderOpen,
  GroupAdd,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { getAllTeams } from "../redux/slices/teamSlice";

const API_URL = import.meta.env.VITE_API_URL;

const roleOf = (user) => user?.role ?? "user";
const isAdmin = (role) => role === "admin";
const canManage = (role) => role === "admin" || role === "manager";

const avatarColor = (name = "") => {
  const colors = [
    "#4f46e5",
    "#0891b2",
    "#059669",
    "#d97706",
    "#dc2626",
    "#7c3aed",
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

/* ── Project Card ── */
const ProjectCard = ({
  project,
  role,
  onView,
  onEdit,
  onDelete,
  onAssignTeam,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const admin = isAdmin(role);
  const manage = canManage(role);
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Top color bar */}
      <div style={{ height: 4, background: "#3b82f6" }} />

      <div style={{ padding: 20, flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{ flex: 1, cursor: "pointer" }}
            onClick={() => onView(project)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FolderOpen sx={{ fontSize: 18, color: "#3b82f6" }} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {project.title}
              </h3>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.83rem",
                color: "#64748b",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {project.description || "No description provided"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.83rem",
                color: "#64748b",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Deadline: {project.deadline || "Not set"}
            </p>
          </div>
          {(admin || manage) && (
            <button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                color: "#94a3b8",
              }}
            >
              <MoreVert sx={{ fontSize: 18 }} />
            </button>
          )}
        </div>

        {/* PDF Link */}
        {project.pdf && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(project.pdf, "_blank");
            }}
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "#374151",
            }}
          >
            <PictureAsPdf sx={{ fontSize: 15, color: "#dc2626" }} /> View
            Document
          </button>
        )}
      </div>

      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
          {project.createdAt
            ? new Date(project.createdAt).toLocaleDateString()
            : ""}
        </span>
        <button
          onClick={() => onView(project)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            borderRadius: 6,
            border: "none",
            background: "#eff6ff",
            color: "#3b82f6",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Visibility sx={{ fontSize: 14 }} /> Open
        </button>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            onView(project);
            setAnchorEl(null);
          }}
        >
          <Visibility sx={{ fontSize: 16, mr: 1 }} /> View Details
        </MenuItem>
        {admin && (
          <MenuItem
            onClick={() => {
              onEdit(project);
              setAnchorEl(null);
            }}
          >
            <Edit sx={{ fontSize: 16, mr: 1 }} /> Edit Project
          </MenuItem>
        )}
        {(admin || manage) && (
          <MenuItem
            onClick={() => {
              onAssignTeam(project);
              setAnchorEl(null);
            }}
          >
            <GroupAdd sx={{ fontSize: 16, mr: 1 }} /> Assign Team
          </MenuItem>
        )}
        {admin && (
          <MenuItem
            onClick={() => {
              onDelete(project.id);
              setAnchorEl(null);
            }}
            sx={{ color: "#dc2626" }}
          >
            <Delete sx={{ fontSize: 16, mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

/* ── Main ProjectPage ── */
export default function ProjectPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: projects, isLoading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);
  const role = roleOf(user);
  const admin = isAdmin(role);
  const manage = canManage(role);
  const {teams} = useSelector((s) => s.team);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    deadline: "",
    pdfFile: null,
  });
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const fetchTeams = async() => {
    await dispatch(getAllTeams());
    setTeam(teams);
  };

  const handleCreate = async () => {
    if (!newProject.title.trim()) return toast.error("Title is required");
    try {
      const formData = new FormData();
      formData.append("title", newProject.title);
      formData.append("description", newProject.description);
      formData.append("deadline", newProject.deadline);
      if (newProject.pdfFile) formData.append("media", newProject.pdfFile);
      await dispatch(createProject(formData)).unwrap();
      toast.success("Project created successfully");
      setCreateOpen(false);
      setNewProject({
        title: "",
        description: "",
        deadline: "",
        pdfFile: null,
      });
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleEdit = async () => {
    if (!editData.title.trim()) return toast.error("Title is required");
    try {
      await dispatch(
        updateProject({ id: selectedProject.id, data: editData }),
      ).unwrap();
      toast.success("Project updated");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await dispatch(deleteProject(id)).unwrap();
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleAssignTeam = async () => {
    if (!selectedTeamId) return toast.error("Select a team");
    try {
      await axios.post(
        `${API_URL}/project/${selectedProject.id}/assign-team`,
        { teamId: selectedTeamId },
        { withCredentials: true },
      );
      toast.success("Team assigned successfully");
      setAssignOpen(false);
      setSelectedTeamId("");
    } catch {
      toast.error("Failed to assign team");
    }
  };

  const openEdit = (project) => {
    setSelectedProject(project);
    setEditData({
      title: project.title,
      description: project.description || "",
      deadline: project.deadline || "",
    });
    setEditOpen(true);
  };

  const openAssign = async (project) => {
    setSelectedProject(project);
    await fetchTeams();
    setAssignOpen(true);
  };

  const handleView = (project) => {
    dispatch(setCurrentProject(project));
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        padding: "28px 32px",
        maxWidth: 1200,
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
            Projects
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {admin && (
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
            <Add sx={{ fontSize: 18 }} /> New Project
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <CircularProgress />
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            background: "#fff",
            borderRadius: 12,
            border: "1px dashed #cbd5e1",
          }}
        >
          <FolderOpen sx={{ fontSize: 48, color: "#94a3b8" }} />
          <p style={{ color: "#64748b", marginTop: 12 }}>No projects yet</p>
          {admin && (
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
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              role={role}
              onView={handleView}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAssignTeam={openAssign}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      {admin && (
        <Dialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Project</DialogTitle>
          <DialogContent
            sx={{
              pt: "12px !important",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Project Title"
              fullWidth
              size="small"
              required
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newProject.deadline}
              onChange={(e) =>
                setNewProject({ ...newProject, deadline: e.target.value })
              }
            />
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.85rem",
                  color: "#64748b",
                }}
              >
                Project Document (PDF)
              </p>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "#374151",
                  fontSize: "0.875rem",
                }}
              >
                <PictureAsPdf sx={{ fontSize: 18, color: "#dc2626" }} />
                {newProject.pdfFile
                  ? newProject.pdfFile.name
                  : "Upload PDF (optional)"}
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) =>
                    setNewProject({ ...newProject, pdfFile: e.target.files[0] })
                  }
                />
              </label>
            </div>
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
              disabled={!newProject.title.trim()}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                border: "none",
                background: newProject.title.trim() ? "#3b82f6" : "#93c5fd",
                color: "#fff",
                cursor: newProject.title.trim() ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              Create
            </button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Project Dialog */}
      {admin && (
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Project</DialogTitle>
          <DialogContent
            sx={{
              pt: "12px !important",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Project Title"
              fullWidth
              size="small"
              required
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editData.deadline}
              onChange={(e) =>
                setEditData({ ...editData, deadline: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <button
              onClick={() => setEditOpen(false)}
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
              onClick={handleEdit}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Save Changes
            </button>
          </DialogActions>
        </Dialog>
      )}

      {/* Assign Team Dialog */}
      {manage && (
        <Dialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Assign Team — {selectedProject?.title}
          </DialogTitle>
          <DialogContent sx={{ pt: "12px !important" }}>
            {team.length === 0 ? (
              <p
                style={{
                  color: "#64748b",
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                No teams available
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {team.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      border: "1px solid",
                      borderRadius: 8,
                      cursor: "pointer",
                      borderColor:
                        selectedTeamId === team.id ? "#bfdbfe" : "#e2e8f0",
                      background:
                        selectedTeamId === team.id ? "#eff6ff" : "#fff",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        bgcolor: avatarColor(team.name || ""),
                      }}
                    >
                      {(team.name || "T")[0].toUpperCase()}
                    </Avatar>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        {team.name}
                      </div>
                      {team.description && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {team.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <button
              onClick={() => setAssignOpen(false)}
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
              onClick={handleAssignTeam}
              disabled={!selectedTeamId}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                border: "none",
                background: selectedTeamId ? "#3b82f6" : "#93c5fd",
                color: "#fff",
                cursor: selectedTeamId ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              Assign Team
            </button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
