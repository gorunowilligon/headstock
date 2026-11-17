/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/vender', destination: '/' },
      { source: '/chat', destination: '/' },
      { source: '/perfil', destination: '/' },
      { source: '/favoritos', destination: '/' },
      { source: '/entrar', destination: '/' },
      { source: '/admin', destination: '/' },
      { source: '/anuncio/:id', destination: '/' },
      { source: '/editar/:id', destination: '/' },
    ]
  },
}

export default nextConfig
