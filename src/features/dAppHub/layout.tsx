import { AsideNavigation } from "./AsideNavigation";

export const DappHubLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="grid md:grid-cols-[240px,1fr] border-t border-ui-border-sub h-[calc(100%-66px)]">
      <AsideNavigation className="hidden md:grid bg-ui-background-sub border-r border-ui-border-sub " />
      <div className="sm:overflow-y-auto m-2">{children}</div>
    </main>
  );
};
