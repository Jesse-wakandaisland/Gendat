"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import useCompareStore from "@/hooks/use-compare-store";
import { Product } from "@/types/product";
import { PlusCircle, MinusCircle, CheckCircle } from "lucide-react";

interface CompareButtonProps extends ButtonProps {
  product: Product;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export function CompareButton({ product, variant = "outline", size = "sm", ...props }: CompareButtonProps) {
  const { compareItems, addToCompare, removeFromCompare, maxCompareItems } = useCompareStore();
  const isInCompare = compareItems.some(item => item.id === product.id);
  const isMaxReached = compareItems.length >= maxCompareItems && !isInCompare;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation if button is inside a Link
    e.stopPropagation();
    if (isInCompare) {
      removeFromCompare(product.id);
    } else if (!isMaxReached) {
      addToCompare(product);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isMaxReached}
      title={isMaxReached ? `Max ${maxCompareItems} items for comparison` : (isInCompare ? "Remove from Compare" : "Add to Compare")}
      className={`transition-all duration-150 ease-in-out ${props.className || ""}`}
      {...props}
    >
      {isInCompare ? (
        <>
          <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" /> Comparing
        </>
      ) : (
        <>
          {isMaxReached ? <MinusCircle className="mr-1.5 h-4 w-4 text-muted-foreground" /> : <PlusCircle className="mr-1.5 h-4 w-4" />}
          Compare
        </>
      )}
    </Button>
  );
}
