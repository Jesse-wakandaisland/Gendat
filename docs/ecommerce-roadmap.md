# AlgorithmPress-GenDB: E-commerce Roadmap & Feature Outline

This document outlines the conceptual architecture for future e-commerce enhancements within the AlgorithmPress-GenDB ecosystem, including configuration export and advanced features.

## 1. Core Principle: AlgorithmPress-GenDB as the Source of Truth

AlgorithmPress-GenDB, powered by its PostgreSQL database, will serve as the central repository and source of truth for all e-commerce data including:
- Products (details, specs, images, pricing, stock)
- Categories
- Orders
- Customers
- Store Settings & Configurations

## 2. Configuration Export (PHPWasm & NueJS)

The goal is to allow an administrator to export the e-commerce configuration for use in different environments or contexts, specifically PHPWasm and NueJS applications.

### 2.1. Data to Export:
- **Products**: All product details (name, description, price, SKU, attributes, image URLs, stock levels).
- **Categories**: Category hierarchy and details.
- **Store Settings (Future)**: Basic store settings like store name, currency, default units, etc. (once these are implemented).

### 2.2. Export Format and Mechanism:

An API endpoint (e.g., `/api/admin/export/config`) will handle requests for configuration export.
Query parameters will specify the target format (e.g., `?format=phpwasm` or `?format=nuejs`).

**Structure of Exported Data (Generic JSON first):**
The primary export will be a structured JSON object. This JSON can then be transformed into the specific needs of PHPWasm or NueJS.

```json
{
  "version": "1.0",
  "exportedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "storeName": "My AlgorithmPress Store", // Example future setting
  "currency": "USD", // Example future setting
  "categories": [
    {
      "id": "uuid-cat-1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "All electronic items",
      "parentId": null // For hierarchical categories
    }
    // ... more categories
  ],
  "products": [
    {
      "id": "uuid-prod-1",
      "name": "Super Laptop",
      "description": "A powerful laptop",
      "price": 1299.99,
      "sku": "LPTP-001",
      "stock": 50,
      "categories": ["uuid-cat-1"], // IDs of categories it belongs to
      "images": ["url1.jpg", "url2.jpg"],
      "attributes": {
        "RAM": "16GB",
        "Storage": "512GB SSD"
      },
      "variants": [] // Future: product variants
    }
    // ... more products
  ]
  // Future: "settings": { ... }
}
```

### 2.3. PHPWasm Export (`format=phpwasm`):

- **Output**: A `.php` file or a serialized PHP array structure that can be easily included or parsed by a PHPWasm environment.
- **Considerations**:
    - The PHPWasm environment would need code to interpret this data (e.g., hydrate into PHP classes or use as a data source).
    - The export could generate PHP code that defines constants or static arrays.
    - Example snippet (conceptual):
      ```php
      <?php // Filename: algopress_config.php
      return [
          'version' => '1.0',
          'categories' => [ /* ... categories as associative arrays ... */ ],
          'products' => [ /* ... products as associative arrays ... */ ],
      ];
      ```
    - Alternatively, the JSON itself could be embedded, and the PHPWasm runtime would `json_decode` it.

### 2.4. NueJS Export (`format=nuejs`):

- **Output**: A `.js` or `.json` file that can be directly imported and used within a NueJS application.
- **Considerations**:
    - NueJS components could directly consume this JSON data.
    - The structure would likely be very similar to the generic JSON, as JavaScript natively handles it.
    - Example (conceptual, if a `.js` module):
      ```javascript
      // Filename: algopress-config.js
      export const config = { /* ... the entire JSON structure ... */ };
      export default config;
      ```
    - If it's a plain `.json` file, NueJS would fetch and parse it.

### 2.5. Implementation Steps:
1. Develop the core JSON export functionality from the database via the API.
2. Create transformation layers/functions for PHP-array-like output and JS module output.
3. Add UI elements (e.g., buttons in admin panel) to trigger these exports.

## 3. Advanced E-commerce Features

### 3.1. Order Management:
- **Schema**: `orders` table (customer ID, order date, status, total amount, shipping address, billing address), `order_items` table (link to products, quantity, price at time of sale).
- **API**: Endpoints for creating orders (on successful checkout), viewing order history (for users and admins), updating order status (admin).
- **Admin UI**: Interface for viewing and managing orders.

### 3.2. Customer Accounts:
- **Schema**: `users` or `customers` table (name, email, password hash, addresses, etc.).
- **Authentication**: Integration with a Next.js authentication solution (e.g., NextAuth.js).
- **API**: Endpoints for registration, login, profile management.
- **UI**: User profile pages, order history.

### 3.3. Payment Gateway Integration:
- **Strategy**: Integrate with popular gateways like Stripe and/or PayPal.
- **Client-side**: Use client-side SDKs for collecting payment information securely (e.g., Stripe Elements).
- **Server-side**: API endpoints to create payment intents, confirm payments, and handle webhooks from payment providers.
- **Order Update**: Link successful payments to order creation/update in the database.

### 3.4. Storage for Product Images (Web3/Cubbit & Web2):
- **Current**: Image URLs are stored as text. No upload mechanism.
- **Future Strategy**:
    1. **Upload API**: Create an API endpoint (e.g., `/api/products/upload-image`) that can handle image file uploads.
    2. **Storage Abstraction Layer**: Develop a service that can interface with different storage providers.
        - **Configuration**: Admin settings to choose and configure storage providers (e.g., local filesystem for dev, Cubbit, other S3-compatible services, IPFS for Web3).
    3. **Cubbit Integration**:
        - Use Cubbit's SDK or S3-compatible API.
        - Store images on Cubbit and save the returned URL/identifier in the `products` table.
    4. **Web3 Storage (e.g., IPFS)**:
        - Integrate with an IPFS pinning service (e.g., Pinata, web3.storage).
        - Upload image to IPFS, get CID, and store the IPFS gateway URL or CID.
    5. **Database**: The `products` table's `images` array will store the final URLs pointing to the chosen storage provider.
- **Image Processing**: Consider adding image resizing/optimization during the upload process.

### 3.5. Other E-commerce Features (Brief):
- **Product Variations**: Extend product schema to support variations (e.g., size, color) with their own SKU, price, stock.
- **Inventory Management**: More granular stock updates, low stock alerts.
- **Shipping & Tax**: Integration with services or configurable rules for calculating shipping costs and taxes.
- **Discounts & Coupons**: Schema and logic for applying discounts and coupon codes.
- **Reviews & Ratings**: System for users to submit product reviews.

## 4. API Design Philosophy
- Continue with a RESTful or GraphQL API approach using Next.js API routes.
- Ensure APIs are secure, well-documented, and versioned if necessary.
- Provide clear separation between admin-only APIs and public APIs.

This roadmap provides a high-level overview. Each major feature (e.g., Order Management, Payment Integration) will require its own detailed planning and iterative development.
The focus for "AlgorithmPress-GenDB" will be on providing a solid, extensible backend foundation for these e-commerce functionalities.
```
