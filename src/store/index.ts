/**
 * Redux Store Configuration and Type Definitions
 * 
 * This module serves as the central configuration point for the Redux store,
 * defining the root state, services, and middleware setup. It provides:
 * 
 * 1. Store configuration with reducers and middleware
 * 2. Service injection for wallet, transaction, and utility functions
 * 3. Type definitions for the store, dispatch, and thunk actions
 * 4. Integration with Cardano blockchain services
 */

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import {lucidTxBuilder, TxBuilder} from '../tx';
import {lucidWalletApiProvider, WalletApiProvider} from './wallet';
import walletReducer from './slices/walletSlice';
import alertSlice from './slices/alertSlice';
import {Utils} from 'lucid-cardano';
import {lucid} from './hooks';
import { oadaReducer } from 'src/oada/actions';

/**
 * Services interface defining the external dependencies injected into the store
 * These services are made available to thunks through the extra argument
 */
export type Services = { 
  walletApiProvider: WalletApiProvider,  // Provides wallet API access
  txBuilder: TxBuilder,                  // Handles transaction construction
  lucidUtils: Utils,                     // Utility functions from Lucid
}

/**
 * ThunkAPI type definition for use outside createAsyncThunk
 * Provides typing for state, dispatch, and extra services
 */
export type ThunkAPI = {
  getState: () => RootState,
  dispatch: AppDispatch,
  extra: Services
}

/**
 * Helper type for configuring thunk API types
 * Used to ensure consistent typing across async thunks
 */
export type GetThunkAPIConfig<ThunkAPI extends { getState: any, dispatch: any, extra: any }> = {
  state: ReturnType<ThunkAPI['getState']>,
  dispatch: ThunkAPI['dispatch'],
  extra: ThunkAPI['extra']
} 

/**
 * Service instances initialization
 * Creates concrete implementations of the Services interface
 */
const services: Services = { 
  walletApiProvider: lucidWalletApiProvider,
  txBuilder: lucidTxBuilder,
  lucidUtils: new Utils(lucid)
} 

/**
 * Redux store configuration
 * Sets up:
 * - Combined reducers for wallet, OADA actions, and alerts
 * - Thunk middleware with injected services
 * - Default middleware configuration
 */
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    oadaActions: oadaReducer,
    alert: alertSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: { 
      extraArgument: services
    }
  })
});

/**
 * Type definitions for the store
 */

/**
 * Typed dispatch function
 * Use this type whenever you need to type a dispatch function
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Root state type
 * Represents the complete state tree of the application
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type definition for thunk actions
 * Provides proper typing for async actions with the store's state and dispatch
 * 
 * @template ReturnType - The expected return type of the thunk action
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
