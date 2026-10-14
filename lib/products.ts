export type Vendedor = {
  nome: string
  avaliacao: number
  vendas: number
}

export type Product = {
  id: number
  title: string
  condition: string
  price: string
  location: string
  image: string
  brand: string
  type: string
  fotos?: string[]
  descricao?: string
  vendedor?: Vendedor
}

// Vendedor da conta logada (o próprio usuário). Anúncios antigos salvos sem vendedor usam este.
export const vendedorAtual: Vendedor = { nome: 'Marcos Cavalcanti', avaliacao: 4.9, vendas: 23 }

export const products: Product[] = [
  {
    id: 1, title: 'Fender Stratocaster Player Plus', condition: 'Usado · Excelente', price: 'R$ 6.890', location: 'São Paulo, SP', image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=900&q=85', brand: 'Fender', type: 'Guitarras',
    fotos: ['https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=900&q=85', 'https://images.unsplash.com/photo-1526924143875-1e1d8d4f9f8f?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=1000&q=85'],
    descricao: 'Guitarra impecável, regulada e pronta para tocar. Estou vendendo porque migrei para uma configuração diferente. Acompanha bag acolchoada e ponteira original. Sem marcas relevantes, trastes com mais de 80% de vida útil.',
    vendedor: vendedorAtual,
  },
  { id: 2, title: 'Gibson Les Paul Studio 2019', condition: 'Usado · Muito bom', price: 'R$ 8.500', location: 'Curitiba, PR', image: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=900&q=85', brand: 'Gibson', type: 'Guitarras', vendedor: { nome: 'Lucas Ferreira', avaliacao: 4.7, vendas: 12 } },
  { id: 3, title: 'Ibanez RG550 Genesis Collection', condition: 'Seminovo', price: 'R$ 5.290', location: 'Belo Horizonte, MG', image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=85', brand: 'Ibanez', type: 'Guitarras', vendedor: { nome: 'Ana Beatriz Lima', avaliacao: 5, vendas: 41 } },
  { id: 4, title: 'Boss DS-1 Distortion', condition: 'Usado · Excelente', price: 'R$ 590', location: 'Rio de Janeiro, RJ', image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=900&q=85', brand: 'Boss', type: 'Pedais/Efeitos', vendedor: vendedorAtual },
  { id: 5, title: 'Martin D-28 Authentic', condition: 'Usado · Excelente', price: 'R$ 14.900', location: 'Porto Alegre, RS', image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=900&q=85', brand: 'Martin', type: 'Violões', vendedor: { nome: 'Renato Azevedo', avaliacao: 4.8, vendas: 8 } },
  { id: 6, title: 'Fender Player Jazz Bass', condition: 'Seminovo', price: 'R$ 7.200', location: 'Campinas, SP', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=900&q=85', brand: 'Fender', type: 'Baixos', vendedor: vendedorAtual },
]

export const meusAnunciosIdsMock = [1, 4, 6]

export const catalogoMestre = products.map(({ title, brand, type }) => ({ title, brand, type }))
