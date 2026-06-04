/** @type {import('next').NextConfig} */
const path = require('path');

// Resolve the directories of Next's own bundled React so client code, the App
// Router runtime, AND @react-three/fiber's react-reconciler all share ONE React.
const compiledReactDir = path.dirname(require.resolve('next/dist/compiled/react/package.json'));
const compiledReactDomDir = path.dirname(require.resolve('next/dist/compiled/react-dom/package.json'));

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config, { isServer }) => {
    // Root cause: the prod CLIENT bundle ended up with TWO Reacts — Next's
    // compiled React (App Router runtime, needs React.use()) and node_modules
    // react@18.2 pulled in by react-reconciler (@react-three/fiber). reconciler
    // reads React internals (__SECRET_INTERNALS…ReactCurrentBatchConfig) and got
    // the wrong copy → runtime crash. Aliasing everything to react@18.2 instead
    // broke Next's runtime (no React.use). Fix: point every client react import
    // at Next's single compiled React — it has both React.use() and the
    // internals reconciler needs. Server (prerender) keeps default resolution.
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        react: compiledReactDir,
        'react-dom': compiledReactDomDir,
        'react/jsx-runtime': path.join(compiledReactDir, 'jsx-runtime'),
        'react/jsx-dev-runtime': path.join(compiledReactDir, 'jsx-dev-runtime'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
