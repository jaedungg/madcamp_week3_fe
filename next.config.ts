import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: '50mb', // 예: 25MB로 증가 (원하는 용량에 맞게 조절)
    },
  },
};

export default nextConfig;
