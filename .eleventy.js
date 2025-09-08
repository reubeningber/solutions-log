// .eleventy.js
module.exports = function (eleventyConfig) {
  // --- CONFIG for reference parsing ---
  const GH_ORG = "businessinsider";
  const JIRA_BASE = "https://businessinsider.atlassian.net/browse";

  // Collect ALL markdown/ njk under src/content/** and src/entries/** (newest first)
  eleventyConfig.addCollection("entries", (api) => {
    const globs = [
      "src/content/**/*.{md,njk}",
      "src/entries/**/*.{md,njk}",
    ];

    const toDate = (item) => {
      // Prefer Eleventy’s computed date, then front matter date, then epoch
      const d = item.date || item.data?.date;
      return d instanceof Date ? d : new Date(d || 0);
    };

    return api
      .getFilteredByGlob(globs)
      .filter((item) => !item.data?.draft) // ignore drafts if present
      .sort((a, b) => toDate(b) - toDate(a));
  });

  // Unique tags helper used by index.njk
  eleventyConfig.addFilter("uniquetags", (items) => {
    const set = new Set();
    (items || []).forEach((i) => (i.data.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  });

  // Minimal date filter used in templates
  eleventyConfig.addFilter("date", (value, fmt = "yyyy-MM-dd") => {
    const d = value === "now" || value === undefined ? new Date() : new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    if (fmt === "yyyy") return String(d.getFullYear());
    if (fmt === "yyyy-MM-dd") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return d.toLocaleDateString();
  });

  eleventyConfig.addFilter("tagCounts", (items) => {
    const counts = {};
    (items || []).forEach((i) => (i.data.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    return counts;
  });

  // Remove leading "Context" (and punctuation) from excerpts
  eleventyConfig.addFilter("stripContext", (str) => {
    if (!str) return "";
    return String(str).replace(/^\s*context\b\s*[:\-–—]?\s*/i, "");
  });

  eleventyConfig.addFilter("isUrl", (v) => typeof v === "string" && /^https?:\/\//i.test(v));

  // Normalize "references" front matter into {url,label} or {text}
  eleventyConfig.addFilter("normalizeRefs", (raw) => {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [raw];

    const out = arr.map((item) => {
      // Already structured
      if (item && typeof item === "object") {
        if (item.url) return { url: String(item.url), label: String(item.label || item.url) };
        if (item.label || item.text) return { text: String(item.label || item.text) };
        return { text: Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(", ") };
      }

      // Strings:
      const s = String(item).trim();

      // 1) Label:URL
      const mLabelUrl = s.match(/^([^:]+):\s*(https?:\/\/\S+)$/i);
      if (mLabelUrl) {
        const label = mLabelUrl[1].trim();
        const url = mLabelUrl[2];
        return { url, label };
      }

      // 2) Jira key: two letters + "-" + digits
      const mJira = s.match(/^([a-z]{2}-\d+)$/i);
      if (mJira) {
        const key = mJira[1].toUpperCase();
        return { url: `${JIRA_BASE}/${key}`, label: `Jira: ${key}` };
      }

      // 3) GitHub PR: "REPO-NAME 1234"
      const mPr = s.match(/^([A-Za-z0-9._-]+)\s+(\d+)$/);
      if (mPr) {
        const repo = mPr[1];
        const num = mPr[2];
        return { url: `https://github.com/${GH_ORG}/${repo}/pull/${num}`, label: `PR #${num}` };
      }

      // 4) Plain URL
      if (/^https?:\/\/\S+$/i.test(s)) {
        return { url: s, label: s };
      }

      // 5) Plain text
      return { text: s };
    });

    return out;
  });

  // Static assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");

  return {
    pathPrefix: "/solutions-log/", // important for GitHub Pages subpath
    dir: { input: "src", includes: ".", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
  };
};
