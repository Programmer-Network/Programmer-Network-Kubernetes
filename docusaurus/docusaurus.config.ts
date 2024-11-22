import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Learn K3S',
  tagline: 'Learn K3S, the lightweight Kubernetes distribution',
  favicon: 'img/favicon.ico',
   markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  // Set the production url of your site here
  url: 'https://kubernetes.programmer.network/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Learn Kubernetes',
      logo: {
        alt: 'Learn K3S',
        src: 'img/programmer-network-logo.svg',
      },
      items: [
        {
          href: 'https://github.com/agjs',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.twitch.tv/programmer_network',
          label: 'Twitch',
          position: 'right',
        },
        {
          href: 'https://www.youtube.com/@programmer-network',
          label: 'YouTube',
          position: 'right',
        },
        {
          href: 'https://programmer.network',
          label: 'Programmer Network',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: 'dark', // Set dark mode as the default
      disableSwitch: false, // Keep the theme switcher toggle (optional)
      respectPrefersColorScheme: true, // Ignore the user's system preference
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
