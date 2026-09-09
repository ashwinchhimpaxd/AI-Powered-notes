/**
 * noteUtils.js — Pure editor utility functions.
 *
 * No React. No hooks. No state.
 * Safe to import from anywhere without side effects.
 */

// -- Cached DOM parser (created once, not per keystroke) ----------------------
export const domParser = new DOMParser();

/**
 * Extract plain text from an HTML string.
 * @param {string} html
 * @returns {string}
 */
export const getPlainText = (html) => {
    if (!html) return "";
    try {
        const doc = domParser.parseFromString(html, "text/html");
        return doc.body.textContent.trim();
    } catch {
        return html.replace(/<[^>]*>/g, "").trim();
    }
};

/**
 * Strip ALL whitespace characters for strict content-only comparison.
 * @param {string} text
 * @returns {string}
 */
export const cleanText = (text) => {
    return (text || "").replace(/\s/g, "");
};

/**
 * Strip basic layout tags + whitespace for rich-text formatting comparison.
 * @param {string} html
 * @returns {string}
 */
export const cleanHtml = (html) => {
    return (html || "")
        .replace(/<\/?p>/g, "")
        .replace(/<br\s*\/?>/g, "")
        .replace(/&nbsp;/g, "")
        .replace(/\s/g, "");
};

/**
 * Extract all image src attributes as a comma-joined string.
 * @param {string} html
 * @returns {string}
 */
export const getImagesString = (html) => {
    try {
        const doc = domParser.parseFromString(html, "text/html");
        return Array.from(doc.querySelectorAll("img"))
            .flatMap((img) => {
                const src = img.getAttribute("src");
                return src ? [src] : [];
            })
            .join(",");
    } catch {
        return "";
    }
};
