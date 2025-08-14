# Multi-Tenant e-reserve with Platform Fees

A modern e-reserve platform built with Next.js, Payload CMS, and Stripe, featuring multi-tenant architecture and platform fees capabilities.

## Features

- 🏬 Multi-tenant architecture
- 🌐 Vendor subdomains
- 🎨 Custom merchant storefronts
- 💳 Stripe Connect integration
- 💰 Automatic platform fees
- ⭐ Product ratings & reviews
- 📚 User purchase library
- 🧑‍💼 Role-based access control
- 🛠️ Admin dashboard
- 🧾 Merchant dashboard
- 🧱 Payload CMS backend
- 🗂️ Category & product filtering
- 🔍 Search functionality
- 🖼️ Image upload support
- 🌍 Internationalization (i18n) - 5 languages supported
- ⚙️ Built with Next.js 15
- 🎨 TailwindCSS V4 styling
- 💅 ShadcnUI components

## Prerequisites

- Node.js 18+ or Bun 1.0+
- MongoDB Atlas account
- Stripe account
- Vercel account (for Blob storage)

## Getting Started

### Installation

#### Using Bun (Recommended)

```bash
# Clone the repository
git clone https://github.com/RurikV/vreserv.git
cd vreserv

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
```

#### Using npm

```bash
# Clone the repository
git clone https://github.com/RurikV/vreserv.git
cd vreserv

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

#### Using yarn

```bash
# Clone the repository
git clone https://github.com/RurikV/vreserv.git
cd vreserv

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URI=your_mongodb_uri
PAYLOAD_SECRET=your_payload_secret

# Global
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING=false

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Subdomain Routing Configuration

The platform supports wildcard subdomain routing, allowing each vendor to have their own unique subdomain (e.g., `vendorname.yourdomain.com`). This feature is controlled by the `NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING` environment variable.

#### Development
By default, subdomain routing is disabled in development (`NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING="false"`), and all stores are accessed through routes like:
```
http://localhost:3000/tenants/[tenant-slug]
```

#### Production
To enable subdomain routing in production:

1. Configure your DNS provider with a wildcard subdomain record:
   ```
   *.yourdomain.com  →  your-vercel-deployment.vercel.app
   ```

2. Update your environment variables:
   ```env
   NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com
   NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING="true"
   ```

Once enabled, stores will be accessible through their unique subdomains:
```
https://tenantslug.yourdomain.com
```

#### Notes
- Make sure your hosting provider (e.g., Vercel) supports wildcard subdomains
- Each subdomain will automatically serve the corresponding store's content
- SSL certificates should be configured to support wildcard subdomains
- The main marketplace will remain accessible at your root domain

### Database Setup

```bash
# Using Bun
bun run db:fresh
bun run db:seed

# Using npm
npm run db:fresh
npm run db:seed

# Using yarn
yarn db:fresh
yarn db:seed
```

### Development

```bash
# Using Bun
bun run dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Testing

The project uses Vitest for testing with React Testing Library and Jest DOM for comprehensive test coverage.

```bash
# Run tests once
bun run test
# or
npm run test

# Run tests in watch mode
bun run test:watch
# or
npm run test:watch

# Run tests with coverage report
bun run test:coverage
# or
npm run test:coverage
```

## Localization

The platform provides comprehensive internationalization (i18n) support using Next.js Intl, with 5 languages currently supported.

### Supported Languages

- 🇺🇸 **English (en)** - Default language
- 🇫🇷 **French (fr)**
- 🇮🇹 **Italian (it)**
- 🇪🇪 **Estonian (et)**
- 🇷🇺 **Russian (ru)**

### Directory Structure

Translation files are organized in the `messages/` directory:

```
messages/
├── en.json      # English translations
├── fr.json      # French translations
├── it.json      # Italian translations
├── et.json      # Estonian translations
└── ru.json      # Russian translations
```

### Configuration

The i18n configuration is handled by several key files:

- **`src/i18n.ts`** - Main configuration with supported locales and message loading
- **`src/middleware.ts`** - Handles locale detection and routing
- **`src/navigation.ts`** - Locale-aware navigation utilities
- **`next.config.ts`** - Next.js Intl plugin integration

### Translation Structure

Each translation file contains organized keys for different sections:

```json
{
  "navigation": {
    "home": "Home",
    "categories": "Categories",
    "library": "Library"
  },
  "auth": {
    "login": "Log in",
    "signup": "Start selling"
  },
  "cart": {
    "addToCart": "Add to cart",
    "removeFromCart": "Remove from cart"
  },
  "categories": {
    "business-money": "Business & Money",
    "software-development": "Software Development"
  }
}
```

### Adding New Languages

To add a new language:

1. **Create translation file**: Add a new JSON file in `messages/` (e.g., `messages/de.json`)

2. **Update locale configuration** in `src/i18n.ts`:
   ```typescript
   export const locales = ['en', 'fr', 'it', 'et', 'ru', 'de'] as const;
   ```

3. **Copy structure from existing file**: Use `messages/en.json` as template and translate all keys

4. **Test the new locale**: Navigate to `/de/` to verify the new language works

### Adding New Translation Keys

To add new translation keys:

1. **Add to all language files**: Ensure consistency across all supported locales
2. **Use in components**:
   ```tsx
   import { useTranslations } from 'next-intl';
   
   export default function MyComponent() {
     const t = useTranslations('navigation');
     return <span>{t('newKey')}</span>;
   }
   ```

### URL Structure

- **Development**: `http://localhost:3000/[locale]/...`
- **Production**: `https://yourdomain.com/[locale]/...`

Examples:
- English: `/en/` or `/` (default)
- French: `/fr/`
- Italian: `/it/`
- Estonian: `/et/`
- Russian: `/ru/`

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint
- `test` - Run tests once
- `test:watch` - Run tests in watch mode
- `test:coverage` - Run tests with coverage report
- `generate:types` - Generate Payload CMS types
- `db:fresh` - Reset and migrate database
- `db:seed` - Seed database with initial data
