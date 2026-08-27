---
published: true
name: re-collect
description: personal visual inspiration library
thumbnail: recollect.png
images: [recollect1.png, recollect2.png, recollect3.png]
github: https://github.com/refact0r/re-collect
website: https://collect.refact0r.dev
date: 2026-02-19
---

<script>
    import CaptionImage from '$lib/components/CaptionImage.svelte';
</script>

re-collect is a personal visual inspiration library. It's basically a [are.na](https://are.na) clone, built on sveltekit + convex + r2 + workers.

## why

For a long time, I've maintained a google keep list of websites I think have cool designs. I wanted a more organized way to access and view them. I tried are.na, but the free tier is quite limited. So I decided to build my own. The original idea was for web design inspiration, but the app worked for any kind of visual content, so I naturally extended the scope.

Part of the appeal was wanting to refine my aesthetic taste. Having everything in one place makes it easier to revisit inspiration (hence the name, re-collect). It also was good excuse to pick up some new tech (convex, r2) and experiment with new agentic coding tools.

## the app

The app is a pretty standard sveltkit SPA. I heard good things about convex, so I decided to go with it over supabase. The realtime features are maybe a bit overkill for this type of app, but overall the dev experience was really good. Part of that is because convex keeps a lot of the database functions in your codebase, so ai agents are effective at using it.

For image storage, I went with r2 because of zero egress fees and explicit convex support. By defaault, image urls get changed every time you fetch them to keep the bucket private. I had to build a cache system on the frontend to avoid constantly reloading images.

One of the best features of are.na is that it automatically screenshots links you paste. To replicate this feature, I built a cloudflare worker that uses puppeteer to visit the website and take a screenshot. It works, but there are some challenges I have yet to figure out. For one, I would like to detect when a website's loading animation finishes so I can take the screenshot faster, instead of waiting a long fixed timeout every time. I also want to be able to automatically close cookie popups for a cleaner screenshot.

Currently, the project has an extremely primitive single-user login system (read-only until you enter a password). The idea was for me to take full advantage of a free plan r2 bucket and effectively have unlimited storage. But in the future I may extend the project to be a full saas, if other people express interest in it.

## evil masonry grids

Probably the hardest part of the project was building a masonry image grid that supported drag and drop reordering, kinda like what pinterest has. It’s a deceptively difficult problem because the rigid rules of a masonry layout are at odds with unpredictable user intent. Masonry layouts work by placing the next item into the shortest available column. This immediately creates a challenge: you cannot know the true height of an item until it is rendered to the DOM, so you have to estimate it.

But the bigger issue is the drag and drop UX. My initial approach calculated the drop position spatially, but the resulting drop preview rarely matched the final sorted layout. The best solution I found was to aggressively run the full layout algorithm on every hover state, injecting a placeholder item to calculate the exact future state. While this guarantees the preview matched the end result, it means you physically cannot drop items into certain visual spaces, because the layout algorithm forbids those arrangements. Ultimately, I don't think there is no elegant solution to this problem. Even pinterest's implementation feels janky a lot of the time.

## thoughts

This was a really enjoyable project to build, partly due to my experimentation with various ai coding tools. They let me focus on overall planning and visual polish instead of writing major features. I completed the core in under a month, basically spending an hour or two on it every other day.
