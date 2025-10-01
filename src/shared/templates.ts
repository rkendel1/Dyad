export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  isOfficial: boolean;
  isExperimental?: boolean;
  requiresNeon?: boolean;
}

// API Template interface from the external API
export interface ApiTemplate {
  githubOrg: string;
  githubRepo: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const DEFAULT_TEMPLATE_ID = "react";
export const DEFAULT_TEMPLATE = {
  id: "react",
  title: "React.js Template",
  description: "Uses React.js, Vite, Shadcn, Tailwind and TypeScript.",
  imageUrl:
    "https://github.com/user-attachments/assets/5b700eab-b28c-498e-96de-8649b14c16d9",
  isOfficial: true,
};

const PORTAL_MINI_STORE_ID = "portal-mini-store";
export const NEON_TEMPLATE_IDS = new Set<string>([PORTAL_MINI_STORE_ID]);

export const localTemplatesData: Template[] = [
  DEFAULT_TEMPLATE,
  {
    id: "next",
    title: "Next.js Template",
    description: "Uses Next.js, React.js, Shadcn, Tailwind and TypeScript.",
    imageUrl:
      "https://github.com/user-attachments/assets/96258e4f-abce-4910-a62a-a9dff77965f2",
    githubUrl: "https://github.com/dyad-sh/nextjs-template",
    isOfficial: true,
  },
  {
    id: PORTAL_MINI_STORE_ID,
    title: "Portal: Mini Store Template",
    description:
      "Uses Neon DB, Payload CMS, and Next.js for content-driven e-commerce.",
    imageUrl:
      "https://github.com/user-attachments/assets/ed86f322-40bf-4fd5-81dc-3b1d8a16e12b",
    githubUrl: "https://github.com/dyad-sh/portal-mini-store-template",
    isOfficial: true,
    isExperimental: true,
    requiresNeon: true,
  },
  // New templates with popular service integrations
  {
    id: "stripe-ecommerce",
    title: "Stripe E-commerce Template",
    description:
      "Next.js e-commerce store with Stripe payments, product catalog, shopping cart, and checkout flow.",
    imageUrl:
      "https://github.com/user-attachments/assets/5b700eab-b28c-498e-96de-8649b14c16d9",
    githubUrl: "https://github.com/Skolaczk/next-starter",
    isOfficial: true,
  },
  {
    id: "blog-mdx",
    title: "MDX Blog Template",
    description:
      "Modern blog template with MDX content, syntax highlighting, SEO optimization, and content management system.",
    imageUrl:
      "https://github.com/user-attachments/assets/ed86f322-40bf-4fd5-81dc-3b1d8a16e12b",
    githubUrl: "https://github.com/ChangoMan/nextjs-mdx-blog",
    isOfficial: true,
  },
  {
    id: "auth-clerk",
    title: "Authentication Template",
    description:
      "Complete authentication solution with Clerk, user profiles, role-based access, and protected routes.",
    imageUrl:
      "https://github.com/user-attachments/assets/5b700eab-b28c-498e-96de-8649b14c16d9",
    githubUrl: "https://github.com/adrianhajdin/saas-template",
    isOfficial: true,
  },
  {
    id: "dashboard-admin",
    title: "Admin Dashboard Template",
    description:
      "Feature-rich admin dashboard with data visualization, charts, tables, user management, and analytics.",
    imageUrl:
      "https://github.com/user-attachments/assets/96258e4f-abce-4910-a62a-a9dff77965f2",
    githubUrl: "https://github.com/matt765/spireflow",
    isOfficial: true,
  },
  {
    id: "contentful-blog",
    title: "Contentful Blog Template",
    description:
      "Blog template with Contentful CMS, GraphQL, responsive design, and SEO optimization.",
    imageUrl:
      "https://github.com/user-attachments/assets/ed86f322-40bf-4fd5-81dc-3b1d8a16e12b",
    githubUrl: "https://github.com/contentful/template-blog-webapp-nextjs",
    isOfficial: true,
  },
  {
    id: "medusa-ecommerce",
    title: "Medusa E-commerce Template",
    description:
      "Headless commerce template with Medusa backend, cart functionality, and modern storefront.",
    imageUrl:
      "https://github.com/user-attachments/assets/5b700eab-b28c-498e-96de-8649b14c16d9",
    githubUrl: "https://github.com/medusajs/nextjs-starter-medusa",
    isOfficial: true,
  },
];
