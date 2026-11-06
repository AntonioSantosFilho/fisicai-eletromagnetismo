import publication from "@/publicacao/release.json";

export const SCHOOL_BETA =
  process.env.EXPO_PUBLIC_RELEASE_CHANNEL === "school-beta";
export const SUPPORT_EMAIL = publication.supportEmail as string | null;
export const DEVELOPER_NAME = publication.developerName as string | null;
export const BETA_VERSION = publication.version;
export const AI_PROVIDER = publication.aiProvider;
