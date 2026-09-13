import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statically export the app so it can be served as plain files by FastAPI.
  output: "export",
  // Emit /login/index.html rather than /login.html so a static file server
  // can serve each route via its directory's index.html.
  trailingSlash: true,
  // Pin the workspace root so a stray lockfile in a parent directory is ignored.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
