# Prisma Documentation

The Prisma Documentation is a comprehensive technical documentation site built with Docusaurus 3.9.2 (configured for Docusaurus v4 compatibility via future flag) that serves as the official documentation hub for Prisma's suite of database tools and services. The project provides detailed guides, API references, and tutorials for Prisma ORM, Prisma Studio, Prisma Accelerate, Prisma Optimize, and Prisma Postgres. Built on a modern React 19.1.1-based static site generator, it features dynamic content switching, interactive code examples, and extensive customization through custom MDX 3 components and theme modifications.

This documentation site is designed to support developers at every stage of their journey with Prisma products, from quick-start tutorials to advanced database optimization techniques. The architecture leverages Docusaurus's plugin system to extend functionality with custom features like LLM-friendly content generation (using both the @signalwire/docusaurus-plugin-llms-txt plugin and a custom plugin that produces llms.txt and llms-full.txt), database/language switchers in documentation pages, and integration with third-party services including Algolia DocSearch, PostHog analytics (via custom client plugin at client-plugins/posthog-docusaurus), Kapa.ai for AI-powered assistance with enhanced branding configuration, Tolt analytics, Common Room tracking, and CookieYes for consent management. The content is organized in a hierarchical structure with numeric prefixes for ordering, making it easy to maintain and navigate across multiple product documentation sections.

## Development Server

Start the local development server to preview documentation changes in real-time.

```bash
# Install dependencies (requires Node.js >= 18.0)
npm install

# Start development server
npm run start

# The site will be available at http://localhost:3000
# Hot reload is enabled for instant preview of changes

# Alternative command
npm run docusaurus start  # Direct docusaurus command
```

## Build and Deployment

Build the static site for production deployment to hosting platforms.

```bash
# Clean previous build artifacts
npm run clean
# Also available as: npm run clear

# Build static site to ./build directory
npm run build

# Serve the production build locally for testing
npm run serve

# Deploy to Cloudflare Pages
npm run deploy
# This runs: npm run build && wrangler pages deploy ./build
# Requires wrangler (v4.49.0+) to be configured with Cloudflare credentials
```

## Content Structure

All documentation content is written in MDX format and organized in the `content/` directory with numeric prefixes for ordering.

```bash
content/
├── 100-getting-started/     # Getting started guides and quickstarts
├── 200-orm/                 # Prisma ORM documentation
├── 250-postgres/            # Prisma Postgres documentation
├── 300-accelerate/          # Prisma Accelerate documentation
├── 500-platform/            # Platform and CLI documentation
├── 600-about/               # About pages
├── 700-optimize/            # Prisma Optimize documentation
├── 800-guides/              # Integration guides
└── 900-ai/                  # AI-related documentation

# Example MDX file structure
# content/100-getting-started/01-quickstart-prismaPostgres.mdx
```

**Frontmatter example:**

```mdx
---
title: 'Quickstart with Prisma Postgres'
sidebar_label: 'Quickstart'
metaTitle: 'Quickstart with TypeScript & Prisma Postgres'
metaDescription: 'Get started with Prisma ORM in 5 minutes.'
search: true
sidebar_class_name: hidden-sidebar
dbSwitcher: ['prismaPostgres', 'sqlite']
slugSwitch: /getting-started/quickstart-
sidebar_custom_props: { badge: '5 min' }
---

# Your content here

<Admonition type="note">
Important information for readers
</Admonition>
```

## Custom MDX Components

The documentation extends standard Markdown with custom React components for enhanced interactivity.

**Admonitions:**

```mdx
<Admonition type="note">
This is a note that provides helpful context.
</Admonition>

<Admonition type="warning">
This is a warning about potential issues.
</Admonition>

<Admonition type="tip">
This is a tip to improve user experience.
</Admonition>
```

**Tabs for Multi-Option Content:**

```mdx
<Tabs>
<TabItem value="typescript" label="TypeScript">

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
```

</TabItem>
<TabItem value="javascript" label="JavaScript">

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
```

</TabItem>
</Tabs>
```

**Code with Collapsible Results:**

```mdx
<CodeWithResult outputResultText="Migration" expanded={false}>

```bash
npx prisma migrate dev --name init
```

```bash
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "mydb"

Applying migration `20240101000000_init`

The following migration(s) have been applied:

migrations/
  └─ 20240101000000_init/
    └─ migration.sql

