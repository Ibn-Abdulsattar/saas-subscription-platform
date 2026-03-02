import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Folder as FolderIcon,
  Task as TaskIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast.warning('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search/global?q=${searchTerm}`, {
        withCredentials: true
      });
      setSearchResults(response.data);
    } catch (error) {
      console.log(error)
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleItemClick = (item) => {
    if (item.type === 'project') {
      navigate(`/projects/${item.id}`);
    } else if (item.type === 'task') {
      navigate(`/projects/${item.projectId}`);
    }
  };

  const getCurrentResults = () => {
    if (!searchResults) return [];
    
    switch (tabValue) {
      case 0:
        return searchResults.all || [];
      case 1:
        return searchResults.projects || [];
      case 2:
        return searchResults.tasks || [];
      default:
        return [];
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'project':
        return <FolderIcon className="text-blue-600" />;
      case 'task':
        return <TaskIcon className="text-green-600" />;
      default:
        return <PersonIcon className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Global Search</h1>

      {/* Search Bar */}
      <Card>
        <CardContent>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search projects, tasks, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searchResults && (
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`All (${searchResults.all?.length || 0})`} />
                <Tab label={`Projects (${searchResults.projects?.length || 0})`} />
                <Tab label={`Tasks (${searchResults.tasks?.length || 0})`} />
              </Tabs>
            </Box>

            <div className="mt-4">
              {getCurrentResults().length === 0 ? (
                <div className="text-center py-8">
                  <Typography color="textSecondary">
                    No results found
                  </Typography>
                </div>
              ) : (
                <List>
                  {getCurrentResults().map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        button
                        onClick={() => handleItemClick(item)}
                        className="hover:bg-gray-50"
                      >
                        <ListItemIcon>
                          {getItemIcon(item.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div className="flex items-center space-x-2">
                              <Typography variant="body1" className="font-medium">
                                {item.title || item.name}
                              </Typography>
                              <Chip
                                label={item.type}
                                size="small"
                                variant="outlined"
                                className="text-xs"
                              />
                            </div>
                          }
                          secondary={
                            <div className="space-y-1">
                              {item.description && (
                                <Typography variant="body2" color="textSecondary">
                                  {item.description}
                                </Typography>
                              )}
                              {item.projectName && (
                                <Typography variant="caption" color="textSecondary">
                                  Project: {item.projectName}
                                </Typography>
                              )}
                              {item.status && (
                                <Chip
                                  label={item.status}
                                  size="small"
                                  className="mt-1"
                                  style={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </div>
                          }
                        />
                      </ListItem>
                      {index < getCurrentResults().length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <Paper className="p-4 bg-gray-50">
        <Typography variant="subtitle2" gutterBottom>
          Search Tips
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • Search for project names, task titles, or descriptions
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • Results are filtered based on your permissions
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • Click on any result to navigate directly
        </Typography>
      </Paper>
    </div>
  );
};

export default SearchPage;