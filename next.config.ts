import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.BOUNTYPILOT_BUILD_DIR || '.next',
  logging: { incomingRequests: false }
};
export default config;