✔ Generated Prisma Client
```

</CodeWithResult>
```

**Document Card Lists:**

```mdx
<DocCardList />

<!-- Automatically generates cards for all child pages -->
```

**Collapsible Sections:**

```mdx
<details>
<summary>Click to expand</summary>

Additional content that is hidden by default.

</details>
```

**Custom Links:**

```mdx
<!-- Internal link with search params preserved -->
<Link to="/orm/prisma-client">Prisma Client docs</Link>

<!-- External link (automatically gets external icon) -->
[External resource](https://github.com/prisma/prisma)

<!-- Button-style link -->
<Button href="/getting-started/quickstart">Get Started</Button>
```

## Sidebars Configuration

Sidebars are configured in `sidebars.ts` with support for multiple navigation structures.

```typescript
// sidebars.ts
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  gettingStarted: [
    {
      type: "category",
      collapsed: false,
      collapsible: false,
      label: "Get Started",
      link: {
        type: "doc",
        id: "getting-started/index",
      },
      className: "firstTitle",
      items: [
        "getting-started/index",
        {
          type: "doc",
          id: "getting-started/quickstart-prismaPostgres",
          label: "Quickstart",
        },
        {
          type: "autogenerated",
          dirName: "100-getting-started/setup-prisma"
        }
      ],
    },
  ],

  ormSidebar: [
    {
      type: "category",
      label: "ORM",
      items: [{ type: "autogenerated", dirName: "200-orm" }],
    },
  ],

  // More sidebars...
};

export default sidebars;
```

## Docusaurus Configuration

The main configuration file controls site behavior, theme, plugins, and integrations.

