import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
// import taskReducer from './slices/taskSlice';
// import billingReducer from './slices/billingSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    // tasks: taskReducer,
    // billing: billingReducer,
    ui: uiReducer,
  },
});