export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export const legacyRedirects: LegacyRedirect[] = [
  { source: "/mc", destination: "/", permanent: false },
  { source: "/mc/", destination: "/", permanent: false },
  { source: "/mc/:path*", destination: "/:path*", permanent: false },
  {
    source: "/api/media/file/:path*",
    destination: "/web-studio/api/media/file/:path*",
    permanent: false,
  },
];
