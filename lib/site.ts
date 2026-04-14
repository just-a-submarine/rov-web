export const site = {
  name: "只是一台潛水艇",
  nameEn: "Just a Submarine",
  description: "自製水下遙控載具（ROV）專案 — Electronics II 課程設計",
  githubOrg: "just-a-submarine",
  githubOrgUrl: "https://github.com/just-a-submarine",
  githubPersonalUrl: "https://github.com/RX5950XT",
  rovWebRepoUrl: "https://github.com/just-a-submarine/rov-web",
} as const;

export type RepoStatus = "available" | "coming-soon";

export interface Repo {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  url: string;
  status: RepoStatus;
  tech: string[];
}

export const repos: Repo[] = [
  {
    id: "rov-web",
    name: "rov-web",
    nameZh: "網站",
    description: "本站源碼：Next.js 15 網頁簡報 + 技術文件",
    url: "https://github.com/just-a-submarine/rov-web",
    status: "available",
    tech: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: "rov-firmware",
    name: "rov-firmware",
    nameZh: "ROV 韌體",
    description: "ESP32-S3-CAM 主控韌體：馬達控制、感測器、影像串流",
    url: "",
    status: "coming-soon",
    tech: ["C++", "ESP-IDF", "ESP-NOW"],
  },
  {
    id: "rov-groundstation",
    name: "rov-groundstation",
    nameZh: "地面站韌體",
    description: "地面站 ESP32 韌體：Xbox 手把接收、WebSocket、遙測轉發",
    url: "",
    status: "coming-soon",
    tech: ["C++", "ESP32", "WebSocket"],
  },
];
