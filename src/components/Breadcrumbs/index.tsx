import { FiChevronLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Text } from "../ui/typography";
import { UITypes } from "./../../types/index";

interface Props {
  items: UITypes.Breadcrumb[];
}

export const Breadcrumbs = ({ items }: Props) => (
  <nav className="flex items-center gap-2 mb-6">
    {items?.map((item) => (
      <Link key={uuidv4()} to={item.path} className="flex items-center">
        <FiChevronLeft className="h-5 w-5 text-ui-surface-sub" />
        <Text tone="muted" size="medium">
          {item.crumbName}
        </Text>
      </Link>
    ))}
  </nav>
);
