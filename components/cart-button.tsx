"use client";

import { Button } from "@/components/ui/button";
import useCartStore from "@/hooks/use-cart-store";
import { ShoppingCart, BadgeHelp } from "lucide-react"; // BadgeHelp for empty or loading
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartButton() {
  // Zustand store provides synchronous access after initial hydration
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component has mounted and can safely access localStorage via Zustand
    setIsClient(true);
  }, []);


  if (!isClient) {
    // Render a placeholder or loading state until client is mounted
    return (
      <Button variant="outline" size="icon" className="relative" asChild>
        <Link href="/cart">
          <BadgeHelp className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">View Cart (Loading)</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" className="relative" asChild>
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
        <span className="sr-only">View Cart</span>
      </Link>
    </Button>
  );
}
