import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Learn K3S",
  tagline: "Building a home mini data center using K3s, Mikrotik, and more",
  favicon: "img/favicon.ico",
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

  // Set the production url of your site here
  url: "https://k3s.guide/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
    "./src/plugins/tailwind-config.js",
  ],

  themeConfig: {
    image: "img/mini-data-center-social-card.jpg",
    navbar: {
      title: "K3s.guide",
      logo: {
        alt: "K3s.guide",
        src: "img/programmer-network-logo.svg",
      },
      items: [
        {
          href: "https://github.com/agjs",
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://www.twitch.tv/programmer_network",
          label: "Twitch",
          position: "right",
        },
        {
          href: "https://www.youtube.com/@programmer-network",
          label: "YouTube",
          position: "right",
        },
        {
          href: "https://programmer.network",
          label: "Programmer Network",
          position: "right",
        },
      ],
    },
    prism: {
      additionalLanguages: ["bash"],
      theme: prismThemes.ultramin,
      darkTheme: prismThemes.gruvboxMaterialDark,
    },
    colorMode: {
      defaultMode: "dark", // Set dark mode as the default
      disableSwitch: false, // Keep the theme switcher toggle (optional)
      respectPrefersColorScheme: true, // Ignore the user's system preference
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
