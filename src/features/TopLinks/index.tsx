import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Text } from "src/components/ui/typography";
import { topNavLinks } from "../dAppHub/content";
import { cn } from "src/utils/tailwind";
import { FiArrowUpRight } from "react-icons/fi";

interface Props {
  className?: string
}

export const TopLinks: FC<Props> = ({ className }) => {
  const location = useLocation();

  const topNavLinkKey = Object.keys(topNavLinks).find((key) =>
    location.pathname.includes(key)
  ) as keyof typeof topNavLinks;
  const links = topNavLinkKey ? topNavLinks[topNavLinkKey] : topNavLinks['oada'];

  return (
    <div className={cn("gap-8", className)}>
      {links.map((link) => {
        const isActive = location.pathname.startsWith(link.href);
        return (
          <Link key={link.title} to={link.href} target={link.isExternal ? "_blank" : "_self"}>
            <Text
              weight="medium"
              size="medium"
              tone="muted"
              className={cn(
                "flex items-center whitespace-nowrap",
                isActive && "text-ui-surface-default",
              )}
            >
              {link.title}
              {link.isExternal && (
                <FiArrowUpRight className="h-4 w-4 ml-0.5" />
              )}
            </Text>
          </Link>
        );
      })}
    </div>
  );
};
