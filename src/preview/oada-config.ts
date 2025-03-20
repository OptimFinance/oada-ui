/**
 * OADA Protocol Preview Network Configuration
 * 
 * This file contains the core configuration values for the OADA (Open Agriculture Data Alliance)
 * protocol implementation on the Cardano preview testnet. It defines token policies,
 * identifiers, and financial parameters used throughout the protocol's test environment.
 */

import Big from "big.js";

/**
 * OADA Protocol Configuration Object
 * Contains all essential parameters for protocol operation on preview testnet
 */
export const config = {
  /**
   * OADA Token Policy ID
   * Unique identifier for the OADA token on preview testnet
   */
  oadaPolicyId: "7761c3f81b5cc2cf39b5ad21a1b49d983f2c7988880d86ca6b49325e",
  
  /**
   * OADA Token Name
   * Empty string as the token uses policy ID only for identification
   */
  oadaTokenName: "",
  
  /**
   * Staked OADA (sOADA) Policy ID
   * Unique identifier for the staked OADA token on preview testnet
   */
  soadaPolicyId: "b173982d93f183fc563b65db3d054e21c69bd4c10b3c89ae37d9929c",
  
  /**
   * Staked OADA Token Name
   * Empty string as the token uses policy ID only for identification
   */
  soadaTokenName: "",
  
  /**
   * OPTIMiz Token Policy ID
   * Placeholder for OPTIMiz governance token on preview testnet
   * Currently not implemented in preview environment
   */
  optimizPolicyId: "",
  
  /**
   * OPTIMiz Token Name
   * Placeholder for OPTIMiz token name on preview testnet
   * Currently not implemented in preview environment
   */
  optimizTokenName: "",
  
  /**
   * Base Interest Rate
   * Initial rate used for protocol calculations (2.7%)
   * Represented as a Big.js decimal for precise calculations
   */
  baseRate: Big('0.027'),
  
  /**
   * Projected Interest Rate
   * Target rate for future calculations (2.0%)
   * Represented as a Big.js decimal for precise calculations
   */
  projectedRate: Big('0.02'),
  
  /**
   * Sigmoid Scalar
   * Scaling factor used in sigmoid function for rate adjustments
   * Controls the steepness of the rate curve
   */
  sigmoidScalar: Big(2),
}