```typescript
// docusaurus.config.ts
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  future: {
    v4: true,  // Enable Docusaurus v4 compatibility
  },
  title: "Prisma Documentation",
  tagline: "Get started with Prisma in the official documentation, and learn more about all Prisma's features with reference documentation, guides, and more.",
  favicon: "img/favicon.png",
  url: "https://www.prisma.io",
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? "/",
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  onBrokenMarkdownLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // Third-party scripts
  scripts: [
    // Kapa.ai AI assistant widget
    {
      src: "https://widget.kapa.ai/kapa-widget.bundle.js",
      async: true,
      "data-website-id": "1b51bb03-43cc-4ef4-95f1-93288a91b560",
      "data-project-name": "Prisma",
      "data-project-color": "#2D3748",
      "data-user-analytics-fingerprint-enabled": "true",
      "data-project-logo": "https://www.prisma.io/docs/ai_logo.png",
      "data-button-text": "Ask AI",
      "data-modal-example-questions":
        "How can I setup relations in my Prisma Schema?,What is the difference between the 'migrate dev' and 'db push' commands?,Which cache strategy should I use for my query with Prisma Accelerate?",
      "data-button-image": "https://www.prisma.io/docs/ai_button.svg",
      "data-button-width": "64px",
      "data-button-height": "64px",
      "data-button-border-radius": "8px",
      "data-button-border": "2px solid #71e8df",
      "data-button-text-color": "#71E8DF",
      "data-button-bg-color": "#2D3748",
      "data-button-border-color": "#71e8df",
      "data-button-border-style": "solid",
      "data-button-text-font-size": "1rem",
      "data-button-box-shadow":
        "drop-shadow(0px 0.724px 1.251px rgba(14, 18, 28, 0.02)) drop-shadow(0px 1.608px 2.909px rgba(14, 18, 28, 0.04)) drop-shadow(0px 2.793px 5.225px rgba(14, 18, 28, 0.06)) drop-shadow(0px 4.55px 8.671px rgba(14, 18, 28, 0.07)) drop-shadow(0px 7.485px 14.285px rgba(14, 18, 28, 0.08)) drop-shadow(0px 13.358px 24.966px rgba(14, 18, 28, 0.09)) drop-shadow(0px 33px 54px rgba(14, 18, 28, 0.07))",
    },
    // Tolt analytics
    {
      src: "https://cdn.tolt.io/tolt.js",
      async: true,
      "data-tolt": "fda67739-7ed0-42d2-b716-6da0edbec191",
    },
    // Common Room tracking
    {
      src: "https://cdn.cr-relay.com/v1/site/cc8b954c-5f74-4254-a72a-e0d61048bd58/signals.js",
      async: true,
    },
    // CookieYes consent management
    {
      async: true,
      id: "cookieyes",
      type: "text/javascript",
      src: "https://cdn-cookieyes.com/client_data/96980f76df67ad5235fc3f0d/script.js",
    },
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    image: "/docs/social/docs-social.png",
    metadata: [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@prisma" },
      { name: "twitter:creator", content: "@prisma" },
    ],
    navbar: {
      logo: {
        src: "img/logo.svg",
        srcDark: "img/logo-white.svg",
        alt: "Prisma logo",
        href: "https://www.prisma.io/",
        target: "_self",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "gettingStarted",
          position: "left",
          label: "Get Started",
          className: "indigo first-item",
        },
        {
          type: "docSidebar",
          sidebarId: "prismaPostgresSidebar",
          className: "teal",
          position: "left",
          label: "Postgres",
        },
        {
          type: "docSidebar",
          sidebarId: "ormSidebar",
          position: "left",
          className: "indigo",
          label: "ORM",
        },
        {
          type: "docSidebar",
          sidebarId: "guidesSidebar",
          className: "teal",
          position: "left",
          label: "Guides",
        },
        {
          type: "dropdown",
          label: "More",
          className: "teal",
          position: "left",
          items: [
            {
              className: "indigo",
              to: "/postgres/database/prisma-studio",
              label: "Studio",
              sub: "Explore and manipulate your data",
              icon: "fa-regular fa-table"
            },
            {
              type: "docSidebar",
              sidebarId: "optimizeSidebar",
              className: "teal",
              label: "Optimize",
              sub: "AI-driven query analysis",
              icon: "fa-regular fa-magnifying-glass-chart"
            },
            {
              type: "docSidebar",
              sidebarId: "accelerateSidebar",
              className: "teal",
              label: "Accelerate",
              sub: "Make your database global",
              icon: "fa-regular fa-bolt"
            },
            {
              type: "docSidebar",
              className: "teal",
              sidebarId: "aiSidebar",
              label: "Prisma + AI",
              sub: "Build faster with Prisma + AI",
              icon: "fa-regular fa-robot"
            },
          ],
        },
        {
          href: "https://pris.ly/github?utm_source=docs&utm_medium=navbar",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
        {
          href: "https://console.prisma.io/login?utm_source=docs&utm_medium=login",
          position: "right",
          label: "Log in",
          className: "navbar-login-btn internal teal-btn",
        },
      ],
    },

    algolia: {
      appId: "MF58UJZ648",
      apiKey: "aae3f55d59a198896509e9fbb30618e7",
      indexName: "prisma",
      contextualSearch: true,
      replaceSearchResultPathname: {
        from: "/docs/",
        to: DOCUSAURUS_BASE_URL,
      },
    },

    footer: {
      style: "dark",
      links: [
        {
          title: "socials",
          items: [
            {
              label: " ",
              href: "https://pris.ly/discord?utm_source=docs&utm_medium=footer",
              customProps: { icon: "fa-brands fa-discord", internal: true }
            },
            {
              label: " ",
              href: "https://pris.ly/x?utm_source=docs&utm_medium=footer",
              customProps: { icon: "fa-brands fa-x-twitter", internal: true }
            },
            {
              label: " ",
              href: "https://pris.ly/youtube?utm_source=docs&utm_medium=footer",
              customProps: { icon: "fa-brands fa-youtube", internal: true }
            },
            {
              label: " ",
              href: "https://pris.ly/whatsapp?utm_source=docs&utm_medium=footer",
              customProps: { icon: "fa-brands fa-whatsapp", internal: true }
            },
            {
              label: " ",
              href: "https://pris.ly/github?utm_source=docs&utm_medium=footer",
              customProps: { icon: "fa-brands fa-github", internal: true }
            },
          ],
        },
        {
          title: "Product",
          items: [
            { label: "ORM", href: "https://www.prisma.io/orm", target: "_self", customProps: { internal: true } },
            { label: "Studio", href: "https://www.prisma.io/studio", target: "_self", customProps: { internal: true } },
            { label: "Optimize", href: "https://www.prisma.io/optimize", target: "_self", customProps: { internal: true } },
            { label: "Accelerate", href: "https://www.prisma.io/accelerate", target: "_self", customProps: { internal: true } },
            { label: "Postgres", href: "https://www.prisma.io/postgres", target: "_self", customProps: { internal: true } },
            { label: "Pricing", href: "https://www.prisma.io/pricing", target: "_self", customProps: { internal: true } },
            { label: "Changelog", href: "https://www.prisma.io/changelog", target: "_self", customProps: { internal: true } },
            { label: "Data Platform status", href: "https://www.prisma-status.com/" },
          ],
        },
        {
          title: "Resources",
          items: [
            { label: "Docs", to: DOCUSAURUS_BASE_URL },
            { label: "Ecosystem", href: "https://www.prisma.io/ecosystem", target: "_self", customProps: { internal: true } },
            { label: "Playground", href: "https://playground.prisma.io/" },
            { label: "ORM Benchmarks", href: "https://benchmarks.prisma.io/" },
            { label: "Customer stories", href: "https://www.prisma.io/showcase", target: "_self", customProps: { internal: true } },
            { label: "Data guide", href: "https://www.prisma.io/dataguide", target: "_self", customProps: { internal: true } },
          ],
        },
        {
          title: "Contact us",
          items: [
            { label: "Community", href: "https://www.prisma.io/community", target: "_self", customProps: { internal: true } },
            { label: "Support", href: "https://www.prisma.io/support", target: "_self", customProps: { internal: true } },
            { label: "Enterprise", href: "https://www.prisma.io/enterprise", target: "_self", customProps: { internal: true } },
            { label: "Partners", href: "https://www.prisma.io/partners", target: "_self", customProps: { internal: true } },
            { label: "OSS Friends", to: "https://www.prisma.io/oss-friends", target: "_self", customProps: { internal: true } },
          ],
        },
        {
          title: "Company",
          items: [
            { label: "About", href: "https://www.prisma.io/about", target: "_self", customProps: { internal: true } },
            { label: "Blog", to: "https://www.prisma.io/blog", target: "_self", customProps: { internal: true } },
            { label: "Data DX", href: "https://www.datadx.io/" },
            { label: "Careers", to: "https://www.prisma.io/careers", target: "_self", customProps: { internal: true } },
            { label: "Privacy Policy", href: "https://pris.ly/privacy", customProps: { dropdown: "legal" } },
            { label: "Terms of Service", href: "https://pris.ly/terms", customProps: { dropdown: "legal" } },
            { label: "Service Level Agreement", href: "https://pris.ly/sla", customProps: { dropdown: "legal" } },
            { label: "Event Code of Conduct", href: "https://pris.ly/code-conduct", customProps: { dropdown: "legal" } },
            { label: "Security & Compliance", href: "https://trust.prisma.io/", target: "_self", customProps: { internal: true } },
          ],
        },
      ],
      logo: {
        srcDark: "img/logo-white.svg",
        alt: "Prisma logo",
        src: "img/logo-white.svg",
        href: "https://www.prisma.io/",
        target: "_self",
      },
      copyright: `© ${new Date().getFullYear()} Prisma Data, Inc.`,
    },

    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["json", "bash"],
      magicComments: [
        {
          className: "theme-code-block-added-line added-line code-highlight",
          line: "add-next-line",
          block: { start: "add-start", end: "add-end" },
        },
        {
          className: "theme-code-block-deleted-line deleted-line code-highlight",
          line: "delete-next-line",
          block: { start: "delete-start", end: "delete-end" },
        },
        {
          className: "theme-code-block-edited-line edited-line code-highlight",
          line: "edit-next-line",
          block: { start: "edit-start", end: "edit-end" },
        },
        {
          className: "theme-code-block-highlighted-line highlighted-line",
          line: "highlight-next-line",
          block: { start: "highlight-start", end: "highlight-end" },
        },
        {
          className: "theme-code-block-stronger-line stronger-line",
          line: "stronger-next-line",
          block: { start: "stronger-start", end: "stronger-end" },
        },
      ],
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    "docusaurus-plugin-sass",
    [
      path.resolve(__dirname, "client-plugins", "posthog-docusaurus"),
      {
        apiKey: "phc_cmc85avbWyuJ2JyKdGPdv7dxXli8xLdWDBPbvIXWJfs",
        appUrl: "https://proxyhog.prisma-data.net",
        person_profiles: "identified_only",
        enableInDevelopment: false,
      },
    ],
    // ... LLM plugin (see below)
  ],

  presets: [
    [
      "classic",
      {
        ...(process.env.GT_CONTAINER_ID && {
          googleTagManager: {
            containerId: process.env.GT_CONTAINER_ID,
          },
        }),
        sitemap: {
          ignorePatterns: [
            "/search",
            // Remove these from sitemap for SEO purposes as they're redirected
            "/getting-started/quickstart",
            "/getting-started/setup-prisma/add-to-existing-project",
            "/getting-started/setup-prisma/start-from-scratch-prisma-migrate",
            "/getting-started/setup-prisma/start-from-scratch-sql",
          ],
          filename: "sitemap.xml",
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return items.map((item) => {
              if (item.url.endsWith("/docs/")) {
                item.url = item.url.slice(0, -1); // remove trailing slash
              }
              return item;
            });
          },
        },
        docs: {
          routeBasePath: "/",
          path: "content",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/prisma/docs/tree/main",
        },
        blog: false,
        theme: {
          customCss: [
            "./src/css/custom.css",
            "./src/css/admonition.css",
            "./src/css/all.css",
            "./src/css/theming.css",
            "./src/css/prism.css",
          ],
        },
      } satisfies Preset.Options,
    ],
  ],
};

export default config;
```

