import React, { useEffect, useState, useCallback } from "react";
import {useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Avatar,
  Chip,
  CircularProgress,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TablePagination,
} from "@mui/material";
import {
  Add,
  Search,
  Clear,
  Visibility,
  Edit,
  Delete,
  CheckBoxOutlineBlank,
  CheckBox,
  FilterList,
} from "@mui/icons-material";
import { allUsers } from "../redux/slices/authSlice";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const roleOf = (user) => user?.role ?? "user";
const canManage = (role) => role === "admin" || role === "manager";

const STATUS_OPTIONS = ["pending", "in_progress", "completed"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const statusColor = (s) => {
  if (s === "completed") return { bg: "#dcfce7", color: "#16a34a" };
  if (s === "in_progress") return { bg: "#dbeafe", color: "#2563eb" };
  return { bg: "#f1f5f9", color: "#64748b" };
};

const priorityColor = (p) => {
  if (p === "high") return { bg: "#fee2e2", color: "#dc2626" };
  if (p === "medium") return { bg: "#fef9c3", color: "#ca8a04" };
  return { bg: "#f0fdf4", color: "#16a34a" };
};

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

const ChecklistSection = ({ taskId, checklist, onToggle }) => (
  <div style={{ marginTop: 8 }}>
    <p
      style={{
        margin: "0 0 8px",
        fontWeight: 600,
        fontSize: "0.85rem",
        color: "#374151",
      }}
    >
      Your Checklist
    </p>
    {checklist.length === 0 ? (
      <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
        No checklist items
      </p>
    ) : (
      checklist.map((item) => (
        <div
          key={item.id}
          onClick={() => onToggle(taskId, item.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 0",
            cursor: "pointer",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          {item.isCompleted ? (
            <CheckBox sx={{ fontSize: 18, color: "#3b82f6" }} />
          ) : (
            <CheckBoxOutlineBlank sx={{ fontSize: 18, color: "#94a3b8" }} />
          )}
          <span
            style={{
              fontSize: "0.875rem",
              color: item.isCompleted ? "#94a3b8" : "#374151",
              textDecoration: item.isCompleted ? "line-through" : "none",
            }}
          >
            {item.itemName}
          </span>
        </div>
      ))
    )}
  </div>
);

const TaskFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  allUsersList,
  // projectId,
  mode,
}) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: [],
    status: "pending",
    priority: "medium",
    due_date: "",
    checklist_template: [],
  });
  const [checklistInput, setChecklistInput] = useState("");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          title: initialData.title || "",
          description: initialData.description || "",
          assigned_to: initialData.assigned_to || [],
          status: initialData.status || "pending",
          priority: initialData.priority || "medium",
          due_date: initialData.due_date
            ? initialData.due_date.split("T")[0]
            : "",
          checklist_template: [],
        });
      } else {
        setForm({
          title: "",
          description: "",
          assigned_to: [],
          status: "pending",
          priority: "medium",
          due_date: "",
          checklist_template: [],
        });
      }
      setChecklistInput("");
      setUserSearch("");
    }
  }, [open, mode, initialData]);

  const filteredUsers = (allUsersList || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const toggleUser = (id) =>
    setForm((f) => ({
      ...f,
      assigned_to: f.assigned_to.includes(id)
        ? f.assigned_to.filter((u) => u !== id)
        : [...f.assigned_to, id],
    }));

  const addChecklist = () => {
    const item = checklistInput.trim();
    if (!item) return;
    setForm((f) => ({
      ...f,
      checklist_template: [...f.checklist_template, item],
    }));
    setChecklistInput("");
  };

  const removeChecklist = (i) =>
    setForm((f) => ({
      ...f,
      checklist_template: f.checklist_template.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.assigned_to.length)
      return toast.error("Assign at least one user");
    if (!form.priority) return toast.error("Priority is required");
    if (!form.due_date) return toast.error("Due date is required");
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === "edit" ? "Edit Task" : "Create New Task"}
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
          label="Title"
          fullWidth
          size="small"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          size="small"
          multiline
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              label="Priority"
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <TextField
          label="Due Date"
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />

        {/* Assign Users */}
        <div>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Assign Users *
          </p>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            {filteredUsers.map((u) => {
              const uid = u.user_id || u.id;
              const selected = form.assigned_to.includes(uid);
              return (
                <div
                  key={uid}
                  onClick={() => toggleUser(uid)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: selected ? "#eff6ff" : "#fff",
                    borderBottom: "1px solid #f8fafc",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: 12,
                      bgcolor: avatarColor(u.name || ""),
                    }}
                  >
                    {(u.name || "U")[0].toUpperCase()}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {u.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginLeft: 6,
                      }}
                    >
                      {u.email}
                    </span>
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
          {form.assigned_to.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 8,
              }}
            >
              {form.assigned_to.map((id) => {
                const u = (allUsersList || []).find(
                  (u) => (u.user_id || u.id) === id,
                );
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
        </div>

        {/* Checklist (only for create) */}
        {mode !== "edit" && (
          <div>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Checklist Template (optional)
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Add checklist item..."
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChecklist()}
              />
              <button
                onClick={addChecklist}
                style={{
                  padding: "0 14px",
                  borderRadius: 7,
                  border: "none",
                  background: "#3b82f6",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Add
              </button>
            </div>
            {form.checklist_template.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {form.checklist_template.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      background: "#f8fafc",
                      borderRadius: 6,
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => removeChecklist(i)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <button
          onClick={onClose}
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
          onClick={handleSubmit}
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
          {mode === "edit" ? "Save Changes" : "Create Task"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

/* ── Main TaskPage ── */
export default function TaskPage() {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { user, allUsers: users } = useSelector((s) => s.auth);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [checklist, setChecklist] = useState([]);

  const role = roleOf(user);
  const manage = canManage(role);
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);

      // let url;
      let data;
      if (projectId) {
        // Manager/Admin: tasks by project
        const res = await axios.get(
          `${API_URL}/project/${projectId}/tasks?${params}`,
          { withCredentials: true },
        );
        console.log(res);
        data = res.data;
        setTasks(data.data || []);
        setTotal(data.total || 0);
      } else {
        // User: their assigned tasks (filtered)
        params.append("page", page + 1);
        params.append("limit", rowsPerPage);
        const res = await axios.get(`${API_URL}/search/task?${params}`, {
          withCredentials: true,
        });
        data = res.data;
        setTasks(data.tasks || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, page, rowsPerPage]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (manage) dispatch(allUsers());
  }, [dispatch, manage]);

  const handleCreate = async (form) => {
    try {
      await axios.post(`${API_URL}/project/${projectId}/tasks`, form, {
        withCredentials: true,
      });
      toast.success("Task created");
      setFormOpen(false);
      fetchTasks();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdate = async (form) => {
    try {
      await axios.put(
        `${API_URL}/project/${editTask.project_id || projectId}/tasks/${editTask.id}`,
        form,
        { withCredentials: true },
      );
      toast.success("Task updated");
      setEditTask(null);
      fetchTasks();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(
        `${API_URL}/project/${task.project_id || projectId}/tasks/${task.id}`,
        { withCredentials: true },
      );
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const openDetail = async (task) => {
    setDetailTask(task);
    // Fetch checklist for user
    if (!manage) {
      try {
        const res = await axios.get(
          `${API_URL}/project/${task.project_id}/tasks/${task.id}`,
          { withCredentials: true },
        );
        setChecklist(res.data?.data?.checklist || []);
      } catch {
        setChecklist([]);
      }
    }
  };

  const handleToggleChecklist = async (taskId, itemId) => {
    try {
      const res = await axios.patch(
        `${API_URL}/project/${detailTask.project_id}/tasks/${taskId}/checklist/${itemId}`,
        {},
        { withCredentials: true },
      );
      setChecklist((prev) =>
        prev.map((i) => (i.id === itemId ? res.data.item : i)),
      );
    } catch {
      toast.error("Failed to toggle item");
    }
  };

  const displayedTasks = projectId
    ? tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : tasks;

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
          marginBottom: 24,
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
            {projectId ? "Project Tasks" : "My Tasks"}
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            {total} tasks total
          </p>
        </div>
        {manage && projectId && (
          <button
            onClick={() => setFormOpen(true)}
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
            <Add sx={{ fontSize: 18 }} /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FilterList sx={{ color: "#64748b", fontSize: 20 }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace("_", " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority}
            label="Priority"
            onChange={(e) => {
              setFilters({ ...filters, priority: e.target.value });
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {PRIORITY_OPTIONS.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {(filters.status || filters.priority) && (
          <button
            onClick={() => setFilters({ status: "", priority: "" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 12px",
              borderRadius: 7,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            <Clear sx={{ fontSize: 15 }} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 60 }}
          >
            <CircularProgress />
          </div>
        ) : tasks.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "56px 0", color: "#64748b" }}
          >
            No tasks found
          </div>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "#f8fafc" }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.8rem",
                      }}
                    >
                      TITLE
                    </TableCell>
                    {!projectId && (
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "0.8rem",
                        }}
                      >
                        PROJECT
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.8rem",
                      }}
                    >
                      STATUS
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.8rem",
                      }}
                    >
                      PRIORITY
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.8rem",
                      }}
                    >
                      DUE DATE
                    </TableCell>
                    {manage && (
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "0.8rem",
                        }}
                      >
                        OVERDUE
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.8rem",
                      }}
                      align="right"
                    >
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedTasks.map((task) => {
                    const sc = statusColor(task.status);
                    const pc = priorityColor(task.priority);
                    return (
                      <TableRow key={task.id} hover>
                        <TableCell>
                          <div
                            style={{
                              fontWeight: 500,
                              color: "#0f172a",
                              fontSize: "0.9rem",
                            }}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "#64748b",
                                marginTop: 2,
                              }}
                            >
                              {task.description.substring(0, 60)}
                              {task.description.length > 60 ? "…" : ""}
                            </div>
                          )}
                        </TableCell>
                        {!projectId && (
                          <TableCell>
                            <Chip
                              label={task.project?.title || "—"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: "0.78rem",
                              fontWeight: 500,
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: "0.78rem",
                              fontWeight: 500,
                              background: pc.bg,
                              color: pc.color,
                            }}
                          >
                            {task.priority}
                          </span>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.85rem", color: "#374151" }}
                        >
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        {manage && (
                          <TableCell>
                            {task.isOverDue ? (
                              <span
                                style={{
                                  color: "#dc2626",
                                  fontSize: "0.8rem",
                                  fontWeight: 500,
                                }}
                              >
                                Overdue
                              </span>
                            ) : (
                              <span
                                style={{ color: "#16a34a", fontSize: "0.8rem" }}
                              >
                                On track
                              </span>
                            )}
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => openDetail(task)}
                              style={{
                                padding: "5px 8px",
                                borderRadius: 6,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Visibility
                                sx={{ fontSize: 15, color: "#64748b" }}
                              />
                            </button>
                            {manage && (
                              <>
                                <button
                                  onClick={() => setEditTask(task)}
                                  style={{
                                    padding: "5px 8px",
                                    borderRadius: 6,
                                    border: "1px solid #e2e8f0",
                                    background: "#fff",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Edit
                                    sx={{ fontSize: 15, color: "#3b82f6" }}
                                  />
                                </button>
                                <button
                                  onClick={() => handleDelete(task)}
                                  style={{
                                    padding: "5px 8px",
                                    borderRadius: 6,
                                    border: "1px solid #fee2e2",
                                    background: "#fff",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Delete
                                    sx={{ fontSize: 15, color: "#dc2626" }}
                                  />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </div>

      {/* Create Task Dialog */}
      {manage && (
        <TaskFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
          allUsersList={users}
          projectId={projectId}
          mode="create"
        />
      )}

      {/* Edit Task Dialog */}
      {manage && (
        <TaskFormDialog
          open={!!editTask}
          onClose={() => setEditTask(null)}
          onSubmit={handleUpdate}
          initialData={editTask}
          allUsersList={users}
          projectId={projectId}
          mode="edit"
        />
      )}

      {/* Detail / Checklist Dialog */}
      <Dialog
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
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
          Task Detail
          <span
            style={{ cursor: "pointer", color: "#94a3b8", fontSize: 20 }}
            onClick={() => setDetailTask(null)}
          >
            ×
          </span>
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {detailTask && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#0f172a",
                  }}
                >
                  {detailTask.title}
                </p>
                {detailTask.description && (
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#64748b",
                      fontSize: "0.875rem",
                    }}
                  >
                    {detailTask.description}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(() => {
                  const sc = statusColor(detailTask.status);
                  return (
                    <span
                      style={{
                        padding: "3px 12px",
                        borderRadius: 20,
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        background: sc.bg,
                        color: sc.color,
                      }}
                    >
                      {detailTask.status.replace("_", " ")}
                    </span>
                  );
                })()}
                {(() => {
                  const pc = priorityColor(detailTask.priority);
                  return (
                    <span
                      style={{
                        padding: "3px 12px",
                        borderRadius: 20,
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        background: pc.bg,
                        color: pc.color,
                      }}
                    >
                      {detailTask.priority}
                    </span>
                  );
                })()}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#374151" }}>
                <b>Due:</b>{" "}
                {detailTask.due_date
                  ? new Date(detailTask.due_date).toLocaleDateString()
                  : "—"}
              </div>
              {!manage && (
                <ChecklistSection
                  taskId={detailTask.id}
                  checklist={checklist}
                  onToggle={handleToggleChecklist}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
