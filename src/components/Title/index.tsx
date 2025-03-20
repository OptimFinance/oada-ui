/**
 * Title Component
 * 
 * A component that sets the document title and metadata for SEO optimization.
 * This component leverages react-helmet-async to manage all the document head
 * elements including title, meta tags, and Open Graph / Twitter Card metadata
 * for social media sharing.
 * 
 * The component automatically appends " | Optim Finance" to the provided title
 * and includes a set of standardized meta tags across all pages.
 */

import { Helmet } from "react-helmet-async";

/**
 * Props for the Title component
 * 
 * @property title - The main title to be displayed in the browser tab and metadata
 */
interface titleProps {
  title: string;
}

/**
 * Application description used across all metadata
 * This is a standardized description that explains what Optim Finance does
 * and is used for SEO and social sharing.
 */
const description =
  "Optim is a yield aggregator for the Cardano blockchain. Optimize your DeFi yields with our suite of automated asset management products. Deposit assets in Optim's secure vaults and our strategies take care of the rest. Boost your APYs  today. Easy, Automated, Secure.";

/**
 * Open Graph image URL
 * This image is used when sharing links on social media platforms
 */
const ogImage = "https://landing-page-kb5efn63q-optim-finance.vercel.app/assets/og-image.png"

/**
 * Title Component
 * 
 * Sets document title and all relevant metadata for SEO and social sharing.
 * 
 * @example
 * // Basic usage
 * <CustomTitle title="Dashboard" />
 * 
 * // Will set the page title to "Dashboard | Optim Finance"
 * // and update all metadata accordingly
 */
const CustomTitle = ({ title }: titleProps) => {
  return (
    <Helmet>
      {/* Basic page title and viewport settings */}
      <title>{title} | Optim Finance</title>
      <meta content="width=device-width,minimum-scale=1,initial-scale=1,maximum-scale=1" name="viewport" />
      <link href="/favicon.ico" rel="icon" />
      
      {/* Primary metadata */}
      <meta content={title} name="title" />
      <link rel="canonical" href="https://app.optim.finance" />
      <meta content={description} name="description" />
      <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
      <meta content="optim,bonds,yield aggregator,oada,cardano,Cardano blockchain,defi" name="keywords" />
      <meta content="Copyright 2022 Optim" name="copyright" />
      <meta content={ogImage} name="image" />
      
      {/* Open Graph metadata for Facebook, LinkedIn, etc. */}
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={ogImage} property="og:image" />
      
      {/* Twitter Card metadata for Twitter */}
      <meta content="summary_large_image" name="twitter:card" />
      <meta content="@OptimFi" name="twitter:site" />
      <meta content="@OptimFi" name="twitter:creator" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={ogImage} name="twitter:image" />
      <meta content={ogImage} name="twitter:image:src" />
      
      {/* Search engine directives */}
      <meta content="all" name="robots" />
    </Helmet>
  );
};

export default CustomTitle;
