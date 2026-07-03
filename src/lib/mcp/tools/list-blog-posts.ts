import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "List published blog posts from Sigma Tecnologías, ordered by publish date (newest first).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Max number of posts to return."),
    category: z.string().optional().describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, category }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let query = supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { posts: data },
    };
  },
});
