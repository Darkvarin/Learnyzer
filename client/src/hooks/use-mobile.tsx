import { useState, useEffect, useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  // Initialize state with undefined to prevent hydration issues
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  // Use useCallback for the onChange handler to prevent unnecessary re-renders
  const onChange = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    // Use a more efficient approach with matchMedia
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Set the initial value
    onChange();
    
    // Add event listener
    mql.addEventListener("change", onChange);
    
    // Clean up
    return () => mql.removeEventListener("change", onChange);
  }, [onChange]);

  // Using !! ensures a boolean return type
  return !!isMobile;
}
