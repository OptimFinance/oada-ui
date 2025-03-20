/**
 * PageHeader Component
 * 
 * A consistent page header component used at the top of different pages
 * to provide context and navigation hierarchy through:
 * - Optional breadcrumb navigation
 * - Page title with consistent styling
 * 
 * This component helps maintain a consistent layout and user experience
 * across different sections of the application.
 */

import { UITypes } from "./../../types/index";
import { Breadcrumbs } from "./../Breadcrumbs";

/**
 * Props for the PageHeader component
 * 
 * @property breadcrumbs - Array of breadcrumb items for navigation hierarchy
 * @property pageTitle - The title text to display for the current page
 */
interface Props {
  breadcrumbs: UITypes.Breadcrumb[];
  pageTitle: string;
}

/**
 * PageHeader Component
 * 
 * Renders a page header with optional breadcrumbs and a page title.
 * The breadcrumbs are only displayed if the array has items.
 * 
 * @example
 * // Basic usage with breadcrumbs
 * <PageHeader
 *   breadcrumbs={[
 *     { label: 'Home', path: '/' },
 *     { label: 'Dashboard', path: '/dashboard' }
 *   ]}
 *   pageTitle="Analytics Overview"
 * />
 * 
 * // Usage without breadcrumbs
 * <PageHeader
 *   breadcrumbs={[]}
 *   pageTitle="Settings"
 * />
 */
export const PageHeader = ({ breadcrumbs, pageTitle }: Props) => (
  <div className="mb-16">
    {/* Render breadcrumbs only if they exist */}
    {!!breadcrumbs?.length && <Breadcrumbs items={breadcrumbs} />}
    
    {/* Page title with consistent styling */}
    <h2 className="text-4xl">{pageTitle}</h2>
  </div>
);
