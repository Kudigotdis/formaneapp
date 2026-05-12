/**
 * PATH UTILITIES
 * Handles slugification and hierarchical path generation for assets.
 */

/**
 * Slugifies a string by converting to lowercase and replacing spaces/& with hyphens.
 * @param {string} text 
 * @returns {string}
 */
const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/&/g, '-')       // Replace & with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

/**
 * Generates a 3-level hierarchical path for category assets.
 * Matches: assets/categories/cat/sub/item/fileName
 */
export const generateHierarchyPath = (cat, sub, item, fileName) => {
    const slugCat = slugify(cat);
    const slugSub = slugify(sub);
    const slugItem = slugify(item);
    
    return `assets/categories/${slugCat}/${slugSub}/${slugItem}/${fileName}`;
};
