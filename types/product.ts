export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  categories: string[];
  attributes: Record<string, string | number | boolean>; // For specifications like { "RAM": "8GB", "Screen Size": 15.6 }
  stock?: number; // For inventory management
  sku?: string; // Stock Keeping Unit
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  id: string;
  name: string; // e.g., "Color", "Size", "RAM"
  values: (string | number)[]; // e.g., ["Red", "Blue"], [8, 16, 32]
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
