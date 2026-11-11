import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL(
        "https://uoykmyhvfkrajsrfsjtr.supabase.co/storage/v1/object/public/**"
      ),
      new URL("https://emanubucketimages.uk/desapegodasah/catalogo/**"),
    ],
  },
}

export default nextConfig