## LLM-Friendly Content Generation Plugins

The documentation site uses two complementary plugins for LLM-optimized content generation.

**@signalwire/docusaurus-plugin-llms-txt Plugin:**

```typescript
// From docusaurus.config.ts
[
  "@signalwire/docusaurus-plugin-llms-txt",
  {
    generate: {
      enableMarkdownFiles: true,
      enableLlmsFullTxt: false,
    },
    include: {
      includeBlog: false,
      includePages: false,
      includeDocs: true,
    },
  } satisfies PluginOptions,
]
```

**Custom LLM Plugin:**

A custom Docusaurus plugin generates additional LLM-optimized content files during build.

```typescript
// Excerpt from docusaurus.config.ts
async function pluginLlmsTxt(context) {
  return {
    name: "llms-txt-plugin",

    loadContent: async () => {
      const { siteDir } = context;
      const contentDir = path.join(siteDir, "content");
      const allMdx: string[] = [];

      // Recursively collect all MDX files
      const getMdxFiles = async (dir: string) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await getMdxFiles(fullPath);
          } else if (entry.name.endsWith(".mdx")) {
            const content = await fs.promises.readFile(fullPath, "utf8");

            // Extract title from frontmatter
            const titleMatch = content.match(
              /^---\n(?:.*\n)*?title:\s*["']?([^"'\n]+)["']?\n(?:.*\n)*?---\n/
            );
            const title = titleMatch ? titleMatch[1] : "";

            // Build URL from file path (removing numeric prefixes)
            const relativePath = path.relative(contentDir, fullPath);
            let urlPath = relativePath
              .replace(/^\d+-/, "")       // Remove leading numeric prefix
              .replace(/\/\d+-/g, "/")    // Remove numeric prefixes in path
              .replace(/\.mdx$/, "");      // Remove .mdx extension

            const fullUrl = `https://www.prisma.io/docs/${urlPath}`;

            // Strip frontmatter and add title + URL
            const contentWithoutFrontmatter = content.replace(
              /^---\n[\s\S]*?\n---\n/,
              ""
            );

            const contentWithTitle = title
              ? `# ${title}\n\nURL: ${fullUrl}\n${contentWithoutFrontmatter}`
              : contentWithoutFrontmatter;

            allMdx.push(contentWithTitle);
          }
        }
      };

      await getMdxFiles(contentDir);
      return { allMdx };
    },

    postBuild: async ({ content, routes, outDir }) => {
      const { allMdx } = content as { allMdx: string[] };

      // Write full concatenated content (llms-full.txt)
      const concatenatedPath = path.join(outDir, "llms-full.txt");
      await fs.promises.writeFile(concatenatedPath, allMdx.join("\n---\n\n"));

      // Find docs plugin routes
      const docsPluginRouteConfig = routes.filter(
        (route) => route.plugin.name === "docusaurus-plugin-content-docs"
      )[0];

      const allDocsRouteConfig = docsPluginRouteConfig.routes?.filter(
        (route) => route.path === DOCUSAURUS_BASE_URL
      )[0];

      if (!allDocsRouteConfig?.props?.version) {
        return;
      }

      // Extract titles and descriptions
      const currentVersionDocsRoutes = (
        allDocsRouteConfig.props.version as Record<string, unknown>
      ).docs as Record<string, Record<string, unknown>>;

      const docsRecords = Object.entries(currentVersionDocsRoutes).map(
        ([path, record]) => {
          return `- [${record.title}](${path}): ${record.description}`;
        }
      );

      // Build and write llms.txt index file
      const llmsTxt = `# ${context.siteConfig.title}\n\n## Docs\n\n${docsRecords.join("\n")}`;
      const llmsTxtPath = path.join(outDir, "llms.txt");
      await fs.promises.writeFile(llmsTxtPath, llmsTxt);
    },
  };
}
```

## Code Formatting and Linting

Format code and markdown files using Prettier.

```bash
# Format all files
npm run format
# This runs: prettier --write .

