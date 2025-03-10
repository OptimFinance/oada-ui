#!/bin/sh

CARDANO_NETWORK=${CARDANO_NETWORK-"Mainnet"}
OPTIM_SERVER_HOST=${OPTIM_SERVER_HOST-"https://spo-server.optim.finance"}
OADA_ENDPOINTS_URL=${OADA_ENDPOINTS_URL-"https://spo-server.optim.finance/oada"}
WEBSOCKET_URL=${WEBSOCKET_URL-"wss://spo-server.optim.finance"}
OADA_FEE_ADDRESS=${OADA_FEE_ADDRESS-"addr1qxgkpyywkd5cynd04mm97ma7n8rhd4jnc75fuwdqf7xpmqh8ucsr8rpyzewcf9jyf7gmjj052dednasdeznehw7aqc7qtcm7em"}
OADA_MINT_FEE=${OADA_MINT_FEE-"1000000n"}
OADA_STAKE_FEE=${OADA_STAKE_FEE-"2000000n"}

cat > src/config.local.ts <<EOF
import { Network } from 'lucid-cardano'
const cardanoNetwork: Network = '$CARDANO_NETWORK'
const optimServerUrl: string = '$OPTIM_SERVER_HOST'
const oadaEndpointsUrl: string = '$OADA_ENDPOINTS_URL'
const wsUrl: string = '$WEBSOCKET_URL'
const oadaFeeAddress: string = '$OADA_FEE_ADDRESS'
const oadaMintFee: bigint = $OADA_MINT_FEE
const oadaStakeFee: bigint = $OADA_STAKE_FEE

export {
  cardanoNetwork,
  optimServerUrl,
  oadaEndpointsUrl,
  wsUrl,
  oadaFeeAddress,
  oadaMintFee,
  oadaStakeFee
};
EOF
