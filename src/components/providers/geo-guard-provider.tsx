import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const restrictedRegions = ["US", "KP", "PS", "CA", "IR", "CU", "SY", "MM"];

export const GeoGuardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visitorCountry, setVisitorCountry] = useState<string | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setVisitorCountry(data.country);
      } catch (error) {
        console.error(error);
      }
    };
    fetchIp().then(() => setIsLoadingGeo(false));
  }, []);

  const isGeoRestricted =
    visitorCountry && restrictedRegions.includes(visitorCountry);

  if (isLoadingGeo)
    return (
      <div className="w-full h-[calc(100%-74px)] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
      </div>
    );

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

  return <>{children}</>;
};
