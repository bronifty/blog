import * as path from "path";
import { defineConfig } from "rspress/config";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "bronifty",
  description: "software blog, docs, and apps showcase",
  icon: "/bronifty-icon.jpg",
  logo: {
    light: "/bronifty-icon.jpg",
    dark: "/bronifty-icon.jpg",
  },
  themeConfig: {
    enableContentAnimation: true,
    enableScrollToTop: true,
    socialLinks: [
      { icon: "github", mode: "link", content: "https://github.com/bronifty" },
      {
        icon: "X",
        mode: "link",
        content: "https://x.com/bronifty",
      },
    ],
  },
});
