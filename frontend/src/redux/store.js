import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import teamReducer from './slices/teamSlice';
// import billingReducer from './slices/billingSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    team: teamReducer,
    // billing: billingReducer,
    ui: uiReducer,
  },
});