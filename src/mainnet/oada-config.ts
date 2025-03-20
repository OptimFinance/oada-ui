/**
 * OADA Protocol Configuration for Mainnet
 * 
 * This file contains the core configuration values for the OADA (Open Agriculture Data Alliance)
 * protocol implementation on Cardano mainnet. It defines token policies, identifiers,
 * and financial parameters used throughout the protocol.
 */

import Big from "big.js";

/**
 * Core Protocol Configuration
 * 
 * Contains all essential parameters for the OADA protocol operation including:
 * - Token policy IDs and names for OADA, sOADA (staked OADA), and OPTIMiz tokens
 * - Financial parameters for rate calculations and scaling
 */
export const config = {
  // OADA Token Configuration
  /** Policy ID for the main OADA token on Cardano mainnet */
  oadaPolicyId: "f6099832f9563e4cf59602b3351c3c5a8a7dda2d44575ef69b82cf8d",
  /** Token name for OADA (empty string as it uses policy ID only) */
  oadaTokenName: "",

  // Staked OADA (sOADA) Configuration
  /** Policy ID for the staked OADA token (sOADA) on Cardano mainnet */
  soadaPolicyId: "02a574e2f048e288e2a77f48872bf8ffd61d73f9476ac5a83601610b",
  /** Token name for sOADA (empty string as it uses policy ID only) */
  soadaTokenName: "",

  // OPTIMiz Token Configuration
  /** Policy ID for the OPTIMiz governance token on Cardano mainnet */
  optimizPolicyId: 'fcad3f8a7e27b9cbde9d49a3de830f65085b35cc5090fa796b0760e4',
  /** Token name for OPTIMiz in hex format */
  optimizTokenName: '4f5054494d697a', // Hex encoded "OPTIMiz"

  // Financial Parameters
  /** Base interest rate for protocol calculations (2.7%) */
  baseRate: Big('0.027'),
  /** Projected interest rate for future calculations (2.0%) */
  projectedRate: Big('0.02'),
  /** Scalar value used in sigmoid function for rate adjustments */
  sigmoidScalar: Big(2),
}
