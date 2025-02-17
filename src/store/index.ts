import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import {lucidTxBuilder, TxBuilder} from '../tx';
import {lucidWalletApiProvider, WalletApiProvider} from './wallet';
import walletReducer from './slices/walletSlice';
import alertSlice from './slices/alertSlice';
import {Utils} from 'lucid-cardano';
import {lucid} from './hooks';
import { oadaReducer } from 'src/oada/actions';


export type Services = { 
  walletApiProvider: WalletApiProvider,
  txBuilder: TxBuilder,
  lucidUtils: Utils,
}

// so we can type thunkAPI outside of createAsyncThunk
// TODO: in retrospect this is not so useful
export type ThunkAPI = {
  getState: () => RootState,
  dispatch: AppDispatch,
  extra: Services
}

export type GetThunkAPIConfig<ThunkAPI extends { getState: any, dispatch: any, extra: any }> = {
  state: ReturnType<ThunkAPI['getState']>,
  dispatch: ThunkAPI['dispatch'],
  extra: ThunkAPI['extra']
} 

const services: Services = { 
  walletApiProvider: lucidWalletApiProvider,
  txBuilder: lucidTxBuilder,
  lucidUtils: new Utils(lucid)
} 

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

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
