"use client";

import useCartStore, { CartItem } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowLeft, PlusCircle, MinusCircle, ShoppingCart, InfoIcon, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getTotalItems } = useCartStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
      // Allow updateQuantity to handle removal if newQuantity is 0 or less
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // This is a mock checkout
    if (cartItems.length === 0) {
        toast.error("Your cart is empty. Add some products before checking out.");
        return;
    }
    // TODO: In a real app, before proceeding to payment, re-validate product prices and stock from the database.
    // This ensures data consistency if details changed while items were in the cart.
    // For example:
    // const validationResults = await validateCartItemsAgainstDatabase(cartItems);
    // if (!validationResults.isValid) {
    //   toast.error("Some items in your cart have changed (e.g., price or stock). Please review your cart.");
    //   // Update cartItems state with validated data and prompt user
    //   return;
    // }

    toast.success("Checkout Successful! (Mock)", {
        description: `Total: $${getCartTotal().toFixed(2)}. Thank you for your order! This is a mock checkout. In a real application, product prices and stock would be re-validated here.`,
        duration: 8000, // Longer duration for this important mock message
        icon: <CreditCard className="text-green-500" />
    });
    clearCart(); // Clear cart after mock checkout
    // In a real app, you'd redirect to an order confirmation page or similar,
    // after creating an order record in the database.
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <ShoppingCart size={64} className="mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/products" passHref>
          <Button size="lg">
            <ArrowLeft className="mr-2 h-5 w-5" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Your Shopping Cart ({getTotalItems()} items)</h1>
        <div className="flex gap-2">
            <Link href="/products" passHref>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
              </Button>
            </Link>
            <Button variant="destructive" onClick={clearCart} disabled={cartItems.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
            </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items Table - Main Content */}
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden md:table-cell">
                        <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                          <Image
                            src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg"}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">Unit Price: ${item.price.toFixed(2)}</p>
                         {item.stock !== undefined && item.quantity > item.stock && (
                            <p className="text-xs text-red-500">Max {item.stock} in stock</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <MinusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) handleQuantityChange(item.id, val);
                            }}
                            onBlur={(e) => { // Ensure quantity is at least 1 if field is blurred with invalid/empty value
                                if (isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 1) {
                                    handleQuantityChange(item.id, 1);
                                }
                            }}
                            className="h-7 w-10 sm:h-8 sm:w-12 text-center px-1"
                            min="1"
                            max={item.stock} // Theoretical max based on stock
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >
                            <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-20"> {/* Sticky for larger screens */}
            <CardHeader>
              <CardTitle className="text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">FREE</span> {/* Mock shipping */}
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>$0.00</span> {/* Mock tax */}
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Order Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handleCheckout}>
                <CreditCard className="mr-2 h-5 w-5" /> Proceed to Checkout (Mock)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
