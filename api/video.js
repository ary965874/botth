import fetch from "node-fetch";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

const BASE_URL = "https://xbaaz.com/";
const CONCURRENCY_LIMIT = 5;

async function fetchHtml(url) {
  const response = await fetch(url);
  return await response.text();
}

async function fetchPostData(post) {
  try {
    const html = await fetchHtml(post.url);
    const $ = cheerio.load(html);
    const videoUrl = $('meta[itemprop="contentURL"]').attr("content") || "";
    const thumbUrl =
      $('meta[itemprop="thumbnailUrl"]').attr("content") ||
      "https://via.placeholder.com/320x180.png?text=Thumbnail";

    return {
      title: post.title,
      thumbnail: thumbUrl,
      download_links: {
        processed_video: videoUrl,
      },
    };
  } catch (err) {
    console.error("Error fetching post:", post.url, err.message);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const homepageHtml = await fetchHtml(BASE_URL);
    const $ = cheerio.load(homepageHtml);

    const posts = [];
    $("a.infos").each((_, el) => {
      const postUrl = $(el).attr("href");
      const title = $(el).attr("title") || "Untitled";
      const fullUrl = postUrl.startsWith("http")
        ? postUrl
        : BASE_URL + postUrl.replace(/^\//, "");
      posts.push({ title, url: fullUrl });
    });

    const limit = pLimit(CONCURRENCY_LIMIT);

    // Use p-limit to limit concurrent fetches
    const results = await Promise.all(
      posts.map((post) => limit(() => fetchPostData(post)))
    );

    const filteredResults = results.filter((x) => x !== null);

    return res.status(200).json(filteredResults);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
