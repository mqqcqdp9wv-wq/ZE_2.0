/** @type {import('next').NextConfig} */
// History: under Next 13 + React 18 + react-three-fiber v8, the prod client bundle
// ended up with TWO Reacts (Next's compiled React + node_modules react@18.2 pulled in
// by react-reconciler) → runtime crash reading ReactCurrentBatchConfig. That needed a
// webpack alias forcing every client react import onto Next's compiled React.
//
// On React 19 + R3F v9 + Next 15 that workaround should be unnecessary: R3F v9 uses
// React 19's reconciler and shares the single react@19 with Next. Alias removed.
// If a dual-React symptom ever returns (invalid hook call / context mismatch), re-add a
// client-only alias of react/react-dom onto next/dist/compiled/react.
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // The repo root has its own package-lock.json (the main site). Next 15 otherwise
  // infers the parent as the workspace root and warns. Pin tracing root to this app.
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
