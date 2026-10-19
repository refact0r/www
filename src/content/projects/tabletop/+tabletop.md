---
published: true
name: tabletop
description: your shopping tabs, laid out on one table
thumbnail: tabletop1.png
images: [tabletop.png, tabletop1.png, tabletop2.png, tabletop3.png, tabletop4.png]
github: https://github.com/refact0r/tabletop
website: https://tabletop.refact0r.dev
date: 2026-10-18
---

Tabletop is a shopping canvas. You send it your open product tabs/links and it lays them out as cards on one table, merged across stores, with the price you'd actually pay. Then you tell it what you care about and it scores everything around those priorities.

This project was created for [DubHacks '26](https://dubhacks-2026.devpost.com/), for the Visa "Reimagine Shopping" track.

## the idea

Before buying anything expensive, I tend to spend a lot of time researching: reading reviews, watching videos, and going back and forth between a few options. I've found that the hardest part is seeing how those options compare against each other. Shopping sites don't prioritize your criteria. They sort by what they want to sell, and their filters only cover basic specs. LLM chats are better since you can tell them what matters to you, but their answers aren't very information dense, and they can be biased by whichever sources they happen to find.

I wanted a single place to lay out all my options side by side and see how they measure up on the things I care about. Our pitch was "Figma for shopping".

## the app

Everything lives on one canvas that you can pan and zoom. A Chrome extension collects your open product tabs and places them on the table as cards. Listings of the same product from different stores are merged into one card, which shows the best final price after shipping and tax.

You describe what you care about in plain English, and each criterion becomes a colored lens in the sidebar with its own slider for adjusting weight. Every card shows a bar for each lens, scored from specs, expert opinions, and owner reviews. Adjusting a slider reorders the board and value map. If there isn't enough data to score a product, the card says so instead of guessing.

Below the board is a value map that plots fit against total price. A curve marks the products that provide the best value at each price point, making it easy to choose the best deal.

You can also ask questions or compare products, and the answers appear as new objects on the canvas. Tables are multiplayer, so you can decide with someone else and see each other's cursors live. Once you've decided, an agent can make the purchase within a spending limit you set.

## the design

I wanted the app to feel like spreading things out on a real desk, so we went with a paper theme. The interface has a subtle paper grain texture throughout. Each kind of canvas object has its own physical treatment: product cards are taped down, merged cards are paperclipped together, short questions are notecards, research is a stapled packet, and purchases print out as a receipt. My best idea was turning product thumbnail photos into die-cut stickers in the browser. I also took some inspiration from (<https://symposium.socratica.info/>) to add handdrawn doodles on the homepage and a watercolor background to the value map.

## implementation

The frontend is a simple React canvas (sorry Sveltekit, I gave in and let Claude pick whatever it wanted to use). I used [re-paint](https://github.com/refact0r/re-paint), my UI component library, with a Hono server that syncs boards live. Every change, whether it's a card being dragged or the AI adding a lens, goes through a single op layer, so anything can be undone.

For demo purposes, we scraped a focused dataset of 85 products with about 22k owner reviews and 6k expert opinions/comparisons. However, we also built a pipeline using Exa and Claude to scrape and merge products from any store, so the app can be used with real product links.

Within the canvas, most of the scoring, questions, research, and dynamic UI are handled by Claude Haiku 5.5 through Anthropic SDK, validated with Zod. I also used Jev to handle some smaller matching tasks.

## challenges

To be honest, I probably spent the most time thinking about what the user experience should look and feel like. Many of the implementation details were pretty easy to figure out with Opus 5.5 by my side. However, there were some parts that still weren't straightforward.

The stickers were trickier than expected. Store photos are served from many different CDNs, so the browser can't read their pixels. We ended up proxying the images through our server, then cutting out each product with a flood fill from the photo's edges, since nearly every product shot has a white background.

Getting reliable data was also harder than expected, hence the curated dataset for the hackathon demo. Stores actively resist scraping, some just don't provide enough specs and information, and matching products from different sources requires some care: "WH-1000XM6" and "WH1000XM6" are the same headphones, but the XM5 and XM6 are not.

## thoughts

Tabletop is probably the most visually interesting and UX-focused hackathon project I've made. Personally I think the project idea is quite good, and it's something I'll probably continue to use myself. However, I don't think it would be that easy to turn into a real product due to the data problem and the cost of running LLMs so heavily.

This was one of the most enjoyable hackathons I've done so far. Part of that was staying up late experimenting with all the features and interface details, and part was how many ideas we could build at once with AI. At one point my team had about five projects going in parallel: Tabletop, a SpaceX Starshield satellite tracker, an iMessage group chat money manager agent, an interplanetary spaceflight radiation optimizer, and an AI short-form clip generator.
