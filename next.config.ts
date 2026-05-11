import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { execSync } from "node:child_process";

const getGitSha = () => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return undefined;
  }
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  allowedDevOrigins: ["pamelia-subdentated-flatly.ngrok-free.dev"],
  env: {
    NEXT_PUBLIC_GIT_SHA: getGitSha(),
  },
};

export default withMDX(nextConfig);