# Using Prettier 3.6.2

# Note: .md and .mdx files are excluded in .prettierignore
# because they use MDX 3 which Prettier doesn't fully support
```

**.prettierignore:**

```
# Build outputs
build/
.docusaurus/

# MDX files (MDX 3 not fully supported by Prettier)
*.md
*.mdx

# Dependencies
node_modules/
```

**.prettierrc:**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## File Organization Tool

Use the `mdtool` utility to manage file positions in the numeric-prefix system.

```bash
# Install mdtool
brew install wget
wget https://gist.githubusercontent.com/steebchen/bd085ebde1fcf4242e3fdd0df4d202a6/raw/c04e3d262eb6a302a9fab98f6428fec9329681e2/mdtool -qO /usr/local/bin/mdtool
chmod +x /usr/local/bin/mdtool

# Insert a new file at position 3 (shifts others up)
mdtool insert 3

# Swap two files
mdtool swap 03-file1.mdx 07-file2.mdx

# Move a file to a new position
mdtool move 05-file.mdx 2

# Remove a file (shifts others down)
mdtool remove 2
```

## Theme Customization

Custom React components extend Docusaurus theme functionality.

**Custom Link Component with External Icon:**

```tsx
// src/theme/MDXComponents.tsx
const ExternalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path
      fill="currentColor"
      d="M6 1h5v5L8.86 3.85 4.7 8 4 7.3l4.15-4.16zM2 3h2v1H2v6h6V8h1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1"
    />
  </svg>
);

