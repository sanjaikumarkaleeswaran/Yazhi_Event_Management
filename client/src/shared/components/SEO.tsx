import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonicalUrl, keywords, schema }) => {
  const fullTitle = `${title} | Yazhi Event Management`;
  const defaultKeywords = "Tamil Wedding Planner, Event Management, Birthday Events, Engagement Ceremony, Reception, Baby Shower, Corporate Events, Tamil Nadu";
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={`https://yazhievents.com${canonicalUrl}`} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://yazhievents.com${canonicalUrl}`} />
      <meta property="og:site_name" content="Yazhi Event Management" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Structured Data (Schema.org) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
