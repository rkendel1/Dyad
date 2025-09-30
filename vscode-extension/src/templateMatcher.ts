/**
 * Template matching utility for auto-selecting templates based on natural language descriptions
 */

export interface Template {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    score?: number;
}

// Template definitions with keywords for matching
export const TEMPLATES: Template[] = [
    {
        id: 'react',
        title: 'React.js Template',
        description: 'Uses React.js, Vite, Shadcn, Tailwind and TypeScript.',
        keywords: ['react', 'vite', 'simple', 'basic', 'starter', 'frontend', 'spa', 'single page']
    },
    {
        id: 'next',
        title: 'Next.js Template',
        description: 'Uses Next.js, React.js, Shadcn, Tailwind and TypeScript.',
        keywords: ['next', 'nextjs', 'ssr', 'server side', 'seo', 'full stack', 'web app']
    },
    {
        id: 'stripe-ecommerce',
        title: 'Stripe E-commerce Template',
        description: 'Next.js e-commerce store with Stripe payments, product catalog, shopping cart, and checkout flow.',
        keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'payment', 'stripe', 'checkout', 'cart', 'product', 'sell']
    },
    {
        id: 'saas-starter',
        title: 'SaaS Starter Template',
        description: 'Full-stack SaaS boilerplate with authentication, subscription billing, multi-tenancy, and admin dashboard.',
        keywords: ['saas', 'subscription', 'billing', 'multi-tenant', 'auth', 'authentication', 'dashboard', 'admin']
    },
    {
        id: 'blog-mdx',
        title: 'MDX Blog Template',
        description: 'Modern blog template with MDX content, syntax highlighting, SEO optimization, and content management system.',
        keywords: ['blog', 'mdx', 'content', 'cms', 'article', 'post', 'writing', 'markdown']
    },
    {
        id: 'auth-clerk',
        title: 'Authentication Template',
        description: 'Complete authentication solution with Clerk, user profiles, role-based access, and protected routes.',
        keywords: ['auth', 'authentication', 'login', 'signup', 'user', 'clerk', 'profile', 'role', 'permission']
    },
    {
        id: 'dashboard-admin',
        title: 'Admin Dashboard Template',
        description: 'Feature-rich admin dashboard with data visualization, charts, tables, user management, and analytics.',
        keywords: ['dashboard', 'admin', 'analytics', 'chart', 'visualization', 'data', 'table', 'metrics', 'management']
    },
    {
        id: 'contentful-blog',
        title: 'Contentful Blog Template',
        description: 'Blog template with Contentful CMS, GraphQL, responsive design, and SEO optimization.',
        keywords: ['contentful', 'blog', 'cms', 'graphql', 'headless', 'content']
    },
    {
        id: 'medusa-ecommerce',
        title: 'Medusa E-commerce Template',
        description: 'Headless commerce template with Medusa backend, cart functionality, and modern storefront.',
        keywords: ['medusa', 'ecommerce', 'headless', 'commerce', 'shop', 'store']
    }
];

/**
 * Match templates based on a natural language description
 * @param description User's description of the app they want to build
 * @returns Array of templates sorted by relevance score
 */
export function matchTemplates(description: string): Template[] {
    const lowerDescription = description.toLowerCase();
    const words = lowerDescription.split(/\s+/);
    
    // Score each template based on keyword matches
    const scoredTemplates = TEMPLATES.map(template => {
        let score = 0;
        
        // Check for exact keyword matches
        template.keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            
            // Exact phrase match (higher score)
            if (lowerDescription.includes(keywordLower)) {
                score += 10;
            }
            
            // Individual word matches (lower score)
            words.forEach(word => {
                if (word === keywordLower || keywordLower.includes(word)) {
                    score += 3;
                }
            });
        });
        
        // Bonus points for title match
        if (lowerDescription.includes(template.title.toLowerCase())) {
            score += 20;
        }
        
        return { ...template, score };
    });
    
    // Sort by score (highest first) and filter out zero scores
    return scoredTemplates
        .filter(t => t.score > 0)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Get the best matching template
 * @param description User's description
 * @returns The highest scoring template or the default React template
 */
export function getBestTemplate(description: string): Template {
    const matches = matchTemplates(description);
    return matches.length > 0 ? matches[0] : TEMPLATES[0]; // Default to React template
}

/**
 * Format template choices for VS Code quick pick
 * @param templates Array of templates
 * @returns Quick pick items
 */
export function formatTemplateChoices(templates: Template[]) {
    return templates.map(template => ({
        label: template.title,
        description: template.description,
        detail: template.score ? `Relevance score: ${template.score}` : undefined,
        templateId: template.id
    }));
}
