import { defineMcp } from "@lovable.dev/mcp-js";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import getBrandInfo from "./tools/get-brand-info";

export default defineMcp({
  name: "sigma-tecnologias-mcp",
  title: "Sigma Tecnologías MCP",
  version: "0.1.0",
  instructions:
    "Tools to explore Sigma Tecnologías — a software studio led by Ariel Odasso. Use `get_brand_info` for positioning and services, `list_blog_posts` to browse published articles, and `get_blog_post` to read a specific post by slug.",
  tools: [getBrandInfo, listBlogPosts, getBlogPost],
});
