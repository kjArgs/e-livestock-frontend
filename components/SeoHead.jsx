import Head from "expo-router/head";
import { Platform } from "react-native";
import {
  DEFAULT_SOCIAL_IMAGE_PATH,
  SITE_LOCALE,
  SITE_SHORT_NAME,
  buildAbsoluteAssetUrl,
  buildCanonicalUrl,
} from "../lib/seo";

export default function SeoHead({
  title,
  description,
  path = "/",
  robots = "index,follow",
  type = "website",
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  schema = [],
}) {
  if (Platform.OS !== "web") {
    return null;
  }

  const canonicalUrl = buildCanonicalUrl(path);
  const socialImageUrl = buildAbsoluteAssetUrl(imagePath);
  const schemaEntries = (Array.isArray(schema) ? schema : [schema]).filter(Boolean);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-PH" href={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_SHORT_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={socialImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImageUrl} />
      {schemaEntries.map((entry, index) => (
        <script
          key={`${canonicalUrl}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </Head>
  );
}
