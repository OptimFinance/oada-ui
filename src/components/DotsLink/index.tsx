import { FC, PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { cn } from "src/utils/tailwind";
import { Text } from "../ui/typography";

interface Props extends PropsWithChildren {
  path: string;
  className?: string;
  isExternal?: boolean;
  onClick?: () => void;
}

export const DotsLink: FC<Props> = ({
  path,
  children,
  isExternal,
  className,
  onClick,
}) => {
  return isExternal ? (
    <a
      href={path}
      rel="noreferrer"
      onClick={onClick}
      target="_blank"
      className={cn(
        "flex items-center cursor-pointer hover:text-ui-surface-sub",
        className
      )}
    >
      <Text className="truncate ">{children}</Text>
      <FiExternalLink className="h-4 w-4 ml-1 inline-flex shrink-0" />
    </a>
  ) : (
    <Link to={path} onClick={onClick} className={cn("", className)}>
      <Text className="truncate max-w-60 inline-flex">{children}</Text>
    </Link>
  );
};

interface CopyProps extends PropsWithChildren {
  className?: string;
  onClick?: () => void;
}

export const DotsCopy: FC<CopyProps> = ({ children, className, onClick }) => {
  return (
    <a
      rel="noreferrer"
      onClick={onClick}
      className={cn(
        "flex items-center cursor-pointer hover:text-ui-surface-sub",
        className
      )}
    >
      <Text className="truncate">{children}</Text>
      <FiCopy className="h-4 w-4 ml-1 inline-flex shrink-0" />
    </a>
  );
};
