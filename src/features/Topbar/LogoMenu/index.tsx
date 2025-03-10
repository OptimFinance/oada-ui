import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CustomIcon } from "src/components/ui/custom-icon";
import { Text } from "src/components/ui/typography";

export const LogoMenu = () => {
  const location = useLocation();
  const isIlEPage = location.pathname.startsWith("/ile");
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center border border-ui-border-sub bg-ui-background-sub gap-2 p-2 rounded-full">
        <CustomIcon icon="optim" className="h-6 w-6" />
        <Text
          weight="semibold"
          size="medium"
          className="flex items-center whitespace-nowrap"
        >
          {isIlEPage ? "ILE" : "SPO"} <ChevronDown className="h-4 w-4 ml-1" />
        </Text>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-neutral-500 bg-opacity-10 w-[120px] mt-2 rounded-xl">
          <DropdownMenu.Item asChild>
            <Link
              to="/dashboard"
              className="py-2 px-3 flex justify-center hover:bg-indigo-800 hover:bg-opacity-10"
            >
              SPO
            </Link>
          </DropdownMenu.Item>
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
