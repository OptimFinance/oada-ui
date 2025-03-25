/**
 * Topbar Component
 * 
 * Main navigation header component that provides access to wallet connection,
 * social links, and responsive navigation menu. Features different layouts
 * for mobile and desktop views.
 * 
 * Features:
 * - Responsive design with mobile drawer navigation
 * - Wallet connection/details integration
 * - Social media links dropdown
 * - Automatic navigation handling
 * - Logo and branding display
 */

import { FC, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConnectWallet } from "./ConnectWallet";
import { WalletDetails } from "./WalletDetails";
import { SocialDropdown } from "./SocialDropdown";
import { useAppSelector } from "../../store/hooks";
import { selectWallet } from "../../store/slices/walletSlice";
import { LogoMenu } from "./LogoMenu";
import { Sheet, SheetContent, SheetTrigger } from "src/components/ui/sheet";
import { Menu } from "lucide-react";
import { AsideNavigation } from "../dAppHub/AsideNavigation";
import { CustomIcon } from "src/components/ui/custom-icon";
import { Text } from "src/components/ui/typography";
import { TopLinks } from "../TopLinks";

/**
 * Props interface for the Topbar component
 * @interface Props
 * @property {string} [txSigningMessage] - Optional message displayed during transaction signing
 */
interface Props {
  txSigningMessage?: string;
}

/**
 * Topbar Component
 * 
 * @component
 * @param {Props} props - Component props
 * @returns {JSX.Element} Responsive navigation header
 */
export const Topbar: FC<Props> = ({ txSigningMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useAppSelector(selectWallet);

  /**
   * Redirect handler for root path
   * Automatically redirects from "/" to "/dashboard"
   */
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [location.pathname, navigate, wallet]);

  return (
    <header className="h-[56px] flex items-center justify-between relative z-50 p-4">
      {/* Mobile Navigation Drawer
          Only visible on mobile devices (md:hidden) */}
      <Sheet>
        <SheetTrigger className="md:hidden">
          <Menu className="md:hidden" />
        </SheetTrigger>
        <SheetContent side="left">
          <LogoMenu />
          <AsideNavigation className="h-[calc(100%-42px)]" />
        </SheetContent>
      </Sheet>

      {/* Desktop Logo Section
          Hidden on mobile, visible on desktop (hidden md:flex) */}
      <div className="hidden md:flex w-[240px] -m-4 bg-ui-background-sub py-2 px-4 border-r border-r-ui-border-sub">
        <div className="flex items-center p-2">
          <CustomIcon icon="optim" className="h-6 w-6 sm:mr-2" />
          <Text
            weight="semibold"
            size="medium"
            className="flex items-center whitespace-nowrap"
          >
            dApp Hub
          </Text>
        </div>
      </div>

      {/* Top Navigation Links
          Hidden on mobile, visible on desktop (hidden sm:flex) */}
      <TopLinks className="hidden sm:flex items-center" />

      {/* Wallet and Social Links Section */}
      <div className="md:flex items-center">
        {/* Conditional Wallet Display
            Shows either WalletDetails or ConnectWallet based on connection status */}
        {wallet ? (
          <WalletDetails
            txSigningMessage={txSigningMessage}
          />
        ) : (
          <ConnectWallet />
        )}

        {/* Social Links Dropdown
            Hidden on mobile, visible on desktop (hidden md:block) */}
        <div className="hidden md:block">
          <SocialDropdown />
        </div>
      </div>
    </header>
  );
};
