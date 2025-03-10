import { cn } from "src/utils/tailwind";

export const ProductCardsWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10",
        className
      )}
    >
      {children}
    </div>
  );
};
