import { useState } from 'react'
import { createContext, FC, ReactNode } from "react";
import { wsUrl } from './config.local';
import { isJsonRpcNotif } from './JsonRpc';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { isRewardAccounts, setRewardAccounts, selectWallet, sendWalletConnectWsNotif } from './store/slices/walletSlice';

type WebsocketContextType = WebSocket;

export const WebsocketContext = createContext<WebsocketContextType | null>(null);

const WebsocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallet = useAppSelector(selectWallet)
  const url = `${wsUrl}`
  const ws = new WebSocket(url);

  const dispatch = useAppDispatch()
  const [reconnectToggle, setReconnectToggle] = useState<boolean>(false)

  console.log('WebsocketProvider')
  console.log(url)

  console.log('WebsocketAddOpen')
  ws.addEventListener('open', (event) => {
    console.log('WebsocketOpen')
    console.log(event)
    if (wallet !== null) {
      sendWalletConnectWsNotif(ws, wallet.address)
    }
    const timer = setInterval(function() {
      console.log('WebsocketPing')
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping')
      } else {
        clearInterval(timer)
        console.log(`WebsocketPingCleared: ${timer}`)
      }
    }, 30000)
  })
  console.log('WebsocketAddClose')
  ws.addEventListener('close', (event) => {
    console.log('WebsocketClose')
    console.log(event)
    setTimeout(function() {
      setReconnectToggle(!reconnectToggle)
    }, 5000)
  })
  console.log('WebsocketAddError')
  ws.addEventListener('error', (event) => {
    const data = event
    console.log('WebsocketError: ')
    console.log(data)
    setTimeout(function() {
      setReconnectToggle(!reconnectToggle)
    }, 5000)
  })
  console.log('WebsocketAddMessage')
  ws.addEventListener('message', (event) => {
    const data = event.data
    console.log('WebsocketMessage: ')
    console.log(data)
    if (data === 'pong') {
      return;
    }
    const o = JSON.parse(data)
    if (!isJsonRpcNotif('RewardDistsView', isRewardAccounts)(o)) {
      console.error(`WebsocketMessage: not a valid json rpc message: ${data}`)
      return;
    }
    if (o.params !== undefined) {
      dispatch(setRewardAccounts(o.params))
    }
  })

  return (
    <WebsocketContext.Provider value={ws}>{children}</WebsocketContext.Provider>
  )
}

export default WebsocketProvider
