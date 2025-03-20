/**
 * DappHub Component - Main Entry Point
 * 
 * This component serves as the root entry point for the dApp Hub feature.
 * When a user navigates to the base dApp Hub route, this component automatically
 * redirects them to the default dashboard (OADA dashboard).
 * 
 * Key functionality:
 * - Acts as a root-level router component for the dApp Hub
 * - Implements a redirect to the default dashboard view
 * - Ensures users always land on a meaningful UI rather than a blank or introductory page
 * 
 * This pattern allows the application to:
 * 1. Maintain a logical URL structure with /dapp-hub as the base route
 * 2. Provide immediate access to the most commonly used dashboard
 * 3. Avoid an extra navigation step for users
 */

import { Navigate } from "react-router-dom";

/**
 * DappHub Component
 * 
 * Redirects users from the base dApp Hub route to the OADA dashboard,
 * which serves as the default view for the application.
 * 
 * @returns A React Router Navigate component that performs the redirect
 */
export const DappHub = () => <Navigate to="oada/dashboard" />;
