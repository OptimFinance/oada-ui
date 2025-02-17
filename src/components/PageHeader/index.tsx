import { UITypes } from "./../../types/index";
import { Breadcrumbs } from "./../Breadcrumbs";

interface Props {
  breadcrumbs: UITypes.Breadcrumb[];
  pageTitle: string;
}

export const PageHeader = ({ breadcrumbs, pageTitle }: Props) => (
  <div className="mb-16">
    {!!breadcrumbs?.length && <Breadcrumbs items={breadcrumbs} />}
    <h2 className="text-4xl">{pageTitle}</h2>
  </div>
);
