import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Add a small delay to ensure proper page transition
    const timer = setTimeout(() => {
      // Scroll to top with smooth behavior (with window guard)
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [location]);

  return null; // This component doesn't render anything
}