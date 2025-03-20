/**
 * Outside Click Hook
 * 
 * A custom React hook that handles clicks outside of a specified element.
 * This is commonly used for:
 * - Closing dropdowns
 * - Dismissing modals
 * - Hiding popups
 * - Managing focus states
 */

import React, {useEffect} from "react";

/**
 * Hook to detect clicks outside of a referenced element
 * 
 * @param ref - React ref object pointing to the element to monitor
 * @param func - Callback function to execute when a click occurs outside
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const ref = useRef(null);
 *   useOutsideClick(ref, () => {
 *     // Handle outside click
 *     console.log('Clicked outside!');
 *   });
 * 
 *   return <div ref={ref}>Click outside to close</div>;
 * };
 * ```
 */
export const useOutsideClick = (ref: React.MutableRefObject<any>, func: () => void) => {
  useEffect(() => {
    /**
     * Event handler for clicks outside the referenced element
     * @param event - The mouse event that triggered the handler
     */
    function handleClickOutside(event: UIEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        func();
      }
    }

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup: remove event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, func]); // Re-run effect if ref or callback changes
}
