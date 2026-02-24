# Specification

## Summary
**Goal:** Make the feed post composer more compact and unify text and photo posting into a single composer experience.

**Planned changes:**
- Reduce padding and vertical spacing only within the post composer container at XPath `/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[2]/div[1]` to take up less vertical space while remaining usable.
- Update only the two post-type buttons at XPaths `/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[2]/div[1]/div[1]/div[1]/button[1]` and `/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[2]/div[1]/div[1]/div[1]/button[2]` so they drive one unified composer flow (single compose area) for both text and photo posts.
- Ensure the unified composer submits via the existing text-post flow when no image is selected, and via the existing photo-post flow (including upload progress feedback) when an image is selected, while keeping the existing Pro/Admin restriction that disables photo selection for non-Pro/Admin users.

**User-visible outcome:** The composer at the top of the feed is smaller and tighter, and users create either text posts or photo posts from the same composer area (with photo attachment available only to Pro/Admin users).
