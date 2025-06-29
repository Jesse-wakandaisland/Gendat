"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { PlusCircle, Edit, Trash2, Eye, UploadCloud, AlertTriangle } from "lucide-react";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// For localStorage migration
const LOCALSTORAGE_PRODUCTS_KEY = "algorithmpress_products";


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [viewingProduct, setViewingProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<Product | undefined>(undefined);
  const [showMigrationAlert, setShowMigrationAlert] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }
      const data: Product[] = await response.json();
      setProducts(data.map(p => ({
        ...p,
        // Ensure categories is always an array of strings for consistency internally
        categories: Array.isArray(p.categories) ? p.categories : [],
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })));
    } catch (error: any) {
      toast.error(`Error fetching products: ${error.message}`);
      console.error("Fetch products error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    // Check if there's data in localStorage for migration
    if (typeof window !== 'undefined' && localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY)) {
      setShowMigrationAlert(true);
    }
  }, [fetchProducts]);

  const handleFormSubmit = async (formDataFromForm: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'categories'> & { categories: string }) => {
    // The form gives categories as a string, API expects categoryNames as string[]
    const payload = {
      ...formDataFromForm,
      categoryNames: formDataFromForm.categories.split(',').map(c => c.trim()).filter(c => c),
    };
    // Remove the original 'categories' string field as API doesn't expect it
    // delete (payload as any).categories;


    try {
      let response;
      let successMessage = "";
      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        successMessage = "Product updated successfully!";
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        successMessage = "Product created successfully!";
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      toast.success(successMessage);
      setIsFormOpen(false);
      setEditingProduct(undefined);
      fetchProducts(); // Refresh product list
    } catch (error: any) {
      toast.error(`Error saving product: ${error.message}`);
      console.error("Save product error:", error);
    }
  };

  const handleEdit = (product: Product) => {
    // ProductForm expects product.categories to be a comma-separated string
    // The product from API/state has product.categories as string[]
    setEditingProduct({ ...product, categories: product.categories.join(", ") } as any);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }
      toast.success("Product deleted successfully!");
      setProductToDelete(undefined); // Close dialog
      fetchProducts(); // Refresh product list
    } catch (error: any) {
      toast.error(`Error deleting product: ${error.message}`);
      console.error("Delete product error:", error);
    }
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

  const handleMigrateLocalStorageProducts = async () => {
    if (typeof window === 'undefined') return;
    const storedProductsRaw = localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY);
    if (!storedProductsRaw) {
      toast.info("No products found in local storage to migrate.");
      setShowMigrationAlert(false);
      return;
    }

    try {
      const localProducts: Product[] = JSON.parse(storedProductsRaw);
      if (!localProducts || localProducts.length === 0) {
        toast.info("Local storage is empty or contains no valid products.");
        localStorage.removeItem(LOCALSTORAGE_PRODUCTS_KEY); // Clean up if empty/invalid
        setShowMigrationAlert(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      toast.info(`Starting migration of ${localProducts.length} products from local storage...`);

      for (const product of localProducts) {
        // Prepare payload for API: use categoryNames from product.categories (which should be string[])
        const payload = {
          ...product,
          categoryNames: product.categories, // Assuming product.categories from localStorage is already string[]
        };
        // delete (payload as any).id; // API will generate ID for new products
        // delete (payload as any).createdAt;
        // delete (payload as any).updatedAt;

        try {
          const response = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Send only the necessary fields for creation, let API handle defaults
            body: JSON.stringify({
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images,
                attributes: product.attributes,
                stock: product.stock,
                sku: product.sku,
                categoryNames: product.categories, // These are names
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to migrate product "${product.name}": ${errorData.error}`);
            toast.error(`Failed to migrate "${product.name}": ${errorData.error || 'Unknown error'}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (apiError: any) {
          console.error(`API error migrating product "${product.name}":`, apiError);
          toast.error(`API error for "${product.name}": ${apiError.message}`);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        toast.warning(`${successCount} products migrated, ${errorCount} failed. Check console for details.`);
      } else {
        toast.success(`Successfully migrated ${successCount} products!`);
      }

      localStorage.removeItem(LOCALSTORAGE_PRODUCTS_KEY); // Clear localStorage after attempting migration
      setShowMigrationAlert(false);
      fetchProducts(); // Refresh list from DB

    } catch (parseError:any) {
      toast.error("Error parsing products from local storage. Check console.");
      console.error("LocalStorage parse error:", parseError);
      // Optionally clear corrupted data: localStorage.removeItem(LOCALSTORAGE_PRODUCTS_KEY);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management (DB)</h1>
        <div className="flex items-center gap-2">
          {showMigrationAlert && (
             <Button variant="outline" onClick={handleMigrateLocalStorageProducts} title="Migrate products from your browser's local storage to the database.">
                <UploadCloud className="mr-2 h-4 w-4 text-blue-500" /> Migrate Local Data
             </Button>
          )}
          <Button onClick={openCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>
      </div>

      {showMigrationAlert && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
          <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">Local Data Found</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            You have product data stored in your browser from a previous session.
            Click the "Migrate Local Data" button to move this data to the central database.
            This local data will be removed after migration.
          </AlertDescription>
        </Alert>
      )}


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
              // Ensure the product passed to form has 'categories' as a comma-separated string
              product={editingProduct ? {
                ...editingProduct,
                // categories: Array.isArray(editingProduct.categories) ? editingProduct.categories.join(", ") : editingProduct.categories
              } as Product : undefined}
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
                <p><strong>Categories:</strong> {Array.isArray(viewingProduct.categories) ? viewingProduct.categories.join(", ") : "N/A"}</p>
                <p><strong>Stock:</strong> {viewingProduct.stock ?? "N/A"}</p>
                <p><strong>SKU:</strong> {viewingProduct.sku || "N/A"}</p>
                <div>
                  <strong>Attributes:</strong>
                  {viewingProduct.attributes && Object.keys(viewingProduct.attributes).length > 0 ? (
                    <ul className="list-disc pl-5">
                      {Object.entries(viewingProduct.attributes).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {String(value)}</li>
                      ))}
                    </ul>
                  ) : <p>N/A</p>}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Loading products from AlgorithmPress-GenDB...
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{Array.isArray(product.categories) ? product.categories.join(", ") : "N/A"}</TableCell>
                  <TableCell>{product.stock ?? "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openViewDialog(product)} className="mr-1" title="View Product Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="mr-1" title="Edit Product">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmDialog(product)} className="text-red-500 hover:text-red-700" title="Delete Product">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No products found in the database. Add some!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
