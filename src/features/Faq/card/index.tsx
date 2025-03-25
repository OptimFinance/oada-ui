/**
 * FAQ Card Component
 * 
 * A clickable card component used in the FAQ section to display category
 * or topic links. Each card features an SVG icon and a title, and links
 * to a specific FAQ section when clicked.
 * 
 * Key features:
 * - SVG icon with consistent sizing
 * - Clickable link to specific FAQ sections
 * - Responsive layout with centered content
 * - Consistent typography using design system
 * - Accessible navigation through anchor tags
 * 
 * Uses Tailwind CSS for styling and the design system's Card component
 * for consistent visual presentation.
 */

import React from "react";
import { ReactSVG } from "react-svg";
import { FaqCardType } from "./types";
import { resize } from "../../../utils";
import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";

/**
 * FAQ Card Component
 * 
 * @param props - Component properties
 * @param props.id - Unique identifier used for the anchor link target
 * @param props.image - Path to the SVG icon to display
 * @param props.title - Card title text
 * @param props.onClick - Optional click handler for custom interactions
 * 
 * @returns A clickable card component that links to a specific FAQ section
 */
const FaqCard: React.FC<FaqCardType> = ({ id, image, title, onClick }) => {
  return (
    // Anchor tag for navigation to specific FAQ section
    <a href={`#${id}`} onClick={onClick}>
      {/* Card container with centered content layout */}
      <Card className="flex flex-col items-center gap-10">
        {/* SVG icon with consistent sizing */}
        <ReactSVG 
          beforeInjection={resize(100, 100)} 
          src={image} 
        />
        {/* Title text using design system typography */}
        <Text size="large" weight="semibold">
          {title}
        </Text>
      </Card>
    </a>
  );
};

export default FaqCard;
