import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  fetchProjects,
  createProject,
  deleteProject,
  setCurrentProject,
} from "../redux/slices/projectSlice";
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
  Grid,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: projects, isLoading } = useSelector((state) => state.projects);

  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    pdfFile: null,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async () => {
    try {
      const formData = new FormData();

      formData.append("title", newProject.title);
      formData.append("description", newProject.description);

      if (newProject.pdfFile) {
        formData.append("media", newProject.pdfFile);
      }

      await dispatch(createProject(formData)).unwrap();
      setOpenDialog(false);
      setNewProject({ title: "", description: "", pdfFile: null });
      toast.success("Project created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create project");
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await dispatch(deleteProject(id)).unwrap();
        toast.success("Project deleted successfully");
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete project");
      }
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleViewProject = (project) => {
    dispatch(setCurrentProject(project));
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          className="btn-primary"
        >
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Typography color="textSecondary" gutterBottom>
              No projects yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              className="mt-4"
            >
              Create your first project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
{projects.map((project) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
      <CardContent className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1" onClick={() => handleViewProject(project)}>
            <Typography variant="h6" gutterBottom>
              {project.title}
            </Typography>
            <Typography color="textSecondary" className="line-clamp-2 mb-3">
              {project.description || "No description"}
            </Typography>

            {/* PDF Link Section */}
            {project.pdf && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<PictureAsPdfIcon sx={{ color: '#d32f2f' }} />}
                onClick={(e) => {
                  e.stopPropagation(); 
                  window.open(project.pdf, "_blank");
                }}
                sx={{ mb: 2, textTransform: 'none' }}
              >
                View Document
              </Button>
            )}

            <div className="mt-4 text-sm text-gray-500">
              Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, project)}>
            <MoreVertIcon />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  </Grid>
))}

        </Grid>
      )}

      {/* Project Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleViewProject(selectedProject);
            handleMenuClose();
          }}
        >
          <EditIcon className="mr-2" fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteProject(selectedProject?.id)}
          className="text-red-600"
        >
          <DeleteIcon className="mr-2" fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Project Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          Create New Project
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              sx={{ pb: 2 }}
              label="Project title"
              fullWidth
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            {/* PDF Upload Field */}
            <div className="flex flex-col space-y-2">
              <Typography variant="caption" color="textSecondary">
                Project Document (PDF)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCameraIcon />}
              >
                {newProject.pdfFile ? newProject.pdfFile.name : "Upload PDF"}
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) =>
                    setNewProject({ ...newProject, pdfFile: e.target.files[0] })
                  }
                />
              </Button>
              {newProject.pdfFile && (
                <Typography variant="caption" color="success.main">
                  Selected: {newProject.pdfFile.name}
                </Typography>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProject.title}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