const StyledLink = ({ children, ...props }) => {
  const location = useLocation();
  const url = props.href;

  if (url?.includes(".prisma.io") || url?.startsWith("/")) {
    return <DocsLink {...props}>{children}</DocsLink>;
  } else {
    return (
      <a {...props} target="_blank" rel="noopener noreferrer">
        {children}
        <ExternalIcon />
      </a>
    );
  }
};

export default {
  ...MDXComponents,
  a: StyledLink,
  Link: DocsLink,
  // ... other components
};
```

## Contributing Workflow

Contribute to the documentation by following the standard GitHub workflow.

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/docs.git
cd docs

# 2. Create a feature branch
git checkout -b fix/update-quickstart-guide

# 3. Make your changes to MDX files in content/
# Edit files in content/ directory

# 4. Test locally
npm install
npm run start
# Preview at http://localhost:3000

# 5. Build to check for errors
npm run clean && npm run build

# 6. Commit your changes
git add .
git commit -m "docs: update quickstart guide with new examples"

# 7. Push and create pull request
git push origin fix/update-quickstart-guide

# 8. Open PR at https://github.com/prisma/docs/pulls
# Include:
# - Clear description of changes
# - Link to related issues
# - Screenshots if UI changes
```

**Pull Request Template:**

```markdown
## Description
Brief description of what was changed and why.

## Changes Made
- Updated quickstart guide with TypeScript examples
- Added new section on error handling
- Fixed broken links in ORM documentation

## Related Issues
Closes #123
Related to #456

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Checklist
- [ ] Tested locally with `npm run start`
- [ ] Build passes with `npm run build`
- [ ] Links are not broken
- [ ] Follows existing documentation style
```

## Environment Variables and Wrangler Configuration

Configure environment variables for build-time customization and deployment.

```bash
# .env.example
DOCUSAURUS_BASE_URL=/docs/
GT_CONTAINER_ID=GTM-XXXXXXX

# For local development, create .env file:
cp .env.example .env

# Base URL for documentation (default: /)
DOCUSAURUS_BASE_URL=/

# Google Tag Manager container ID (optional)
GT_CONTAINER_ID=

# The build process reads these at build time
npm run build
```

**Wrangler Configuration for Cloudflare Pages:**

