import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Task as TaskIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/activities`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="h2">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}`,
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: `${color}.700` }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.username || user?.email}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Total Projects"
            value={stats?.totalProjects || 0}
            icon={FolderIcon}
            color="blue"
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks || 0}
            icon={TaskIcon}
            color="green"
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Completed Tasks"
            value={stats?.completedTasks || 0}
            icon={TaskIcon}
            color="purple"
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Total Revenue"
            value={stats?.totalRevenu || "Free"}
            icon={MoneyIcon}
            color="orange"
          />
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activity</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell> {activity.entity_type} { activity.action}</TableCell>
                      <TableCell>
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No recent activities
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
