"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, CheckCircle, GitCompareArrows } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompareButton } from "@/components/compare-button"; // Import CompareButton
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Using sonner for toast notifications

import useCartStore from "@/hooks/use-cart-store"; // Import cart store

// Mock localStorage functions for SSR compatibility
// No longer needed for cart as Zustand handles persistence, but keep for products for now.
const MOCK_STORAGE = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
};

const getLocalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return MOCK_STORAGE;
};

const PRODUCTS_STORAGE_KEY = "algorithmpress_products";
// const CART_STORAGE_KEY = "algorithmpress_cart"; // Cart is now managed by Zustand store


interface ProductPageParams {
  productId: string;
}

export default function ProductDetailPage({ params }: { params: ProductPageParams }) {
  const { productId } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const { addToCart } = useCartStore(); // Get addToCart from the store

  useEffect(() => {
    const storedProducts = getLocalStorage().getItem(PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
      const products: Product[] = JSON.parse(storedProducts);
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct({
          ...foundProduct,
          createdAt: new Date(foundProduct.createdAt),
          updatedAt: new Date(foundProduct.updatedAt),
        });
        if (foundProduct.images && foundProduct.images.length > 0) {
          setSelectedImage(foundProduct.images[0]);
        } else {
          setSelectedImage("/placeholder.svg");
        }
      }
    }
    setLoading(false);
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1); // Add 1 quantity by default
    }
  };

  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-8 animate-pulse">
            <div className="mb-6">
                <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div> {/* Image Gallery Skeleton */}
                    <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
                <div> {/* Product Details Skeleton */}
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                    <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
                    <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Link href="/products" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const mainImage = selectedImage || (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg");

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link href="/products" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full h-96 md:h-[500px] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
            <Image
              src={mainImage}
              alt={product.name}
              layout="fill"
              objectFit="contain" // Use contain to ensure whole image is visible
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === img ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400 transition-colors`}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} layout="fill" objectFit="cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="py-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
          <div className="mb-4">
            {product.categories.map(category => (
                <Badge key={category} variant="secondary" className="mr-2 mb-1">{category}</Badge>
            ))}
          </div>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
            ${product.price.toFixed(2)}
          </p>

          {product.stock !== undefined && product.stock > 0 && (
             <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                <CheckCircle size={16} className="inline mr-1" /> In Stock ({product.stock} available)
             </p>
          )}
          {product.stock !== undefined && product.stock === 0 && (
             <p className="text-sm text-red-600 dark:text-red-400 mb-4">Out of Stock</p>
          )}

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {product.description || "No description available."}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleAddToCart}
              disabled={product.stock !== undefined && product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <CompareButton product={product} size="lg" className="w-full sm:w-auto" />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="attributes">
              <AccordionTrigger className="text-lg font-medium">Product Specifications</AccordionTrigger>
              <AccordionContent>
                {Object.keys(product.attributes).length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-semibold">{key}:</span> {String(value)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No specifications available.</p>
                )}
              </AccordionContent>
            </AccordionItem>
            {/* Add more accordion items for reviews, shipping info, etc. later */}
             <AccordionItem value="details">
              <AccordionTrigger className="text-lg font-medium">Other Details</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                    <li><strong>SKU:</strong> {product.sku || "N/A"}</li>
                    <li><strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
