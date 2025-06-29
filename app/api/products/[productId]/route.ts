import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Product } from "@/types/product";
import { getFullProductDetails } from "../route"; // Import from the parent route.ts

interface RouteParams {
  params: {
    productId: string;
  };
}

// GET a single product by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { productId } = params;
  try {
    const product = await getFullProductDetails(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    console.error(`AlgorithmPress-GenDB: Error fetching product ${productId}:`, error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// Helper function to get or create category IDs (similar to the one in main products route)
// This could be refactored into a shared lib/categories.ts if it grows more complex
async function getOrCreateCategoryIds(categoryNames: string[]): Promise<string[]> {
  if (!categoryNames || categoryNames.length === 0) {
    return [];
  }
  const categoryIds: string[] = [];
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    try {
      let categoryResult = await query<{ id: string }>("SELECT id FROM categories WHERE name = $1 OR slug = $2", [name, slug]);
      if (categoryResult.rows.length > 0) {
        categoryIds.push(categoryResult.rows[0].id);
      } else {
        const newCategoryResult = await query<{ id: string }>(
          "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
          [name, slug]
        );
        if (newCategoryResult.rows.length > 0) {
          categoryIds.push(newCategoryResult.rows[0].id);
        }
      }
    } catch (error) {
      console.error(`AlgorithmPress-GenDB: Error processing category '${name}' during update:`, error);
    }
  }
  return categoryIds;
}


// PUT (update) a product by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { productId } = params;
  try {
    const productData = await request.json() as Partial<Omit<Product, "id" | "createdAt" | "updatedAt">> & { categoryNames?: string[] };
    const { name, description, price, images, categoryNames, attributes, stock, sku } = productData;

    // Fetch current product to see if it exists
    const existingProductResult = await query("SELECT * FROM products WHERE id = $1", [productId]);
    if (existingProductResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Dynamically build the update query based on provided fields
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      queryParams.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      queryParams.push(description);
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      queryParams.push(price);
    }
    if (images !== undefined) {
      updateFields.push(`images = $${paramIndex++}`);
      queryParams.push(images);
    }
    if (attributes !== undefined) {
      updateFields.push(`attributes = $${paramIndex++}`);
      queryParams.push(attributes);
    }
    if (stock !== undefined) {
      updateFields.push(`stock = $${paramIndex++}`);
      queryParams.push(stock);
    }
    if (sku !== undefined) {
      updateFields.push(`sku = $${paramIndex++}`);
      queryParams.push(sku);
    }

    // Always update the 'updated_at' timestamp (handled by DB trigger, but good to be explicit if not)
    // updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 0 && categoryNames === undefined) {
      return NextResponse.json({ message: "No fields to update. For category updates, provide 'categoryNames'." }, { status: 200 });
    }

    if (updateFields.length > 0) {
        queryParams.push(productId);
        const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
        await query<Product>(updateQuery, queryParams);
    }


    // Handle category updates
    if (categoryNames !== undefined) {
      const resolvedCategoryIds = await getOrCreateCategoryIds(categoryNames);
      // Delete existing category links for this product
      await query("DELETE FROM product_categories WHERE product_id = $1", [productId]);
      // Add new category links
      for (const categoryId of resolvedCategoryIds) {
        try {
            await query(
                "INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)",
                [productId, categoryId]
            );
        } catch (error) {
             console.error(`AlgorithmPress-GenDB: Error linking product ${productId} to category ${categoryId} during update:`, error);
        }
      }
    }

    const updatedProduct = await getFullProductDetails(productId);
    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    console.error(`AlgorithmPress-GenDB: Error updating product ${productId}:`, error);
     if (error.code === '23505' && error.constraint === 'products_sku_key') {
        return NextResponse.json({ error: `SKU '${error.detail?.match(/\(([^)]+)\)/)?.[1]}' already exists for another product.` }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// DELETE a product by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { productId } = params;
  try {
    // First, delete associations in product_categories (though CASCADE should handle this)
    // await query("DELETE FROM product_categories WHERE product_id = $1", [productId]);

    const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [productId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Product not found or already deleted" }, { status: 404 });
    }
    return NextResponse.json({ message: `Product ${productId} deleted successfully`, deletedProduct: result.rows[0] });
  } catch (error: any) {
    console.error(`AlgorithmPress-GenDB: Error deleting product ${productId}:`, error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
