import { cn } from "src/utils/tailwind";

export const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <main className={cn("max-w-5xl px-4 lg:px-0 py-12 mx-auto", className)}>
      {children}
    </main>
  );
};
