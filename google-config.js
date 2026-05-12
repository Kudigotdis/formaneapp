// google-config.js — safe to commit. Does NOT include client_secret.
// Generated from your private wirog-config.json (keep that file private).

const googleConfig = {
  clientId: "977050279257-97rltt8ldnr96fgmi4klbsglgrlavk97.apps.googleusercontent.com",
  rootFolderName: "Wirog App Drive",
  rootFolderId: "1jgPu6QXfgmO_IVlZuZj_ORR8z5RY9laR",
  appSystem: {
    folderId: "1JDrSRv9P5kXFyrjo-PUgeewa_6d1zcZF",
    iconsId: "1Op3tE-rrPcQ76ikx3wL2IsdaTJFokGln",
    platformMediaId: "17smYChfeaaU3MH7WrgKbsUcxwX2aKupU",
    categoryImagesId: "1_7Os0FOcinPZQkEPFBdn0Bv6BR0uPdIW",
    categories: {
      "attire-uniform": "11AGeks8Cow3yV7vgDIMzdhrWIhhZ_OQJ",
      "bathroom-kitchen": "1YccmilVF8C7We_hZfp6fIOqqHU8QDope",
      "boards-timber": "19gl4IdUW6nwwAWaV_TtdEhDnEyX1p2Zu",
      "building-materials": "1IlXSR8KAWtUnEpKaChBZj2sorc1xFGTr",
      "cement-aggregates": "1waQcsERiMWHjarKMMG0EZARzigY0rytw",
      "chemicals": "1klxTwTwWV7fvorFkP6m3LgHU4nXSNw5P",
      "design-plans": "1_RkNCaPGnIi3NaxCPmLDuF2FtQhA6on9",
      "doors-windows": "13JS4a89JH5YzO9b8Uww-CbB5FFvwa9Ks",
      "electrical": "1clenKKVuxsWKti35Co7m7IL1vlsspRBW",
      "gardening-outdoor-living": "1sZ6-8Bx6f8Oz4xXOXOgkbwY_JfhMhQNL",
      "generators-power-solutions": "1PqxYpIdv_IXdWYGQdSnYsfVNlkv1nGDb",
      "geysers-heating": "17dtL_rBHPNUr3Rdf-PaZNNq2QjnckBlB",
      "hardware-fasteners": "1tqIZSH2bl36_TvuheSQg-kzkTe1Mc_Kw",
      "home-decor": "11UUzZoo1zioxwFgFMAQlxV05Lqr615U8",
      "lighting": "1L-ifmOA-qrz1u7tWx5zJXrDM_syD7dRb",
      "paint": "13UWesJirixx2YIc7YpVaDaQQyEcvIrIU",
      "partitioning": "17ochOc_OU8t6JHOi6qCtXheBdO9Lnx5y",
      "plumbing": "1fdL4lqVBIAuba1wOz9y5EY-ovunapEEL",
      "pre-builds-shipping-containers": "1ph1XLlWYV1iSwl9JCLLmXuiliymov46I",
      "rooting-ceiling": "1XeIoUTnJXCXi7h6LI6Oq8qFVqnMCXwAg",
      "safety-security": "1xbIe4UOPFvFI2kM6eAGjKm2oU67EZUap",
      "sanitaryware": "1w2dNsKYkTmMtM1NtaFrAXVW2aUVdIGV1",
      "solar-supplies": "1ovb3fFZEqSMh24i8CGIvuFqY1sYgmRm3",
      "shelving-storage": "1carIsvAWG4UI2StuhKCJQOel_y3jb7C-",
      "steel-metal-products": "1jALbyg9IHJCXZO3WdMG6yl6xqj5TG0Nv",
      "tiles-flooring": "1pUi9GeyxmZxwdAmwYhpJ4eIMnyURynLo",
      "tools-equipment": "123qo8WM_lLgt7rYfzzCkgqS-UYttLgMQ"
    }
  },
  clientsRootId: "1PEvHwhoxe0eQ75G2Gs_bfMsUBV5mMGPA",
  usersFolderId: null,
  prosFolderId: null,
  businessesFolderId: null,
  folderSchema: {
    user: {
      subfolders: ["profile_picture", "notes", "documents"],
      files: ["liked_promos.json", "favourite_suppliers.json", "notes_index.json", "kpi_cache.json", "subscription.json"]
    },
    pro: {
      subfolders: ["portfolio", "promos", "catalogue", "cover_photo", "documents", "staff", "reviews"],
      files: ["profile.json"]
    },
    business: {
      subfolders: ["logo", "profile", "promos", "catalogue", "cover_photo", "staff", "documents", "reviews"],
      files: ["business_profile.json"]
    }
  }
};

function getCategoryFolderId(slug) {
  return googleConfig.appSystem.categories[slug] || null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { googleConfig, getCategoryFolderId };
}
