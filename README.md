# AlgorithmPress-GenDB: E-commerce & Product Database Engine 🔥

**AlgorithmPress-GenDB** is the core engine for creating and managing online product listings within the AlgorithmPress ecosystem. It transforms your AlgorithmPress site into a dynamic e-commerce or product catalog platform, excelling at handling products with detailed specifications, enabling comparisons, and facilitating online sales.

This system now utilizes a robust PostgreSQL backend (powered by Neon) for scalable and reliable data management, replacing the previous localStorage-based storage.

## ✨ Core Features (Phase 1 Implementation)

- **Product Management (CRUD via Database)**: Create, read, update, and delete products with support for:
    - Detailed descriptions, pricing, stock levels, SKUs.
    - Categorization (many-to-many relationship with categories).
    - Flexible product attributes/specifications (using JSONB).
    - Image URLs.
- **Category Management**: Dynamically create and link categories to products.
- **Database Backend**: PostgreSQL managed by **AlgorithmPress-GenDB** utilities, designed for Neon.
- **API-Driven**: Product data is managed and accessed through dedicated Next.js API routes.
- **Admin Interface**: Web UI for managing products in the database.
- **Public Product Display**:
    - Product listing page with client-side filtering (search, category, price).
    - Detailed individual product view pages.
- **Shopping Cart**: Zustand-based cart with localStorage persistence for cart items.
- **Product Comparison**: Feature to compare selected products.
- **Data Migration**: Utility to migrate product data from older localStorage setups to the new database.

## 🚧 Planned Features & Roadmap (Beyond Phase 1)

- **Advanced E-commerce Capabilities**:
    - Order Management System.
    - Customer Accounts & Authentication.
    - Payment Gateway Integrations (Stripe, PayPal, etc.).
    - Shipping & Tax Calculation.
    - Discounts, Coupons, and Promotions.
- **Enhanced Product Management**:
    - Support for Product Variations.
    - Related Products, Up-sells, Cross-sells.
    - Management of pre-defined attributes.
- **Storage Integration**:
    - Image uploads and management (potentially with Cubbit or other Web2/Web3 providers).
    - Support for digital products.
- **Configuration Export**:
    - Toggle to export e-commerce configuration (products, categories, settings) as PHPWasm-ready format.
    - Toggle to export configuration as NueJS-ready format.
- **Comprehensive API**: Full API support for programmatic store management.
- **SEO Enhancements**: Deeper SEO optimization for product and category pages.
- **User Interaction**: Product reviews and ratings system.
- **Scalability & Performance**: Further optimizations for large catalogs and high traffic.

## 🚀 How It Works (Current & Future)

1. _**Set up Neon Database**: Configure your `DATABASE_URL` and apply the schema from `sql/schema.sql` to initialize AlgorithmPress-GenDB._
2. _**(Optional) Migrate Data**: Use the admin interface to migrate any existing localStorage product data._
3. _**Manage Products**: Use the admin product management section to add/edit products, defining categories, attributes, stock, etc. All data is saved to the central database._
4. _**Customize Display**: (Future) More options for customizing product pages and listings._
5. _**User Interaction**: Users can browse products, filter them, view details, add to cart, and compare._
6. _**(Future) E-commerce Operations**: Users can proceed through a full checkout process with integrated payment and order management._

## 🎯 Perfect For

- Full-fledged E-commerce Stores
- Product Catalogs/Showcasing
- Specification-Heavy Product Sites (e.g., electronics, automotive parts)
- Wholesale Stores
- Hobbyist Websites for cataloging collections

## 🔗 Live Demo

[Link to be updated once deployed on Cubbit for AlgorithmPress.com/app]

---

This project aims to be the database manager and generator for AlgorithmPress.com/app.
