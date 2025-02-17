import { Helmet } from "react-helmet-async";

interface titleProps {
  title: string;
}

const description =
  "Optim is a yield aggregator for the Cardano blockchain. Optimize your DeFi yields with our suite of automated asset management products. Deposit assets in Optim’s secure vaults and our strategies take care of the rest. Boost your APYs  today. Easy, Automated, Secure.";
const ogImage = "https://landing-page-kb5efn63q-optim-finance.vercel.app/assets/og-image.png"

const CustomTitle = ({ title }: titleProps) => {
  return (
    <Helmet>
      <title>{title} | Optim Finance</title>
      <meta content="width=device-width,minimum-scale=1,initial-scale=1,maximum-scale=1" name="viewport" />
      <link href="/favicon.ico" rel="icon" />
      <meta content={title} name="title" />
      <link rel="canonical" href="https://app.optim.finance" />
      <meta content={description} name="description" />
      <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
      <meta content="optim,bonds,yield aggregator,oada,cardano,Cardano blockchain,defi" name="keywords" />
      <meta content="Copyright 2022 Optim" name="copyright" />
      <meta content={ogImage} name="image" />
      {/* Open Graph */}
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={ogImage} property="og:image" />
      {/* End of Open Graph */}
      {/* Twitter Card */}
      <meta content="summary_large_image" name="twitter:card" />
      <meta content="@OptimFi" name="twitter:site" />
      <meta content="@OptimFi" name="twitter:creator" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={ogImage} name="twitter:image" />
      <meta content={ogImage} name="twitter:image:src" />
      {/* End of Twitter Card */}
      <meta content="all" name="robots" />
    </Helmet>
  );
};

export default CustomTitle;
