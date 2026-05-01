# Graph Report - vegetableboy-admin  (2026-05-01)

## Corpus Check
- 15 files · ~6,090 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 51 nodes · 29 edges · 8 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]

## God Nodes (most connected - your core abstractions)
1. `graphify` - 6 edges
2. `Next.js` - 4 edges
3. `Next.js breaking changes warning` - 3 edges
4. `Vercel Logo SVG` - 2 edges
5. `Vercel Triangle Mark` - 2 edges
6. `Vercel` - 2 edges
7. `create-next-app` - 1 edges
8. `Geist` - 1 edges
9. `Vercel` - 1 edges
10. `app/page.js` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Next.js` --semantically_similar_to--> `Next.js breaking changes warning`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `Next.js breaking changes warning` --references--> `AGENTS.md`  [EXTRACTED]
  AGENTS.md → CLAUDE.md

## Hyperedges (group relationships)
- **Agent instruction files** — agents_nextjs_breaking_changes, claude_graphify, claude_agents_md [INFERRED 0.80]
- **graphify CLI subcommands** — claude_graphify_query, claude_graphify_path, claude_graphify_explain, claude_graphify_update [INFERRED 0.85]
- **Next.js project ecosystem** — readme_nextjs, readme_create_next_app, readme_geist, readme_vercel [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (7): Next.js breaking changes warning, node_modules/next/dist/docs/, AGENTS.md, create-next-app, Geist, Next.js, Vercel

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (7): graphify, graphify explain, graphify-out/GRAPH_REPORT.md, graphify-out/wiki/index.md, graphify path, graphify query, graphify update

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (3): Vercel, Vercel Logo SVG, Vercel Triangle Mark

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): app/page.js, development server

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): Global Symbolism, Globe Icon

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (1): File Document SVG Icon

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): Next.js Logo

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): Browser Window Icon with Traffic Light Controls

## Knowledge Gaps
- **18 isolated node(s):** `create-next-app`, `Geist`, `Vercel`, `app/page.js`, `development server` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 14`** (2 nodes): `app/page.js`, `development server`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `Global Symbolism`, `Globe Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `File Document SVG Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `Next.js Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `Browser Window Icon with Traffic Light Controls`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `create-next-app`, `Geist`, `Vercel` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._