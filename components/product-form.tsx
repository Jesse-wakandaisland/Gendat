"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  categories: z.string().min(1, {message: "Category is required"}), // Simplified for now, will expand
  // attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  // For attributes, we'll handle them separately for a better UX
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer."}).optional(),
  sku: z.string().optional(),
  // images: z.array(z.string().url()).optional(), // Assuming images are URLs
});

interface ProductFormProps {
  product?: Product; // Optional: for editing existing products
  onSubmit: (data: Product) => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean>>(product?.attributes || {});
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      categories: product?.categories.join(", ") || "", // Join categories for input
      // attributes: product?.attributes || {},
      stock: product?.stock || 0,
      sku: product?.sku || "",
      // images: product?.images || [],
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const productData: Product = {
      id: product?.id || uuidv4(), // Generate new ID if not editing
      ...values,
      categories: values.categories.split(",").map(c => c.trim()).filter(c => c), // Split categories string back to array
      attributes: attributes,
      createdAt: product?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSubmit(productData);
    form.reset();
    setAttributes({});
  }

  const handleAddAttribute = () => {
    if (newAttrName && newAttrValue) {
      // Basic type inference for value (can be improved)
      let typedValue: string | number | boolean = newAttrValue;
      if (!isNaN(Number(newAttrValue))) {
        typedValue = Number(newAttrValue);
      } else if (newAttrValue.toLowerCase() === 'true') {
        typedValue = true;
      } else if (newAttrValue.toLowerCase() === 'false') {
        typedValue = false;
      }
      setAttributes(prev => ({ ...prev, [newAttrName]: typedValue }));
      setNewAttrName("");
      setNewAttrValue("");
    }
  };

  const handleRemoveAttribute = (attrName: string) => {
    setAttributes(prev => {
      const newAttrs = { ...prev };
      delete newAttrs[attrName];
      return newAttrs;
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Laptop Pro X" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed product description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 999.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Electronics, Laptops, Computers (comma-separated)" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of categories.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attributes Section */}
        <div className="space-y-4 rounded-md border p-4">
            <FormLabel>Product Attributes/Specifications</FormLabel>
            {Object.entries(attributes).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                    <Input value={key} disabled className="font-medium"/>
                    <Input value={String(value)} disabled />
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveAttribute(key)}>Remove</Button>
                </div>
            ))}
            <div className="flex items-end space-x-2 pt-2">
                <div className="flex-grow">
                    <FormLabel htmlFor="newAttrName" className="text-xs">Attribute Name</FormLabel>
                    <Input id="newAttrName" placeholder="e.g., RAM" value={newAttrName} onChange={e => setNewAttrName(e.target.value)} />
                </div>
                <div className="flex-grow">
                    <FormLabel htmlFor="newAttrValue" className="text-xs">Attribute Value</FormLabel>
                    <Input id="newAttrValue" placeholder="e.g., 16GB or true" value={newAttrValue} onChange={e => setNewAttrValue(e.target.value)} />
                </div>
                <Button type="button" variant="outline" onClick={handleAddAttribute}>Add Attribute</Button>
            </div>
            <FormDescription>
                Define key-value pairs for product specifications (e.g., Screen Size: 15.6 inch, RAM: 8GB, IsWaterproof: true).
            </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., LPX-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Image upload will be handled later */}
        <div className="flex space-x-2">
            <Button type="submit">{product ? "Update" : "Create"} Product</Button>
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Form>
  );
}
