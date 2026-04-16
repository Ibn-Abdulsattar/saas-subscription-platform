import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/teams`;

export const createTeam = createAsyncThunk(
  "team/createTeam",
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, teamData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const addMembersToTeam = createAsyncThunk(
  "team/addMembers",
  async ({ teamId, userIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${teamId}/members`,
        { userIds },
        { withCredentials: true },
      );
      return { teamId, members: response.data.members }; // Return updated info
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchTeamMembers = createAsyncThunk(
  "team/fetchMembers",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${teamId}/members`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAllTeams = createAsyncThunk(
  "team/fetchAllTeams",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/all-teams`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const teamSlice = createSlice({
  name: "team",
  initialState: {
    teams: [],
    currentTeamMembers: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetTeamState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.teams.push(action.payload.data);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Members
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.currentTeamMembers = action.payload.members;
      })
      // Add Members
      .addCase(addMembersToTeam.fulfilled, (state) => {
        state.success = true;
      })
      .addCase(getAllTeams.fulfilled, (state, action) => {
        state.teams = action.payload.teams;
      });
  },
});

export const { resetTeamState } = teamSlice.actions;
export default teamSlice.reducer;
