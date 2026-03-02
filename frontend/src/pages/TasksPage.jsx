import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    projectId: '',
    search: '',
  });
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_URL}/search/task?${params}`, {
        withCredentials: true
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/project`, {
        withCredentials: true
      });
      setProjects(response.data.data);
    } catch (error) {
      console.log(error);
      console.error('Failed to fetch projects');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      projectId: '',
      search: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">All Tasks</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs:12, sm:4}}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
                }}
              />
            </Grid>
            <Grid size={{xs:12, sm:3}}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:3}}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  name="projectId"
                  value={filters.projectId}
                  label="Project"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:2}}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Typography>Loading tasks...</Typography>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <Typography color="textSecondary" gutterBottom>
                No tasks found
              </Typography>
            </div>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} hover>
                        <TableCell>
                          <Typography variant="body2" className="font-medium">
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="caption" color="textSecondary">
                              {task.description.substring(0, 50)}
                              {task.description.length > 50 && '...'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.project?.title || 'Unknown'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status.replace('_', ' ')}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(task.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/projects/${task.project?.id}`)}
                            title="View in project"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={tasks.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;