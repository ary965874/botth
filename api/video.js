import fetch from "node-fetch";
import * as cheerio from "cheerio";

const BASE_URL = "https://xbaaz.com/";

// Cache variables
let cachedPosts = [];
let cachedResults = [];

export default async function handler(req, res) {
  try {
    // 1. Load homepage
    const response = await fetch(BASE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Collect all post links
    const posts = [];
    $("a.infos").each((_, el) => {
      const postUrl = $(el).attr("href");
      const title = $(el).attr("title") || "Untitled";

      const fullUrl = postUrl.startsWith("http") ? postUrl : BASE_URL + postUrl.replace(/^\//, "");
      posts.push({ title, url: fullUrl });
    });

    // Check if the posts list is identical to cachedPosts (by URLs)
    const isSamePosts =
      posts.length === cachedPosts.length &&
      posts.every((p, i) => p.url === cachedPosts[i].url);

    if (isSamePosts) {
      // If posts are same, return cached results immediately
      return res.status(200).json(cachedResults);
    }

    // Otherwise fetch post pages and update cached data
    const results = [];
    for (const post of posts) {
      try {
        const resp = await fetch(post.url);
        const postHtml = await resp.text();
        const $$ = cheerio.load(postHtml);

        const videoUrl = $$('meta[itemprop="contentURL"]').attr("content") || "";
        const thumbUrl =
          $$('meta[itemprop="thumbnailUrl"]').attr("content") ||
          "https://via.placeholder.com/320x180.png?text=Thumbnail";

        results.push({
          title: post.title,
          thumbnail: thumbUrl,
          download_links: {
            processed_video: videoUrl,
          },
        });
      } catch (err) {
        console.error("Error fetching post:", post.url, err.message);
      }
    }

    // Update cache before sending response
    cachedPosts = posts;
    cachedResults = results;

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
