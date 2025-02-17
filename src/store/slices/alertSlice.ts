import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { UITypes } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export type AlertState = UITypes.AlertType;

const initialState: AlertState[] = [];

export const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    setAlert: (
      state,
      action: PayloadAction<AlertState>
    ) => {
      state.push({
        id: uuidv4(),
        ...action.payload
      })
    },
    unsetAlert: (state, action: PayloadAction<string>) => {
      return state.filter(alert => alert.id !== action.payload);
    }
  },
});

export const { setAlert, unsetAlert } = alertSlice.actions;
export const selectAlert = (state: RootState) => state.alert;

export default alertSlice.reducer;
