import fetch from "node-fetch";
import * as cheerio from "cheerio";

const BASE_URL = "https://xbaaz.com/";

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

      // Normalize URL
      const fullUrl = postUrl.startsWith("http") ? postUrl : BASE_URL + postUrl.replace(/^\//, "");
      posts.push({ title, url: fullUrl });
    });

    // 3. Fetch each post page for video + thumbnail
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
            processed_video: videoUrl
          }
        });
      } catch (err) {
        console.error("Error fetching post:", post.url, err.message);
      }
    }

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
