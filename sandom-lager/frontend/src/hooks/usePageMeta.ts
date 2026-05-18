/*
    * usePageMeta.ts
    * Hook to set dynamic meta tags for individual pages
    * Useful for SEO and social media sharing
    * Author: Emil Berglund
*/

import { useEffect } from 'react';

interface PageMetaConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

/**
 * Hook to set dynamic meta tags for individual pages
 * Useful for SEO and social media sharing
 * 
 * @param config Page metadata configuration
 * 
 * @example
 * usePageMeta({
 *   title: 'Dashboard - Sandom Lager',
 *   description: 'View your inventory statistics and active recipes'
 * });
 */
export function usePageMeta(config: PageMetaConfig) {
  useEffect(() => {
    // Set page title
    document.title = config.title;

    // Update meta description
    updateMetaTag('description', config.description);

    // Update meta keywords
    if (config.keywords) {
      updateMetaTag('keywords', config.keywords);
    }

    // Update Open Graph tags
    if (config.ogTitle) {
      updateMetaTag('og:title', config.ogTitle, 'property');
    }
    if (config.ogDescription) {
      updateMetaTag('og:description', config.ogDescription, 'property');
    }

    // Update Twitter Card tags
    if (config.twitterTitle) {
      updateMetaTag('twitter:title', config.twitterTitle);
    }
    if (config.twitterDescription) {
      updateMetaTag('twitter:description', config.twitterDescription);
    }

    // Cleanup: Reset to base meta tags on unmount (optional)
    return () => {
      // Optionally reset to defaults
      // document.title = 'Sandom Lager - Inventory & Recipe Management';
    };
  }, [config]);
}

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name'
) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}