```toml
# wrangler.toml
name = "docs"
pages_build_output_dir = "build"
compatibility_date = "2024-03-18"

[vars]
DOCUSAURUS_BASE_URL='/'

[env.preview.vars]
DOCUSAURUS_BASE_URL='/'

[env.production.vars]
DOCUSAURUS_BASE_URL='/docs/'
```

The configuration supports environment-specific base URLs, with production deploying to `/docs/` while preview and local deployments use the root path `/`.

## Analytics and Monitoring

The site integrates multiple analytics and monitoring services.

```typescript
// PostHog Analytics (custom client plugin)
{
  plugins: [
    [
      path.resolve(__dirname, "client-plugins", "posthog-docusaurus"),
      {
        apiKey: "phc_cmc85avbWyuJ2JyKdGPdv7dxXli8xLdWDBPbvIXWJfs",
        appUrl: "https://proxyhog.prisma-data.net",
        person_profiles: "identified_only",
        enableInDevelopment: false,
      },
    ],
  ],
}

// Kapa.ai AI Assistant Widget (configured in scripts with custom branding)
{
  scripts: [
    {
      src: "https://widget.kapa.ai/kapa-widget.bundle.js",
      async: true,
      "data-website-id": "1b51bb03-43cc-4ef4-95f1-93288a91b560",
      "data-project-name": "Prisma",
      "data-project-color": "#2D3748",
      "data-user-analytics-fingerprint-enabled": "true",
      "data-project-logo": "https://www.prisma.io/docs/ai_logo.png",
      "data-button-text": "Ask AI",
      "data-modal-example-questions":
        "How can I setup relations in my Prisma Schema?,What is the difference between the 'migrate dev' and 'db push' commands?,Which cache strategy should I use for my query with Prisma Accelerate?",
      "data-button-image": "https://www.prisma.io/docs/ai_button.svg",
      "data-button-width": "64px",
      "data-button-height": "64px",
      "data-button-border-radius": "8px",
      "data-button-border": "2px solid #71e8df",
      "data-button-text-color": "#71E8DF",
      "data-button-bg-color": "#2D3748",
      "data-button-border-color": "#71e8df",
      "data-button-border-style": "solid",
      "data-button-text-font-size": "1rem",
      "data-button-box-shadow":
        "drop-shadow(0px 0.724px 1.251px rgba(14, 18, 28, 0.02)) drop-shadow(0px 1.608px 2.909px rgba(14, 18, 28, 0.04)) drop-shadow(0px 2.793px 5.225px rgba(14, 18, 28, 0.06)) drop-shadow(0px 4.55px 8.671px rgba(14, 18, 28, 0.07)) drop-shadow(0px 7.485px 14.285px rgba(14, 18, 28, 0.08)) drop-shadow(0px 13.358px 24.966px rgba(14, 18, 28, 0.09)) drop-shadow(0px 33px 54px rgba(14, 18, 28, 0.07))",
    },
  ],
}

// Tolt Analytics
{
  scripts: [
    {
      src: "https://cdn.tolt.io/tolt.js",
      async: true,
      "data-tolt": "fda67739-7ed0-42d2-b716-6da0edbec191",
    },
  ],
}

// Common Room Tracking
{
  scripts: [
    {
      src: "https://cdn.cr-relay.com/v1/site/cc8b954c-5f74-4254-a72a-e0d61048bd58/signals.js",
      async: true,
    },
  ],
}

// CookieYes Consent Management
{
  scripts: [
    {
      async: true,
      id: "cookieyes",
      type: "text/javascript",
      src: "https://cdn-cookieyes.com/client_data/96980f76df67ad5235fc3f0d/script.js",
    },
  ],
}

// Algolia DocSearch Configuration
{
  algolia: {
    appId: "MF58UJZ648",
    apiKey: "aae3f55d59a198896509e9fbb30618e7",
    indexName: "prisma",
    contextualSearch: true,
    replaceSearchResultPathname: {
      from: "/docs/",
      to: DOCUSAURUS_BASE_URL,
    },
  },
}

// Google Tag Manager (optional, via environment variable)
{
  presets: [
    [
      "classic",
      {
        ...(process.env.GT_CONTAINER_ID && {
          googleTagManager: {
            containerId: process.env.GT_CONTAINER_ID,
          },
        }),
      },
    ],
  ],
}
```

## TypeScript Configuration

