/**
 * LogoMenu Component
 * 
 * A navigation component that provides a dropdown menu for switching between
 * different sections of the application (SPO and ILE). Features the Optim logo
 * and a context-aware title that changes based on the current route.
 * 
 * Features:
 * - Radix UI dropdown menu integration
 * - Route-based context switching
 * - Custom styling with Tailwind CSS
 * - Accessible navigation controls
 * - Responsive design with hover states
 */

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CustomIcon } from "src/components/ui/custom-icon";
import { Text } from "src/components/ui/typography";

export const LogoMenu = () => {
  // Get current route location to determine active section
  const location = useLocation();
  const isIlEPage = location.pathname.startsWith("/ile");

  return (
    <DropdownMenu.Root>
      {/* Dropdown Trigger Button - Displays logo, current section title, and dropdown indicator */}
      <DropdownMenu.Trigger className="flex items-center border border-ui-border-sub bg-ui-background-sub gap-2 p-2 rounded-full">
        <CustomIcon icon="optim" className="h-6 w-6" />
        <Text
          weight="semibold"
          size="medium"
          className="flex items-center whitespace-nowrap"
        >
          {/* Dynamic section title based on current route */}
          {isIlEPage ? "ILE" : "SPO"} <ChevronDown className="h-4 w-4 ml-1" />
        </Text>
      </DropdownMenu.Trigger>

      {/* Dropdown Menu Portal - Contains navigation links to different sections */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-neutral-500 bg-opacity-10 w-[120px] mt-2 rounded-xl">
          {/* SPO Dashboard Link */}
          <DropdownMenu.Item asChild>
            <Link
              to="/dashboard"
              className="py-2 px-3 flex justify-center hover:bg-indigo-800 hover:bg-opacity-10"
            >
              SPO
            </Link>
          </DropdownMenu.Item>

          {/* ILE Section Link */}
          <DropdownMenu.Item asChild>
            <Link
              to="/ile"
              className="py-2 px-3 flex justify-center hover:bg-indigo-800 hover:bg-opacity-10"
            >
              ILE
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
