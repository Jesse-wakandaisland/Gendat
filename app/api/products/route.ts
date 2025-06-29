import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Product, ProductCategory } from "@/types/product"; // Assuming ProductCategory is defined
import { v4 as uuidv4 } from "uuid"; // For generating IDs if not handled by DB default (though DB has default)

// Helper function to get or create category IDs
async function getOrCreateCategoryIds(categoryNames: string[]): Promise<string[]> {
  if (!categoryNames || categoryNames.length === 0) {
    return [];
  }

  const categoryIds: string[] = [];
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-'); // Simple slug generation
    try {
      let categoryResult = await query<{ id: string }>("SELECT id FROM categories WHERE name = $1 OR slug = $2", [name, slug]);
      if (categoryResult.rows.length > 0) {
        categoryIds.push(categoryResult.rows[0].id);
      } else {
        // Create new category
        const newCategoryResult = await query<{ id: string }>(
          "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
          [name, slug]
        );
        if (newCategoryResult.rows.length > 0) {
          categoryIds.push(newCategoryResult.rows[0].id);
          console.log(`AlgorithmPress-GenDB: Created new category '${name}' with ID ${newCategoryResult.rows[0].id}`);
        } else {
          // This should ideally not happen if INSERT RETURNING id works
          console.error(`AlgorithmPress-GenDB: Failed to create category '${name}' and retrieve ID.`);
        }
      }
    } catch (error), {
      console.error(`AlgorithmPress-GenDB: Error processing category '${name}':`, error);
      // Decide how to handle: skip this category, or fail the whole product creation?
      // For now, skipping the problematic category.
    }
  }
  return categoryIds;
}


export async function POST(request: NextRequest) {
  try {
    const productData = await request.json() as Omit<Product, "id" | "createdAt" | "updatedAt"> & { categoryNames?: string[] };

    const { name, description, price, images, categoryNames, attributes, stock, sku } = productData;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Missing required fields: name and price" }, { status: 400 });
    }

    // Convert category names to category IDs
    const resolvedCategoryIds = await getOrCreateCategoryIds(categoryNames || []);

    // Insert product
    const productResult = await query<Product>(
      `INSERT INTO products (name, description, price, images, attributes, stock, sku)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, images || [], attributes || {}, stock, sku]
    );

    const newProduct = productResult.rows[0];

    if (!newProduct) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // Link product to categories
    if (resolvedCategoryIds.length > 0) {
      for (const categoryId of resolvedCategoryIds) {
        try {
            await query(
                "INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)",
                [newProduct.id, categoryId]
            );
        } catch (error) {
            // Log error, but don't fail the whole request if one category link fails (e.g. duplicate)
            // This might happen if a category link already exists due to some race condition or retry,
            // though with a new product it's less likely unless category creation is duplicated.
            // The PRIMARY KEY on product_categories should prevent duplicates silently.
            console.error(`AlgorithmPress-GenDB: Error linking product ${newProduct.id} to category ${categoryId}:`, error);
        }
      }
    }

    // Fetch the full product with category names for the response
    const finalProduct = await getFullProductDetails(newProduct.id);
    return NextResponse.json(finalProduct, { status: 201 });

  } catch (error: any) {
    console.error("AlgorithmPress-GenDB: Error creating product:", error);
    // Check for unique constraint violation for SKU
    if (error.code === '23505' && error.constraint === 'products_sku_key') {
        return NextResponse.json({ error: `SKU '${error.detail?.match(/\(([^)]+)\)/)?.[1]}' already exists.` }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, a simple fetch. Later, add pagination, filtering, sorting from query params.
    const productsResult = await query<Product>(`
      SELECT
        p.*,
        COALESCE(json_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '[]') as categories
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // The 'categories' from query is JSON string, parse it.
    const productsWithCategories = productsResult.rows.map(p => ({
        ...p,
        categories: typeof p.categories === 'string' ? JSON.parse(p.categories) : p.categories
    }));

    return NextResponse.json(productsWithCategories);
  } catch (error: any) {
    console.error("AlgorithmPress-GenDB: Error fetching products:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}


// Helper to fetch full product details including category names
// This will also be used by the [productId] route
export async function getFullProductDetails(productId: string): Promise<Product | null> {
    const productDetailResult = await query<Product>(`
        SELECT
            p.*,
            COALESCE(json_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '[]') as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = $1
        GROUP BY p.id
    `, [productId]);

    if (productDetailResult.rows.length === 0) {
        return null;
    }
    const product = productDetailResult.rows[0];
    return {
        ...product,
        categories: typeof product.categories === 'string' ? JSON.parse(product.categories) : product.categories
    };
}