TypeScript is configured for type-safe React and Docusaurus development using TypeScript 5.9.2.

```json
// tsconfig.json
{
  "extends": "@docusaurus/tsconfig",
  "exclude": ["build"],
  "compilerOptions": {
    "baseUrl": ".",
    "types": ["docusaurus-plugin-sass"],
    "strictNullChecks": true
  }
}
```

**Key TypeScript Features:**
- Extends official Docusaurus TypeScript configuration
- Strict null checks enabled for better type safety
- Full type checking for React 19.1.1 and Docusaurus 3.9.2
- Supports custom components with full IntelliSense
- Includes SASS plugin types for styled components

## Static Assets

Static files are served from the `static/` directory and available at the site root.

```bash
static/
├── img/
│   ├── logo.svg
│   ├── logo-white.svg
│   ├── favicon.png
│   └── ... (various images and icons)
├── fonts/              # Custom web fonts
├── icons/              # Icon assets
├── social/
│   └── docs-social.png  # Social media preview image
├── ai_logo.png         # Kapa.ai branding
├── ai_button.svg       # Kapa.ai button icon
├── _redirects          # Cloudflare Pages redirects (68KB+ of redirects)
├── robots.txt          # Search engine crawling rules
└── .nojekyll           # Disable Jekyll on GitHub Pages

# Referenced in MDX as:
![Prisma Logo](/img/logo.svg)

# Or in components:
<img src="/img/technologies/nodejs.svg" alt="Node.js" />

# Files are directly accessible at https://www.prisma.io/docs/img/logo.svg
```

## Search Functionality

Algolia DocSearch provides fast, typo-tolerant search across all documentation.

```typescript
// Algolia configuration in docusaurus.config.ts
{
  algolia: {
    appId: "MF58UJZ648",
    apiKey: "aae3f55d59a198896509e9fbb30618e7",
    indexName: "prisma",
    contextualSearch: true,
    replaceSearchResultPathname: {
      from: "/docs/",
      to: "/",
    },
  },
}

// Users can search by:
// - Page titles and headings
// - Body content
// - Code examples
// - API references

// Search is automatically indexed by Algolia crawler
```

## Additional npm Scripts

```bash
# Docusaurus utility commands
npm run docusaurus         # Run docusaurus CLI directly
npm run swizzle           # Customize Docusaurus theme components
npm run write-translations # Extract translatable strings
npm run write-heading-ids  # Add explicit heading IDs to MDX files
```

---

The Prisma Documentation project serves as a comprehensive learning resource for developers using Prisma's database toolkit. Its primary use case is to guide users through setup, configuration, and advanced usage of Prisma ORM, Studio, Accelerate, Optimize, and Postgres. The documentation supports multiple workflows including quickstart tutorials for new users, detailed API references for experienced developers, migration guides for teams switching from other ORMs, and integration tutorials for popular frameworks like Next.js, NestJS, and SvelteKit. The content structure accommodates both learning paths and reference lookups, with features like database switchers allowing users to toggle between PostgreSQL, MySQL, SQLite, and other supported databases. The site is built with modern technologies including React 19.1.1, MDX 3.1.1, Docusaurus 3.9.2 (v4-compatible via future flag), and TypeScript 5.9.2, ensuring type safety and excellent developer experience.

Integration patterns include embedding the documentation site within the broader Prisma ecosystem, using dual LLM plugins (both @signalwire/docusaurus-plugin-llms-txt and a custom plugin) to generate AI-friendly content snapshots (llms.txt and llms-full.txt) for training and retrieval systems, and leveraging the modular MDX component system for consistent, interactive documentation experiences. The site integrates multiple third-party services including Algolia DocSearch for search, PostHog (via custom client plugin at client-plugins/posthog-docusaurus) for analytics, Kapa.ai for AI-powered assistance with extensive custom branding configuration, Tolt for conversion tracking, Common Room for community engagement, and CookieYes for consent management. Contributors can extend functionality by adding custom React components in `src/components/`, creating new sidebar configurations for product sections, developing Docusaurus plugins to enhance build-time processing, or adding custom CSS in `src/css/`. The site's architecture ensures fast build times with Docusaurus Faster (v3.9.2), excellent SEO through static generation and comprehensive sitemap configuration with automatic trailing slash removal, and seamless deployment to edge platforms like Cloudflare Pages via Wrangler (v4.49.0), making it a robust foundation for technical documentation at scale.
