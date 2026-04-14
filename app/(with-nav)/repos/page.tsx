import type { Metadata } from "next";
import { ExternalLink, Github, Lock } from "lucide-react";
import { repos, site } from "@/lib/site";

export const metadata: Metadata = { title: "GitHub 倉庫" };

export default function ReposPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Github size={22} className="text-accent-cyan" />
          <h1 className="text-2xl font-bold text-foreground">GitHub 倉庫</h1>
        </div>
        <p className="text-muted text-sm">
          專案源碼分佈於{" "}
          <a
            href={site.githubOrgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline font-mono"
          >
            {site.githubOrg}
          </a>{" "}
          組織下的多個倉庫。
        </p>
      </div>

      {/* Repo cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {repos.map((repo) => {
          const available = repo.status === "available";
          return (
            <div
              key={repo.id}
              className="relative glass rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200
                         hover:border-accent-cyan/20"
            >
              {/* Coming soon overlay */}
              {!available && (
                <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-[2px] z-10
                                flex flex-col items-center justify-center gap-2">
                  <Lock size={20} className="text-muted" />
                  <span className="text-xs text-muted font-mono">隨專案進度釋出</span>
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan-dim flex items-center justify-center">
                  <Github size={18} className="text-accent-cyan" />
                </div>
                {available && (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-accent-cyan transition-colors"
                    aria-label={`開啟 ${repo.name}`}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              {/* Title */}
              <div>
                <p className="font-semibold text-foreground text-sm">{repo.nameZh}</p>
                <p className="text-xs text-muted font-mono mt-0.5">{repo.name}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-muted leading-relaxed flex-1">{repo.description}</p>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5">
                {repo.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
