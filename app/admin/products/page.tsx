"use client";

import { useState, useEffect } from "react";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [viewingProduct, setViewingProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<Product | undefined>(undefined);

  useEffect(() => {
    const storedProducts = getLocalStorage().getItem(PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts).map((p: Product) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    getLocalStorage().setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
  };

  const handleFormSubmit = (data: Product) => {
    if (editingProduct) {
      saveProducts(products.map((p) => (p.id === data.id ? data : p)));
    } else {
      saveProducts([...products, data]);
    }
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId: string) => {
    saveProducts(products.filter((p) => p.id !== productId));
    setProductToDelete(undefined); // Close dialog
  };

  const openCreateForm = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const openViewDialog = (product: Product) => {
    setViewingProduct(product);
  };

  const openDeleteConfirmDialog = (product: Product) => {
    setProductToDelete(product);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={openCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingProduct(undefined);
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the details of your product." : "Fill in the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4">
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingProduct(undefined);
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(undefined)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{viewingProduct?.name}</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <ScrollArea className="max-h-[70vh] p-4">
              <div className="space-y-2">
                <p><strong>ID:</strong> {viewingProduct.id}</p>
                <p><strong>Description:</strong> {viewingProduct.description || "N/A"}</p>
                <p><strong>Price:</strong> ${viewingProduct.price.toFixed(2)}</p>
                <p><strong>Categories:</strong> {viewingProduct.categories.join(", ")}</p>
                <p><strong>Stock:</strong> {viewingProduct.stock ?? "N/A"}</p>
                <p><strong>SKU:</strong> {viewingProduct.sku || "N/A"}</p>
                <div>
                  <strong>Attributes:</strong>
                  <ul className="list-disc pl-5">
                    {Object.entries(viewingProduct.attributes).map(([key, value]) => (
                      <li key={key}><strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                </div>
                <p><strong>Created At:</strong> {new Date(viewingProduct.createdAt).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {new Date(viewingProduct.updatedAt).toLocaleString()}</p>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(undefined)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                      Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setProductToDelete(undefined)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => productToDelete && handleDelete(productToDelete.id)}>Delete</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>


      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.categories.join(", ")}</TableCell>
                  <TableCell>{product.stock ?? "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openViewDialog(product)} className="mr-1">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="mr-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmDialog(product)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
