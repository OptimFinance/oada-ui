import { Link, useLocation } from "react-router-dom";
import { ReactSVG } from "react-svg";
import { cn } from "src/utils/tailwind";
import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";
import {
  AsideLink,
  asideFooterLinks,
  asideLinks,
  socialLinks,
} from "./content";
import {TopLinks} from "../TopLinks";

export const AsideNavigation = ({ className }: { className?: string }) => {
  return (
    <aside className={cn("grid h-full", className)}>
      <ul className="mt-3">
        {asideLinks.map((link) => {
          return <AsideNavigationLink key={link.title} link={link} />;
        })}
      </ul>
      <footer className="mt-auto">
        <ul className="px-6 py-4 grid gap-3">
          {asideFooterLinks.map((link) => (
            <li key={link.title}>
              <Link
                className="text-sm uppercase text-ui-surface-sub hover:text-white"
                to={link.href}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="px-6 py-4 flex gap-6">
          {socialLinks.map((link) => (
            <li key={link.title}>
              <Link className="text-ui-base-white" to={link.href} target="_blank">
                <ReactSVG src={link.icon} width={16} height={16} />
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </aside>
  );
};

export const AsideNavigationLink = ({
  link,
  className,
}: {
  link: AsideLink;
  className?: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(link.parent) || location.pathname.startsWith(link.href);
  return (
    <li key={link.title} className={cn("list-none", className)}>
      <Link
        to={link.href}
        className={cn(
          "flex items-center px-2 md:px-6 py-4 w-full h-full text-ui-surface-sub text-sm font-medium focus:text-ui-base-purple",
          isActive && "text-ui-base-purple bg-ui-background-sub"
        )}
      >
        <ReactSVG
          className="mr-3"
          fill="#FA8072"
          color="#FA8072"
          src={link.icon}
        />
        {link.title}
        {link.soon && (
          <div className="px-2 py-1 rounded-2xl text-xs text-ui-warning-default bg-ui-warning-default/15 leading-[12px] ml-3 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-ui-warning-default mr-1"></div>
            Soon
          </div>
        )}
        {link.new && (
          <div className="px-2 py-1 rounded-2xl text-xs text-ui-success-default bg-ui-success-default/15 leading-[12px] ml-3 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-ui-success-default mr-1"></div>
            New
          </div>
        )}
        {link.outsideLink && (
          <ReactSVG className="ml-3" src={arrowUpRightIcon} />
        )}
      </Link>
      {isActive && <TopLinks className="flex sm:!hidden flex-col items-start mx-10 my-4" />}
    </li>
  );
};
