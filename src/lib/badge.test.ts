import { describe, expect, it } from "vitest";
import { buildBadgeEmbed } from "@/lib/badge";

describe("buildBadgeEmbed", () => {
  const opts = {
    apiBase: "https://api.example.com",
    siteUrl: "https://app.example.com",
  };

  it("builds absolute badge URLs from the API and site origins", () => {
    const embed = buildBadgeEmbed("my-agent", opts);
    expect(embed.svgUrl).toBe("https://api.example.com/v1/badge/my-agent.svg");
    expect(embed.embedUrl).toBe("https://api.example.com/v1/badge/my-agent/embed");
    expect(embed.agentUrl).toBe("https://app.example.com/agents/my-agent");
  });

  it("produces ready-to-paste HTML, Markdown, and iframe snippets", () => {
    const embed = buildBadgeEmbed("my-agent", opts);
    expect(embed.html).toContain('<img src="https://api.example.com/v1/badge/my-agent.svg"');
    expect(embed.html).toContain('href="https://app.example.com/agents/my-agent"');
    expect(embed.markdown).toBe(
      "[![Verified by Sentinel](https://api.example.com/v1/badge/my-agent.svg)](https://app.example.com/agents/my-agent)",
    );
    expect(embed.iframe).toContain('<iframe src="https://api.example.com/v1/badge/my-agent/embed"');
  });

  it("normalises trailing slashes on the provided origins", () => {
    const embed = buildBadgeEmbed("x", {
      apiBase: "https://api.example.com/",
      siteUrl: "https://app.example.com/",
    });
    expect(embed.svgUrl).toBe("https://api.example.com/v1/badge/x.svg");
    expect(embed.agentUrl).toBe("https://app.example.com/agents/x");
  });
});
