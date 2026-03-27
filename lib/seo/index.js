import siteConfig from "./siteConfig.json";

function normalizeSiteUrl(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return siteConfig.defaultSiteUrl;
  }

  return trimmed.replace(/\/+$/, "");
}

function normalizePathname(value) {
  const trimmed = String(value || "/").trim();

  if (!trimmed || trimmed === "/") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function createAdministrativeArea(name) {
  return {
    "@type": "AdministrativeArea",
    name,
  };
}

export const SITE_NAME = siteConfig.siteName;
export const SITE_SHORT_NAME = siteConfig.shortName;
export const SITE_DESCRIPTION = siteConfig.description;
export const SITE_LANGUAGE = siteConfig.language;
export const SITE_LOCALE = siteConfig.locale;
export const ORGANIZATION_NAME = siteConfig.organizationName;
export const SITE_URL = normalizeSiteUrl(
  process.env.EXPO_PUBLIC_SITE_URL || siteConfig.defaultSiteUrl
);
export const DEFAULT_SOCIAL_IMAGE_PATH = siteConfig.imagePath;
export const PUBLIC_SITEMAP_ROUTES = [...siteConfig.publicRoutes];
export const ROBOTS_DISALLOW_PATHS = [...siteConfig.disallowPaths];

export function buildCanonicalUrl(pathname = "/") {
  const normalizedPath = normalizePathname(pathname);

  return normalizedPath === "/"
    ? `${SITE_URL}/`
    : `${SITE_URL}${normalizedPath}`;
}

export function buildAbsoluteAssetUrl(pathname = DEFAULT_SOCIAL_IMAGE_PATH) {
  const value = String(pathname || "").trim();

  if (!value) {
    return `${SITE_URL}${DEFAULT_SOCIAL_IMAGE_PATH}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = normalizePathname(value);

  return normalizedPath === "/"
    ? `${SITE_URL}/`
    : `${SITE_URL}${normalizedPath}`;
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": siteConfig.organizationType,
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    areaServed: createAdministrativeArea(siteConfig.serviceArea),
    logo: {
      "@type": "ImageObject",
      url: buildAbsoluteAssetUrl(siteConfig.logoPath),
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function getGovernmentServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "@id": `${SITE_URL}/#service`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    serviceType: siteConfig.serviceType,
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    areaServed: createAdministrativeArea(siteConfig.serviceArea),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/`,
    },
  };
}

export function getWebPageSchema({
  path = "/",
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
} = {}) {
  const canonicalUrl = buildCanonicalUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: SITE_LANGUAGE,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#service`,
    },
  };
}

export function getBreadcrumbSchema(items = []) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path || "/"),
    })),
  };
}
