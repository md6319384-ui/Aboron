export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentDetails?: {
    senderNumber: string;
    transactionId: string;
  } | null;
  trackingNumber?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'customer';
}

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  bannerUrl?: string;
  fontFamily?: string;
  contactEmail: string;
  contactPhone: string;
  bkashNumber: string;
  nagadNumber: string;
  adminPassword?: string;
  allowCOD?: boolean;
  fontSize?: string;
}
