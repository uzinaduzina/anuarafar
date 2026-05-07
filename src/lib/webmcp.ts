import type { Article, Issue } from '@/data/types';

interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: unknown) => Promise<unknown>;
}

interface WebMcpRegistration {
  tools: WebMcpToolDefinition[];
}

interface WebMcpNavigator extends Navigator {
  modelContext?: {
    provideContext: (registration: WebMcpRegistration) => void | Promise<void>;
  };
}

const PUBLIC_BASE = 'https://anuar.iafar.ro';

function asNavigator(): WebMcpNavigator | null {
  if (typeof navigator === 'undefined') return null;
  return navigator as WebMcpNavigator;
}

function articleSummary(article: Article) {
  return {
    id: article.id,
    issue_id: article.issue_id,
    title: article.title,
    authors: article.authors,
    section: article.section,
    series: article.series,
    pages_start: article.pages_start,
    pages_end: article.pages_end,
    doi: article.doi || null,
    pdf_path: article.pdf_path || null,
    landing: `${PUBLIC_BASE}/article/${article.id}`,
  };
}

function issueSummary(issue: Issue) {
  return {
    id: issue.id,
    slug: issue.slug,
    year: issue.year,
    volume: issue.volume,
    number: issue.number,
    title: issue.title,
    series: issue.series,
    series_label: issue.series_label,
    status: issue.status,
    article_count: issue.article_count,
    landing: `${PUBLIC_BASE}/archive/${issue.slug}`,
  };
}

function searchArticlesByQuery(articles: Article[], query: string, limit = 20) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Article[] = [];
  for (const article of articles) {
    if (results.length >= limit) break;
    const haystack = [
      article.title,
      article.authors,
      article.abstract || '',
      article.abstract_ro,
      article.abstract_en,
      article.abstract_de || '',
      article.abstract_fr || '',
      article.keywords || '',
      article.keywords_ro,
      article.keywords_en,
      article.section,
    ]
      .join(' ')
      .toLowerCase();
    if (haystack.includes(q)) results.push(article);
  }
  return results.map(articleSummary);
}

export function registerWebMcpTools(articles: Article[], issues: Issue[]): boolean {
  const nav = asNavigator();
  if (!nav?.modelContext?.provideContext) return false;

  const tools: WebMcpToolDefinition[] = [
    {
      name: 'listIssues',
      description: 'List journal issues in the Anuarul Arhivei de Folclor archive. Optional filters by series and status.',
      inputSchema: {
        type: 'object',
        properties: {
          series: {
            type: 'string',
            enum: ['seria-1', 'seria-2', 'seria-3'],
            description: 'Optional: filter by journal series. seria-1 (1932-1945), seria-2 (1980-1998), seria-3 (2002-present).',
          },
          status: {
            type: 'string',
            enum: ['published', 'draft'],
            description: 'Optional: filter by issue status.',
          },
        },
        additionalProperties: false,
      },
      execute: async (input) => {
        const { series, status } = (input as { series?: string; status?: string }) || {};
        let result = issues;
        if (series) result = result.filter((i) => i.series === series);
        if (status) result = result.filter((i) => i.status === status);
        return result.map(issueSummary);
      },
    },
    {
      name: 'getIssue',
      description: 'Fetch a single issue by slug, including its article list (table of contents).',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Issue slug, e.g. "aaf-xxix-2025".' },
        },
        required: ['slug'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { slug } = (input as { slug: string }) || {};
        const issue = issues.find((i) => i.slug === slug);
        if (!issue) return { error: `Issue not found: ${slug}` };
        const articleList = articles
          .filter((a) => a.issue_id === issue.id)
          .map(articleSummary);
        return { ...issueSummary(issue), articles: articleList };
      },
    },
    {
      name: 'getArticle',
      description: 'Fetch a single article by id with full metadata (title, authors, abstract, keywords, pdf_path, doi).',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Article id from the AAF manifest.' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { id } = (input as { id: string }) || {};
        const article = articles.find((a) => a.id === id);
        if (!article) return { error: `Article not found: ${id}` };
        return {
          ...articleSummary(article),
          abstract: article.abstract || article.abstract_ro || article.abstract_en || '',
          abstract_ro: article.abstract_ro,
          abstract_en: article.abstract_en,
          keywords: article.keywords || article.keywords_ro || article.keywords_en || '',
          keywords_ro: article.keywords_ro,
          keywords_en: article.keywords_en,
          language: article.language,
          is_review: Boolean(article.is_review),
        };
      },
    },
    {
      name: 'searchArticles',
      description: 'Search articles in the AAF archive. Matches against title, authors, abstract (any language), keywords, and section.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search terms.' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        required: ['query'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { query, limit = 20 } = (input as { query: string; limit?: number }) || { query: '' };
        return searchArticlesByQuery(articles, query, limit);
      },
    },
  ];

  try {
    void nav.modelContext.provideContext({ tools });
    return true;
  } catch {
    return false;
  }
}

export function isWebMcpAvailable(): boolean {
  const nav = asNavigator();
  return Boolean(nav?.modelContext?.provideContext);
}
