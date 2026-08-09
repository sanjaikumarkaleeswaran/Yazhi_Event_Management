import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  schema?: Record<string, any>;
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonicalUrl, keywords, schema, image, ogTitle, ogDescription, twitterTitle, twitterDescription, noIndex }) => {
  const fullTitle = `${title} | Yazhi Event Management`;
  const defaultKeywords = "Tamil Wedding Planner, Event Management, Birthday Events, Engagement Ceremony, Reception, Baby Shower, Corporate Events, Tamil Nadu";
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={`https://yazhievents.com${canonicalUrl}`} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={`https://yazhievents.com${canonicalUrl}`} />
      <meta property="og:site_name" content="Yazhi Event Management" />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data (Schema.org) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
