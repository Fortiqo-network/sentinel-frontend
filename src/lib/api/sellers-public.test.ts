import { describe, expect, it } from "vitest";
import {
  CommentListSchema,
  PublicAgentSummarySchema,
  SellerFeedSchema,
  SellerPostSchema,
  SellerPublicProfileSchema,
} from "@/lib/api/sellers-public";

describe("sellers-public schemas", () => {
  it("parses a full seller profile with popularity fields", () => {
    const profile = SellerPublicProfileSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      handle: "acme",
      displayName: "Acme",
      organization: "Acme Inc",
      githubHandle: "acme",
      createdAt: "2026-07-06T00:00:00Z",
      agents: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          slug: "a1",
          name: "A1",
          tier: "proxy",
          trustScore: 80,
          ratingAvg: 4.5,
          ratingCount: 10,
        },
      ],
    });
    expect(profile.handle).toBe("acme");
    expect(profile.agents[0]?.ratingCount).toBe(10);
  });

  it("defaults ratingCount to 0 and tags to [] when omitted", () => {
    const agent = PublicAgentSummarySchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440002",
      slug: "a2",
      name: "A2",
      tier: "managed",
    });
    expect(agent.ratingCount).toBe(0);
    expect(agent.tags).toEqual([]);
  });

  it("parses a feed and its posts", () => {
    const feed = SellerFeedSchema.parse({
      items: [
        {
          id: "p1",
          kind: "article",
          title: "Hello",
          bodyMd: "# hi",
          likeCount: 2,
          commentCount: 1,
          createdAt: "2026-07-06T00:00:00Z",
        },
      ],
      total: 1,
    });
    expect(feed.total).toBe(1);
    expect(feed.items[0]?.kind).toBe("article");
  });

  it("parses an impression post with a null title", () => {
    const post = SellerPostSchema.parse({
      id: "p2",
      kind: "impression",
      title: null,
      bodyMd: "gm",
      likeCount: 0,
      commentCount: 0,
      createdAt: "2026-07-06T00:00:00Z",
    });
    expect(post.title).toBeNull();
  });

  it("parses threaded comments", () => {
    const list = CommentListSchema.parse({
      items: [
        {
          id: "c1",
          parentCommentId: null,
          authorId: "u1",
          authorName: "Ann",
          bodyMd: "nice",
          createdAt: "2026-07-06T00:00:00Z",
        },
        {
          id: "c2",
          parentCommentId: "c1",
          authorId: "u2",
          authorName: "Bob",
          bodyMd: "agreed",
          createdAt: "2026-07-06T00:00:00Z",
        },
      ],
      total: 2,
    });
    expect(list.items[1]?.parentCommentId).toBe("c1");
  });
});
