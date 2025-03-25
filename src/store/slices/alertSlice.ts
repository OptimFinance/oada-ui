/**
 * Alert Slice for Redux Store
 * 
 * This module implements a Redux slice for managing application alerts/notifications.
 * It provides state management for displaying, tracking, and removing alerts throughout
 * the application. Each alert is automatically assigned a unique ID using UUID v4.
 * 
 * Features:
 * - Maintains an array of active alerts
 * - Auto-generates unique IDs for each alert
 * - Supports adding and removing alerts
 * - Type-safe alert management
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { UITypes } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Type alias for alert state, using UITypes.AlertType from the application's type system.
 * Each alert in the state array will conform to this type definition.
 */
export type AlertState = UITypes.AlertType;

/**
 * Initial state for the alert slice.
 * Starts with an empty array of alerts.
 */
const initialState: AlertState[] = [];

/**
 * Alert management slice for Redux store.
 * Provides reducers for adding and removing alerts from the application state.
 */
export const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    /**
     * Adds a new alert to the state.
     * Automatically generates a unique ID for the alert using UUID v4.
     * 
     * @param state - Current alert state array
     * @param action - PayloadAction containing the alert data
     */
    setAlert: (
      state,
      action: PayloadAction<AlertState>
    ) => {
      state.push({
        id: uuidv4(),
        ...action.payload
      })
    },

    /**
     * Removes an alert from the state by its ID.
     * 
     * @param state - Current alert state array
     * @param action - PayloadAction containing the alert ID to remove
     * @returns New state with the specified alert filtered out
     */
    unsetAlert: (state, action: PayloadAction<string>) => {
      return state.filter(alert => alert.id !== action.payload);
    }
  },
});

// Export actions for use in components
export const { setAlert, unsetAlert } = alertSlice.actions;

/**
 * Selector for accessing the alert state from the Redux store.
 * 
 * @param state - Root Redux state
 * @returns Array of current alerts
 */
export const selectAlert = (state: RootState) => state.alert;

export default alertSlice.reducer;
