"use client";

import { useState, useEffect, useMemo } from "react";
import { Product } from "@/types/product";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SearchIcon, XIcon, GitCompareArrows } from "lucide-react"; // Added GitCompareArrows
import { CompareButton } from "@/components/compare-button"; // Import CompareButton
import useCompareStore from "@/hooks/use-compare-store"; // Import compare store

// Mock localStorage functions for SSR compatibility
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

export default function ProductsDisplayPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]); // Default wide range
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const { compareItems } = useCompareStore();


  useEffect(() => {
    const storedProducts = getLocalStorage().getItem(PRODUCTS_STORAGE_KEY);
    let productsData: Product[] = [];
    if (storedProducts) {
      productsData = JSON.parse(storedProducts).map((p: Product) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    }
    setAllProducts(productsData);
    setFilteredProducts(productsData);

    // Derive categories and price range from products
    if (productsData.length > 0) {
      const categories = Array.from(new Set(productsData.flatMap(p => p.categories)));
      setAvailableCategories(categories);

      const prices = productsData.map(p => p.price);
      const dbMinPrice = Math.min(...prices);
      const dbMaxPrice = Math.max(...prices);
      setMinPrice(dbMinPrice);
      setMaxPrice(dbMaxPrice);
      setPriceRange([dbMinPrice, dbMaxPrice]);
    } else {
        setMinPrice(0);
        setMaxPrice(10000); // Default if no products
        setPriceRange([0, 10000]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let tempProducts = allProducts;

    // Filter by search term
    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      tempProducts = tempProducts.filter(product =>
        product.categories.includes(selectedCategory)
      );
    }

    // Filter by price range
    tempProducts = tempProducts.filter(product =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );


    setFilteredProducts(tempProducts);
  }, [searchTerm, selectedCategory, priceRange, allProducts]);


  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([minPrice, maxPrice]);
  };


  if (loading) {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
            {/* Skeleton for filters */}
            <div className="mb-8 p-4 border rounded-lg shadow animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div></div>
                    <div><div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div></div>
                    <div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
            {/* Skeleton for product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="flex flex-col justify-between animate-pulse">
                        <CardHeader><div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div></CardHeader>
                        <CardContent>
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        </CardContent>
                        <CardFooter><div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div></CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center flex-grow">Our Products</h1>
        {compareItems.length > 0 && (
            <Link href="/compare" passHref>
                <Button variant="default" size="lg">
                    <GitCompareArrows className="mr-2 h-5 w-5" />
                    Compare Items ({compareItems.length})
                </Button>
            </Link>
        )}
      </div>


      {/* Filters Section */}
      <Accordion type="single" collapsible className="mb-8 p-4 border rounded-lg shadow-sm bg-card" defaultValue="filters">
        <AccordionItem value="filters">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                Filters
                <Button variant="link" onClick={clearFilters} className="ml-auto text-sm text-blue-500 hover:underline">
                    <XIcon className="w-4 h-4 mr-1" /> Clear Filters
                </Button>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Search Input */}
                    <div>
                        <Label htmlFor="search-product" className="text-sm font-medium">Search</Label>
                        <div className="relative mt-1">
                            <Input
                                id="search-product"
                                type="text"
                                placeholder="Search by name, description, category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Category Select */}
                    <div>
                        <Label htmlFor="category-select" className="text-sm font-medium">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="category-select" className="mt-1">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {availableCategories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price Range Slider */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium">Price Range</Label>
                        <div className="mt-2 space-y-2">
                             <div className="flex justify-between text-sm text-muted-foreground">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                            <Slider
                                value={priceRange}
                                onValueChange={handlePriceRangeChange}
                                min={minPrice}
                                max={maxPrice}
                                step={Math.max(1, Math.floor((maxPrice - minPrice) / 100))} // Dynamic step
                                minStepsBetweenThumbs={1}
                                className="py-2"
                            />
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      {filteredProducts.length === 0 && !loading && (
         <div className="text-center py-10">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No products match your filters.</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Try adjusting your search or filter criteria, or <Button variant="link" onClick={clearFilters} className="p-0 h-auto text-blue-500 hover:underline">clear all filters</Button>.</p>
            {allProducts.length === 0 && (
                 <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
                    No products available at the moment. Please check back later or <Link href="/admin/products" className="text-blue-500 hover:underline">add some products</Link>.
                 </p>
            )}
         </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
            <CardHeader className="p-0">
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800">
                 <Image
                    src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-md"
                 />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
                {product.description ? (product.description.substring(0, 60) + (product.description.length > 60 ? "..." : "")) : "No description."}
              </p>
              <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2">
              <Link href={`/products/${product.id}`} passHref className="w-full">
                <Button className="w-full">View Details</Button>
              </Link>
              <CompareButton product={product} className="w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
