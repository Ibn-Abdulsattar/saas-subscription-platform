import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Checkbox,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as InProgressIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { fetchTeamMembers } from "../redux/slices/teamSlice";
import { useDispatch, useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_API_URL;

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { currentTeamMembers } = useSelector((s) => s.team);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
    priority: "",
  });

  // Task Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/project/${id}`, { withCredentials: true }),
        axios.get(`${API_URL}/project/${id}/tasks`, { withCredentials: true }),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      taskForm.assigned_to = selectedUsers;
      await axios.post(
        `${API_URL}/project/${id}/tasks`,
        taskForm,
        { withCredentials: true },
      );
      await fetchProjectData()
      setOpenTaskDialog(false);
      resetTaskForm();
      toast.success("Task created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create task");
    }
  };

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

  const handleUpdateTask = async () => {
    try {
      await axios.put(
        `${API_URL}/project/${id}/tasks/${editingTask.id}`,
        taskForm,
        { withCredentials: true },
      );
      await fetchProjectData();
      setOpenTaskDialog(false);
      resetTaskForm();
      toast.success("Task updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${API_URL}/project/${id}/tasks/${taskId}`, {
          withCredentials: true,
        });
        await fetchProjectData();
        toast.success("Task deleted successfully");
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete task");
      }
    }
    handleMenuClose();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/project/${id}/tasks/${taskId}`,
        { status: newStatus },
        { withCredentials: true },
      );
      await fetchProjectData();
      toast.success("Task status updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update task status");
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "pending",
      due_date: "",
      priority: "",
    });
    setEditingTask(null);
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      due_date: task.due_date.split("T")[0],
      priority: task.priority,
    });
    setOpenTaskDialog(true);
    handleMenuClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="text-green-600" />;
      case "in_progress":
        return <InProgressIcon className="text-blue-600" />;
      default:
        return <PendingIcon className="text-gray-400" />;
    }
  };

  const getMemberUser = (option) => option?.user || option;
  const getMemberLabel = (option) => {
    const u = getMemberUser(option);
    return u?.username || u?.name || u?.email || "";
  };
  const getMemberId = (option) =>
    option?.userId || option?.user_id || option?.id || "";

  const handleAddTaskBtn = async (id) => {
    setOpenTaskDialog(true);
    await dispatch(fetchTeamMembers(id));
  };

  const handleEditBtn = async (id) => {
    openEditDialog(selectedTask);
    await dispatch(fetchTeamMembers(id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Typography variant="h6" color="textSecondary">
          Project not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
          className="mt-4"
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <IconButton onClick={() => navigate("/projects")}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {project.title}
          </h1>
          <p className="text-gray-600 mt-1">
            {project.description || "No description"}
          </p>
        </div>
      </div>

      {/* Project Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">{tasks?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" className="text-green-600">
                {tasks.filter((t) => t.status === "completed").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" className="text-orange-600">
                {tasks.filter((t) => t.status !== "completed").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Section */}
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                handleAddTaskBtn(project.teamId);
              }}
              className="btn-primary"
            >
              Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <Typography color="textSecondary" gutterBottom>
                No tasks yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenTaskDialog(true)}
                className="mt-2"
              >
                Create your first task
              </Button>
            </div>
          ) : (
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell sx={{ color: "red" }}>Deadline</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                          }
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span
                            className={
                              task.status === "completed"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{task.description || "-"}</TableCell>
                      <TableCell>
                        {task.assigned_users &&
                        task.assigned_users.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {task.assigned_users.map((user) => (
                              <Chip
                                key={user.user_id}
                                label={user.username}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "red" }}>
                        {task.due_date || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, task)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleEditBtn(project.teamId);
          }}
        >
          <EditIcon className="mr-2" fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteTask(selectedTask?.id)}
          className="text-red-600"
        >
          <DeleteIcon className="mr-2" fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Task Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={() => {
          setOpenTaskDialog(false);
          resetTaskForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-8 pt-4">
            <TextField
              label="Title"
              fullWidth
              variant="outlined"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              required
            />

            <TextField
              sx={{ my: 1 }}
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />

            <div className="flex gap-4">
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskForm.priority}
                  label="Priority"
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, priority: e.target.value })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={taskForm.due_date}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, due_date: e.target.value })
                }
              />
            </div>

            <Autocomplete
              multiple
              options={currentTeamMembers}
              disableCloseOnSelect
              // FIX: data is nested under option.user — extract correctly
              getOptionLabel={(option) => getMemberLabel(option)}
              // FIX: match selected IDs back to option objects
              isOptionEqualToValue={(option, value) =>
                getMemberId(option) === getMemberId(value)
              }
              value={currentTeamMembers.filter((m) =>
                selectedUsers.includes(getMemberId(m)),
              )}
              onChange={(_, newValue) => {
                setSelectedUsers(newValue.map((m) => getMemberId(m)));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign Team Members"
                  placeholder="Select members"
                />
              )}
              renderOption={(props, option, { selected }) => {
                const { ...rest } = props;
                const u = getMemberUser(option);
                const uid = getMemberId(option);
                return (
                  <li key={uid} {...rest}>
                    <Checkbox checked={selected} style={{ marginRight: 8 }} />
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        mr: 1.5,
                        fontSize: 12,
                        bgcolor: avatarColor(u?.username || u?.name || ""),
                      }}
                    >
                      {(u?.username || u?.name || "U")[0].toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {u?.username || u?.name}
                      </span>
                      <span className="text-xs text-gray-500">{u?.email}</span>
                      {u?.jobTitle && (
                        <span className="text-xs text-blue-400">
                          {u.jobTitle}
                        </span>
                      )}
                    </div>
                  </li>
                );
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                  const u = getMemberUser(option);
                  return (
                    <Chip
                      key={getMemberId(option)}
                      size="small"
                      label={u?.username || u?.name || u?.email}
                      avatar={
                        <Avatar
                          sx={{ bgcolor: avatarColor(u?.username || "") }}
                        >
                          {(u?.username || "U")[0].toUpperCase()}
                        </Avatar>
                      }
                      {...getTagProps({ index })}
                    />
                  );
                })
              }
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenTaskDialog(false);
              resetTaskForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingTask ? handleUpdateTask : handleCreateTask}
            variant="contained"
            disabled={!taskForm.title}
          >
            {editingTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectDetailPage;
