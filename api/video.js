import fetch from "node-fetch";
import * as cheerio from "cheerio";

const BASE_URL = "https://xbaaz.com/";
const NUM_POSTS = 10;

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

// Utility to shuffle array and pick first n elements
function pickRandom(arr, n) {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export default async function handler(req, res) {
  try {
    const homepageHtml = await fetchHtml(BASE_URL);
    const $ = cheerio.load(homepageHtml);

    const posts = [];
    $("a.infos").each((_, el) => {
      const postUrl = $(el).attr("href");
      if (!postUrl) return;
      const title = $(el).attr("title") || "Untitled";
      const fullUrl = postUrl.startsWith("http")
        ? postUrl
        : BASE_URL + postUrl.replace(/^\//, "");
      posts.push({ title, url: fullUrl });
    });

    // Pick random 10 posts
    const selectedPosts = pickRandom(posts, Math.min(NUM_POSTS, posts.length));

    // Fetch post data concurrently for selected posts
    const results = await Promise.all(selectedPosts.map(fetchPostData));

    const filteredResults = results.filter((x) => x !== null);

    return res.status(200).json(filteredResults);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
