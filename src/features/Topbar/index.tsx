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
import {TopLinks} from "../TopLinks";

interface Props {
  txSigningMessage?: string;
}

export const Topbar: FC<Props> = ({ txSigningMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useAppSelector(selectWallet);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [location.pathname, navigate, wallet]);


  return (
      <header className="h-[56px] flex items-center justify-between relative z-50 p-4">
        <Sheet>
          <SheetTrigger className="md:hidden">
            <Menu className="md:hidden" />
          </SheetTrigger>
          <SheetContent side="left">
            <LogoMenu />

            <AsideNavigation className="h-[calc(100%-42px)]" />
          </SheetContent>
        </Sheet>
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
        <TopLinks className="hidden sm:flex items-center" />
        <div className="md:flex items-center">
          {wallet ? (
            <WalletDetails
              txSigningMessage={txSigningMessage}
            />
          ) : (
            <ConnectWallet />
          )}
          <div className="hidden md:block">
            <SocialDropdown />
          </div>
        </div>
      </header>
  )
};
