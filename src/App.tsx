import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { Topbar } from "./features/Topbar";
import { useAppDispatch, useAppSelector, useInterval } from "./store/hooks";
import { Alert } from "./components/Alert";
import {
  selectWallet,
  setWalletByProvider,
  updateWalletUtxosThunk,
  setWalletFeeAddress,
} from "./store/slices/walletSlice";
import { useContext, useEffect } from "react";
import { Cardano } from "lucid-cardano";

import { initCardanoDAppConnectorBridge } from "./scripts/cardano-dapp-connector-bridge.js";
import { WebsocketContext } from "./websocket";
import { DappHubLayout } from "./features/dAppHub/layout";
import { OADADashboard } from "./features/dAppHub/OADA/Dashboard";
import { OADAMSE } from "./features/dAppHub/OADA/MintStakeEarn";
import { EpochStakeAuctionDashboard } from "./features/dAppHub/EpochStakeAuction/Dashboard";
import { EpochStakeAuctionBid } from "./features/dAppHub/EpochStakeAuction/Bid";

function App() {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(selectWallet);
  const ws = useContext(WebsocketContext);

  // initialize wallet
  useEffect(() => {
    const effName = "AppInitWallet";
    console.log(`${effName} ${new Date().getTime()}`);
    console.log(`${effName} - wallet: ${wallet}`);
    // remove walletStuff (virtual wallet utxo mapping) from local storage on
    // reload because if someone navigates away from page the timeouts that
    // remove stale results in the case of things like rollbacks will never
    // fire. so to be safe remove them on site load
    localStorage.removeItem("walletStuff");
    localStorage.removeItem("virtualWalletUtxoMap");
    const walletProviderName = localStorage.getItem("walletProviderName");
    console.log(`${effName} - walletProviderName: ${walletProviderName}`);
    if (wallet === null && walletProviderName !== null) {
      dispatch(setWalletByProvider({ name: walletProviderName, ws }));
      console.log(`${effName} - setWalletByProvider`);
    }
    initCardanoDAppConnectorBridge(
      async (
        cardanoApi: Cardano[""] & { experimental?: { [key: string]: any } }
      ) => {
        dispatch(setWalletByProvider({ name: cardanoApi.name, ws }));
        console.log(`${effName} - setWalletByProvider`);
        dispatch(setWalletFeeAddress(cardanoApi?.experimental?.feeAddress));
        console.log(`${effName} - setWalletFeeAddress`);
      }
    );
  }, [dispatch, wallet, ws]);

  // initialize wallet utxos
  useEffect(() => {
    const effName = "AppInitWalletUtxos";
    console.log(`${effName} ${new Date().getTime()}`);
    console.log(`${effName} - wallet: ${wallet}`);
    if (wallet !== null) {
      dispatch(updateWalletUtxosThunk(null));
      console.log(`${effName} - updateWalletUtxosThunk`);
    }
  }, [wallet, dispatch]);

  // update on interval
  const intervalName = "App";
  useInterval(
    intervalName,
    async () => {
      if (wallet !== null) {
        dispatch(updateWalletUtxosThunk(null));
        console.log(`${intervalName} - updateWalletUtxosThunk`);
      }
    },
    60000,
    [dispatch, wallet]
  );

  return (
    <Router>
      <Topbar />
      <Routes>
        <Route
          path=""
          element={
            <DappHubLayout>
              <Outlet />
            </DappHubLayout>
          }
        >
          <Route index element={<OADADashboard />} />
          <Route path="/dashboard" element={<OADADashboard />} />
          <Route path="dashboard" element={<OADADashboard />} />
          <Route path="oada/mint-stake-earn" element={<OADAMSE />} />
          <Route
            path="epoch-stake-auction/dashboard"
            element={<EpochStakeAuctionDashboard />}
          />
          <Route path="epoch-stake-auction" element={<Outlet />}>
            <Route
              path="bid"
              element={<EpochStakeAuctionBid />}
            />
            <Route
              path="bid/:bidId"
              element={<EpochStakeAuctionBid />}
            />
          </Route>
        </Route>
      </Routes>
      <Alert />
    </Router>
  );
}

export default App;
