# OADA Open UI

## Running

To run the service locally, simply run the `generateConfig.sh` script, or use
it as a template to create your configuration file at `src/config.local.ts`.
Once the configuration file has been created, you can start the service by
running `npm i && npm start`. Note that due to CORS restrictions, the provided
configuration values will require the service to be hosted on
`http://localhost:3000` as it is by default, or the use of an additional
service such as
[local-cors-proxy](https://www.npmjs.com/package/local-cors-proxy).

## Getting Started for New Developers

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- A Cardano wallet (e.g., [Eternl](https://eternl.io/), [Nami](https://namiwallet.io/), etc.)
- Basic understanding of React, TypeScript, and the Cardano blockchain

### Forking and Installation

1. Fork the repository on GitHub by clicking the "Fork" button at the top right of the repository page
2. Clone your forked repository:
   ```bash
   git clone https://github.com/OptimFinance/oada-ui.git
   cd oada-ui
   ```
3. Install dependencies:
   ```bash
   npm install
   # or if using yarn
   yarn
   ```

### Configuration

1. Create a configuration file by either:

   - Running the configuration script: `./generateConfig.sh`
   - Manually copying the example file: `cp src/config.local.ts.example src/config.local.ts`

2. Modify `src/config.local.ts` with your specific settings:
   - Backend API endpoints
   - Blockchain network configuration
   - Fee addresses and amounts
   - Other environment-specific values

### Development Workflow

1. Start the development server:
   ```bash
   npm start
   # or with yarn
   yarn start
   ```
2. The application will be available at `http://localhost:3000`

3. For API requests that might be affected by CORS, consider using:
   ```bash
   npx local-cors-proxy --proxyUrl="https://your-api-endpoint.com"
   ```

### Building for Production

```bash
npm run build
# or with yarn
yarn build
```

The build artifacts will be located in the `build/` directory.

### Customization Guide

To adapt this codebase for your own DApp:

1. **Token Configuration**:

   - Update token names and references in `/src/oada/actions.ts` and relevant UI components
   - Modify token logic in transaction-related files

2. **UI Customization**:

   - Brand colors and theme are configurable in `tailwind.config.js`
   - Update logos and assets in `/src/assets`
   - Modify component styles as needed

3. **Blockchain Integration**:

   - Update the Cardano network settings in `/src/network.ts`
   - Adjust transaction building in `/src/tx.ts` and `/src/tx-recipe.ts`
   - Configure wallet integration in relevant wallet slice files

4. **Backend Endpoints**:

   - Replace API endpoints in your config file with your own service endpoints

5. **Feature Customization**:
   - The feature-based organization allows for easy addition/removal of features
   - Each feature in `/src/features` can be modified independently

## Codebase Overview

### Project Structure and Technology Stack

This is a React TypeScript application built with the following key technologies:

1. **React** (v18.0.0) - Frontend framework
2. **Redux** (with Redux Toolkit) - State management
3. **React Router** (v6.3.0) - Routing
4. **TypeScript** - Type safety
5. **Tailwind CSS** - Styling (with some custom components)
6. **Radix UI** - UI component primitives
7. **Lucid Cardano** - Cardano blockchain interaction library
8. **Craco** - Configuration override for Create React App

### Application Purpose

This is a DApp (Decentralized Application) interface for OADA (Optimiz Algorithmic Digital Asset) on the Cardano blockchain. The application allows users to:

1. **Connect their Cardano wallet** (via wallet providers like Eternal, Nami, etc.)
2. **Mint OADA tokens** using ADA (Cardano's native currency)
3. **Stake OADA tokens** to earn yield (converting to sOADA)
4. **Unstake sOADA tokens** back to OADA
5. **Participate in Epoch Stake Auctions** - Users can bid to participate in staking epochs
6. **Lock OADA tokens** for OPTIMiz conversion
7. **View dashboard statistics** like TVL (Total Value Locked), yield rates, etc.

### Key Components and Features

#### 1. Wallet Integration

- The app integrates with Cardano wallets through the `cardano-dapp-connector-bridge.js`
- Wallet state is managed in the Redux store via `walletSlice.ts`
- The app periodically refreshes wallet UTXOs (Unspent Transaction Outputs)

#### 2. OADA Token System

- **OADA**: The primary token of the system
- **sOADA**: Staked OADA that earns yield
- **OPTIMiz/OPTIM**: Related tokens for conversion/locking mechanics

#### 3. Main Features

##### Dashboard

- Displays TVL, volume, positions, and yield information
- Shows user positions and staking options
- Visualizes data with charts

##### Mint-Stake-Earn

- Allows users to mint OADA with ADA
- Enables staking OADA to sOADA
- Supports unstaking sOADA back to OADA
- Shows pending transactions in a queue

##### Epoch Stake Auction

- Users can bid for participation in staking epochs
- Variable APY/APR based on bid amount
- Auction mechanics with clearing rates

##### OADA Lock System

- Locking mechanism for OADA to convert to OPTIMiz/OPTIM tokens
- Various lockup options with different rates and durations

#### 4. State Management

The app uses Redux with several slices:

- `walletSlice`: Manages wallet connection and state
- `alertSlice`: Handles application alerts/notifications
- `oadaActions`: Manages OADA-specific functionality

#### 5. Backend Communication

- The app communicates with endpoints defined in `config.local.ts`
- Uses both REST API calls and WebSocket connections for real-time updates
- Interactions with the Cardano blockchain are handled via Lucid library

#### 6. UI Framework

- Combines Tailwind CSS with custom components
- Uses Radix UI primitives for accessible components
- Custom theme and styling system

### Code Organization

The codebase follows a feature-based organization:

- `/src/components`: Reusable UI components
- `/src/features`: Feature-specific components and logic
- `/src/store`: Redux store configuration
- `/src/oada`: OADA-specific logic and API actions
- `/src/utils`: Utility functions
- `/src/types`: TypeScript type definitions

### Integration with Cardano Blockchain

The application uses Lucid Cardano to:

- Read blockchain data
- Submit transactions
- Work with Cardano-specific data types like UTXOs
- Manage wallet connections

### Key User Flows

1. **Minting OADA**:

   - Connect wallet
   - Specify ADA amount
   - Execute mint transaction
   - Receive OADA tokens

2. **Staking Flow**:

   - Connect wallet
   - Select OADA amount to stake
   - Execute stake transaction
   - Receive sOADA tokens

3. **Auction Bidding**:
   - Connect wallet
   - Select bid amount and APY
   - Submit bid transaction
   - Monitor bid status

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**:

   - Ensure you have the wallet extension installed and configured properly
   - Check if the wallet is connected to the correct Cardano network
   - Try refreshing the page or reconnecting the wallet

2. **Transaction Errors**:

   - Verify you have sufficient ADA for transaction fees
   - Check wallet UTXOs for conflicts
   - Ensure correct token amounts are specified

3. **CORS Errors**:
   - Configure and use `local-cors-proxy` for API requests
   - Ensure your config points to the correct proxy URL

### Development Tools

- Use browser developer tools to debug React components and network requests
- Redux DevTools can help inspect the application state
- Check the browser console for error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
