export const products = [
  { id: 1, title: 'Fender Stratocaster Player Plus', condition: 'Usado · Excelente', price: 'R$ 6.890', location: 'São Paulo, SP', image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=900&q=85', brand: 'Fender', type: 'Guitarras' },
  { id: 2, title: 'Gibson Les Paul Studio 2019', condition: 'Usado · Muito bom', price: 'R$ 8.500', location: 'Curitiba, PR', image: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=900&q=85', brand: 'Gibson', type: 'Guitarras' },
  { id: 3, title: 'Ibanez RG550 Genesis Collection', condition: 'Seminovo', price: 'R$ 5.290', location: 'Belo Horizonte, MG', image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=85', brand: 'Ibanez', type: 'Guitarras' },
  { id: 4, title: 'Boss DS-1 Distortion', condition: 'Usado · Excelente', price: 'R$ 590', location: 'Rio de Janeiro, RJ', image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=900&q=85', brand: 'Boss', type: 'Pedais/Efeitos' },
  { id: 5, title: 'Martin D-28 Authentic', condition: 'Usado · Excelente', price: 'R$ 14.900', location: 'Porto Alegre, RS', image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=900&q=85', brand: 'Martin', type: 'Violões' },
  { id: 6, title: 'Fender Player Jazz Bass', condition: 'Seminovo', price: 'R$ 7.200', location: 'Campinas, SP', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=900&q=85', brand: 'Fender', type: 'Baixos' },
]

export type Product = typeof products[number]

export const meusAnunciosIds = [1, 4, 6]
