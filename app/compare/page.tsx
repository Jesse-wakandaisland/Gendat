"use client";

import useCompareStore from "@/hooks/use-compare-store";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowLeft, ShoppingCart, CheckCircle, InfoIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import useCartStore from "@/hooks/use-cart-store"; // Import cart store

// Cart is managed by Zustand store, so direct localStorage manipulation for cart is removed.

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart } = useCartStore(); // Get addToCart from cart store

  const handleAddToCart = (product: Product) => {
    if (product) {
      addToCart(product, 1); // Add 1 quantity by default
    }
  };

  if (compareItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <InfoIcon size={48} className="mx-auto mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold mb-4">Comparison List is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You haven't added any products to compare. Add some products from the product listings to see them here.
        </p>
        <Link href="/products" passHref>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  // Collect all unique attribute keys from all products being compared
  const allAttributeKeys = Array.from(
    new Set(compareItems.flatMap(product => Object.keys(product.attributes)))
  ).sort();


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compare Products ({compareItems.length})</h1>
        <div>
            <Link href="/products" passHref className="mr-2">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
              </Button>
            </Link>
            <Button variant="destructive" onClick={clearCompare}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear List
            </Button>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <Table className="min-w-max"> {/* Ensure table takes at least minimum width for readability */}
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[200px] font-semibold text-lg">Feature</TableHead>
              {compareItems.map(product => (
                <TableHead key={product.id} className="min-w-[250px] max-w-[300px] p-0">
                  <Card className="border-0 shadow-none rounded-none h-full">
                    <CardHeader className="p-2 items-center">
                       <div className="relative w-full h-32 sm:h-40 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                          <Image
                            src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                            alt={product.name}
                            layout="fill"
                            objectFit="contain"
                          />
                        </div>
                    </CardHeader>
                    <CardContent className="p-2 text-center">
                      <Link href={`/products/${product.id}`} passHref>
                        <CardTitle className="text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-words whitespace-normal" title={product.name}>
                            {product.name}
                        </CardTitle>
                      </Link>
                    </CardContent>
                    <CardFooter className="p-2 flex-col space-y-1">
                        <Button size="sm" className="w-full" onClick={() => handleAddToCart(product)} disabled={product.stock !== undefined && product.stock === 0}>
                            <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => removeFromCompare(product.id)}>
                            <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                        </Button>
                    </CardFooter>
                  </Card>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Price Row */}
            <TableRow>
              <TableCell className="sticky left-0 bg-background z-10 font-semibold">Price</TableCell>
              {compareItems.map(product => (
                <TableCell key={product.id} className="text-center font-semibold text-blue-600 dark:text-blue-400">
                  ${product.price.toFixed(2)}
                </TableCell>
              ))}
            </TableRow>

            {/* Categories Row */}
            <TableRow>
                <TableCell className="sticky left-0 bg-background z-10 font-semibold">Categories</TableCell>
                {compareItems.map(product => (
                    <TableCell key={product.id} className="text-center whitespace-normal">
                        {product.categories.join(", ")}
                    </TableCell>
                ))}
            </TableRow>

            {/* Stock Row */}
            <TableRow>
                <TableCell className="sticky left-0 bg-background z-10 font-semibold">Stock</TableCell>
                {compareItems.map(product => (
                    <TableCell key={product.id} className="text-center">
                        {product.stock !== undefined ? (product.stock > 0 ? `${product.stock} available` : <span className="text-red-500">Out of Stock</span>) : "N/A"}
                    </TableCell>
                ))}
            </TableRow>

            {/* SKU Row */}
            <TableRow>
                <TableCell className="sticky left-0 bg-background z-10 font-semibold">SKU</TableCell>
                {compareItems.map(product => (
                    <TableCell key={product.id} className="text-center">
                        {product.sku || "N/A"}
                    </TableCell>
                ))}
            </TableRow>

            {/* Dynamically generated attribute rows */}
            {allAttributeKeys.map(key => (
              <TableRow key={key}>
                <TableCell className="sticky left-0 bg-background z-10 font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                {compareItems.map(product => (
                  <TableCell key={product.id} className="text-center whitespace-normal">
                    {product.attributes[key] !== undefined ? String(product.attributes[key]) : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Description Row - Optional, can be very long */}
            <TableRow>
                <TableCell className="sticky left-0 bg-background z-10 font-semibold">Description</TableCell>
                {compareItems.map(product => (
                    <TableCell key={product.id} className="text-xs text-muted-foreground whitespace-normal max-w-xs overflow-hidden text-ellipsis">
                        {product.description ? (product.description.substring(0,150) + (product.description.length > 150 ? "..." : "")) : "N/A"}
                    </TableCell>
                ))}
            </TableRow>

          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
