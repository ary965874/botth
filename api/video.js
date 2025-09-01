import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { post_url } = req.query;
    if (!post_url) {
      return res.status(400).json({ error: "Missing ?post_url= parameter" });
    }

    const response = await fetch(post_url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[itemprop="description"]').attr("content") || "Untitled";
    const videoUrl = $('meta[itemprop="contentURL"]').attr("content") || "";
    const thumbUrl = $('meta[itemprop="thumbnailUrl"]').attr("content") 
                     || "https://via.placeholder.com/320x180.png?text=Thumbnail";

    return res.status(200).json({
      title,
      thumbnail: thumbUrl,
      download_links: {
        processed_video: videoUrl
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
