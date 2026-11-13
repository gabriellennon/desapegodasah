import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://melhorenvio.com.br/images/shipping-companies/**"),
      new URL("https://www.melhorenvio.com.br/images/shipping-companies/**"),
      new URL(
        "https://sandbox.melhorenvio.com.br/images/shipping-companies/**"
      ),
      new URL(
        "https://i.pinimg.com/**"
      ),
      new URL(
        "https://uoykmyhvfkrajsrfsjtr.supabase.co/storage/v1/object/public/**"
      ),
      new URL("https://emanubucketimages.uk/desapegodasah/catalogo/**"),
      new URL(
        "https://emanubucketimages.uk/desapegodasah/desapego_logo_sah.png"
      ),
    ],
  },
}

export default nextConfig
