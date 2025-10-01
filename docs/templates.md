# Dyad Templates

Dyad provides a wide variety of starter templates to help you quickly build different types of applications. Each template comes pre-configured with popular integrations and best practices.

## Available Templates

### Core Templates

#### React.js Template (Default)

- **ID**: `react`
- **Description**: Uses React.js, Vite, Shadcn, Tailwind and TypeScript.
- **Best for**: General web applications, component libraries, and frontend projects.

#### Next.js Template

- **ID**: `next`
- **Description**: Uses Next.js, React.js, Shadcn, Tailwind and TypeScript.
- **Best for**: Full-stack applications, static sites, and server-side rendered apps.

#### Portal: Mini Store Template

- **ID**: `portal-mini-store`
- **Description**: Uses Neon DB, Payload CMS, Next.js
- **Best for**: Content-driven e-commerce sites with headless CMS.
- **Special**: Requires Neon database setup (experimental).

### E-commerce Templates

#### Stripe E-commerce Template

- **ID**: `stripe-ecommerce`
- **Description**: Next.js e-commerce store with Stripe payments, product catalog, shopping cart, and checkout flow.
- **Best for**: Online stores, marketplaces, and payment-integrated applications.
- **Integrations**: Stripe, React, TypeScript, Tailwind CSS

#### Medusa E-commerce Template

- **ID**: `medusa-ecommerce`
- **Description**: Headless commerce template with Medusa backend, cart functionality, and modern storefront.
- **Best for**: Advanced e-commerce with custom backend requirements.
- **Integrations**: Medusa.js, TypeScript, Tailwind CSS

### SaaS & Authentication Templates

#### Authentication Template

- **ID**: `auth-clerk`
- **Description**: Complete authentication solution with Clerk, user profiles, role-based access, and protected routes.
- **Best for**: Applications requiring robust user management, SaaS applications.
- **Integrations**: Clerk, user management, role-based access control

### Content & Blog Templates

#### MDX Blog Template

- **ID**: `blog-mdx`
- **Description**: Modern blog template with MDX content, syntax highlighting, SEO optimization, and content management system.
- **Best for**: Developer blogs, documentation sites, content-focused websites.
- **Integrations**: MDX, Contentlayer, syntax highlighting

#### Contentful Blog Template

- **ID**: `contentful-blog`
- **Description**: Blog template with Contentful CMS, GraphQL, responsive design, and SEO optimization.
- **Best for**: Content-managed blogs, news sites, editorial platforms.
- **Integrations**: Contentful CMS, GraphQL, SEO optimization

### Dashboard & Admin Templates

#### Admin Dashboard Template

- **ID**: `dashboard-admin`
- **Description**: Feature-rich admin dashboard with data visualization, charts, tables, user management, and analytics.
- **Best for**: Admin panels, analytics dashboards, business intelligence apps.
- **Integrations**: Charts, data visualization, responsive design

## How Templates Work

When you create a new app in Dyad, you can select from these templates to get started quickly. Each template:

1. **Clones from GitHub**: Templates are sourced from well-maintained GitHub repositories
2. **Pre-configured**: Comes with dependencies, configuration, and initial setup
3. **Customizable**: You can modify and extend the template to fit your needs
4. **Tested**: All templates are verified to work with Dyad's development environment

## Using Templates

1. Open Dyad and click "Create New App"
2. Browse the available templates in the template selector
3. Choose the template that best fits your project needs
4. Dyad will clone the template and set up your development environment
5. Start building with AI assistance on your pre-configured codebase

## Contributing Templates

If you'd like to add a new template to Dyad, please follow the [Add Template guide](https://dyad.sh/docs/templates/add-template) and create an issue using our template request form.

### Template Requirements

- Must be open-source (MIT, Apache 2.0, or similar)
- Should follow modern web development best practices
- Must be compatible with Dyad's development environment
- Should include proper documentation and setup instructions
