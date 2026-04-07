import { Config } from "@/data/config";

export type AboutItemType = "link" | "chip";

export interface AboutItem {
  label: string;
  href?: string;
}

export interface AboutSection {
  title: string;
  type: AboutItemType;
  items: AboutItem[];
}

export interface AboutPageConfig {
  introCard: {
    avatarSrc: string;
    avatarAlt: string;
    greetingText: string;
    greetingName: string;
    introParagraphs: string[];
  };
  conceptCard: {
    title: string;
    paragraphs: string[];
  };
  sections: [AboutSection, AboutSection, AboutSection];
}

export const aboutPageConfig: AboutPageConfig = {
  introCard: {
    avatarSrc: Config.AvatarURL,
    avatarAlt: "my-profile",
    greetingText: "你好，我是",
    greetingName: "avenor",
    introParagraphs: [
      "一名专注于 Web 前端开发的开发者，目前我深耕于 React 生态与工程化实践，在 Vite 与性能优化的世界里持续探索，希望在这里分享我的每一步‘循光’记录。",
      "There is a crack in everything, that's how the light gets in.",
    ],
  },
  conceptCard: {
    title: "站名理念",
    paragraphs: [
      "这个站点希望保留‘技术 + 叙事’的双重表达：既有可执行的代码实践，也有对问题本质的思考。",
      "每篇文章都尽量做到可复现、可检索、可复盘，让知识不仅能看懂，也能在下一次遇到问题时被再次使用。",
    ],
  },
  sections: [
    {
      title: "社交链接",
      type: "link",
      items: [
        {
          label: "GitHub",
          href: "https://github.com/hele160",
        },
        {
          label: "Email",
          href: "mailto:m15673213520@163.com",
        },
      ],
    },
    {
      title: "技术栈",
      type: "chip",
      items: [
        { label: "React" },
        { label: "HTML CSS" },
        { label: "TypeScript" },
      ],
    },
    {
      title: "爱好",
      type: "chip",
      items: [
        { label: "编程" },
        { label: "跑步" },
        { label: "阅读" },
      ],
    },
  ],
};
