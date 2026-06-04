export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 199.99,
    image: 'https://via.placeholder.com/400x300?text=Wireless+Headphones',
    description: 'High-quality audio with noise cancellation and 30-hour battery life.',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Minimalist Watch',
    price: 149.99,
    image: 'https://via.placeholder.com/400x300?text=Minimalist+Watch',
    description: 'Elegant analog watch with genuine leather strap and water resistance.',
    category: 'Accessories',
  },
  {
    id: '3',
    name: 'Portable USB-C Charger',
    price: 79.99,
    image: 'https://via.placeholder.com/400x300?text=USB-C+Charger',
    description: '65W fast charging, compact design, charges up to 3 devices simultaneously.',
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'Canvas Messenger Bag',
    price: 89.99,
    image: 'https://via.placeholder.com/400x300?text=Messenger+Bag',
    description: 'Durable canvas with weatherproof coating, laptop compartment included.',
    category: 'Accessories',
  },
  {
    id: '5',
    name: '4K Webcam',
    price: 179.99,
    image: 'https://via.placeholder.com/400x300?text=4K+Webcam',
    description: 'Crystal clear 4K video, advanced autofocus, built-in microphone array.',
    category: 'Electronics',
  },
  {
    id: '6',
    name: 'Mechanical Keyboard',
    price: 129.99,
    image: 'https://via.placeholder.com/400x300?text=Mechanical+Keyboard',
    description: 'RGB backlighting, hot-swappable switches, programmable keys.',
    category: 'Electronics',
  },
]
