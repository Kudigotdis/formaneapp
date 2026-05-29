/**
 * PATH UTILITIES
 * Handles slugification and hierarchical path generation for assets.
 */

/**
 * Slugifies a string by converting to lowercase and replacing spaces/& with hyphens.
 * @param {string} text 
 * @returns {string}
 */
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

/**
 * Generates a 3-level hierarchical path for category assets.
 * Matches: assets/categories/cat/sub/item/fileName
 */
function generateHierarchyPath(cat, sub, item, fileName) {
    return 'assets/categories/' + slugify(cat) + '/' + slugify(sub) + '/' + slugify(item) + '/' + fileName;
}

window.generateHierarchyPath = generateHierarchyPath;
