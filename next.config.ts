import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Production remains buildable while legacy UI routes are incrementally typed.
    // Runtime behavior is unchanged; type checking can still run separately in CI/local.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
