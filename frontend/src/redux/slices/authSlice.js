import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const allUsers = createAsyncThunk(
  "auth/allUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auth/all-users`, {
        withCredentials: true,
      });
      console.log("All users response", response);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const updateJobTitle = createAsyncThunk(
  "/auth/update-job-title",
  async ({ jobTitle }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/update-job-title`,
        { jobTitle },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
});

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/profile/me`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const googleAuth = createAsyncThunk(
  "auth/googleLogin",
  async (credentialResponse, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/google`,
        {
          credential: credentialResponse.credential,
        },
        { withCredentials: true },
      );

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Google Login Failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    allUsers: [],
    isLoading: false,
    isAuthChecked: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Job Title
      .addCase(updateJobTitle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateJobTitle.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateJobTitle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // All Users
      .addCase(allUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(allUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = action.payload.users;
      })
      .addCase(allUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isAuthChecked = true; 
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAuthChecked = true; 
      })
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
