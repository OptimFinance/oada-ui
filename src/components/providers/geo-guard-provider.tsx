/**
 * GeoGuardProvider Component
 * 
 * A React context provider that implements geographical access restrictions
 * for specific regions. This component:
 * 
 * 1. Fetches the user's location data based on IP address
 * 2. Checks if the user's country is in a restricted list
 * 3. Conditionally renders appropriate UI based on location status:
 *    - Loading indicator while fetching location
 *    - Access denied message for restricted regions
 *    - Normal application content for permitted regions
 * 
 * This component is typically wrapped around routes or components that
 * should be geographically restricted for regulatory or compliance reasons.
 */

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * List of ISO country codes for regions where access is restricted
 * 
 * US - United States
 * KP - North Korea
 * PS - Palestinian Territories
 * CA - Canada
 * IR - Iran
 * CU - Cuba
 * SY - Syria
 * MM - Myanmar (Burma)
 */
const restrictedRegions = ["US", "KP", "PS", "CA", "IR", "CU", "SY", "MM"];

/**
 * GeoGuardProvider Component
 * 
 * @param children - The React components to render if geolocation check passes
 * 
 * @example
 * // Basic usage wrapping a component or route
 * <GeoGuardProvider>
 *   <ProtectedFeature />
 * </GeoGuardProvider>
 * 
 * // Application-wide usage
 * <GeoGuardProvider>
 *   // Your application routes would go here
 * </GeoGuardProvider>
 */
export const GeoGuardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // State to store the visitor's country code
  const [visitorCountry, setVisitorCountry] = useState<string | null>(null);
  // Loading state while fetching geolocation data
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  
  // Fetch IP geolocation data on component mount
  useEffect(() => {
    /**
     * Function to fetch the user's IP information and extract country code
     * Uses ipapi.co free API service
     */
    const fetchIp = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setVisitorCountry(data.country);
      } catch (error) {
        console.error(error);
        // Note: In case of error, visitorCountry remains null
        // and isLoadingGeo is set to false, allowing the app to render
      }
    };
    
    // Call the function and update loading state when complete
    fetchIp().then(() => setIsLoadingGeo(false));
  }, []);

  // Determine if the visitor's country is in the restricted list
  const isGeoRestricted =
    visitorCountry && restrictedRegions.includes(visitorCountry);

  // Show loading spinner while fetching geolocation data
  if (isLoadingGeo)
    return (
      <div className="w-full h-[calc(100%-74px)] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
      </div>
    );

  // Show access denied message if user is in a restricted region
  if (isGeoRestricted)
    return (
      <div className="w-full h-[calc(100%-74px)] flex items-center justify-center flex-col">
        <p className="text-center text-lg">
          We noticed you are in one of the restricted regions.
          <br />
          Unfortunately you will not be able to participate in the Initial
          Liquidity Event.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-400 hover:bg-indigo-500"
        >
          Back to home page
        </Link>
      </div>
    );

  // If user is not in a restricted region, render the normal content
  return <>{children}</>;
};
