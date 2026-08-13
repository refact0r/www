---
published: true
name: 'spatial page transitions'
icon: 'code'
description: intuitive page transitions that map website hierarchy to 2D space (in sveltekit)
date: 2025-02-22
ogImage: 'og-image.png'
---

<script>
    import Image from '$lib/components/Image.svelte';

    import { onMount } from 'svelte';

    let activeRect = $state({ x: 0, y: 0, width: 0, height: 0 });

    function setRect(button) {
        const rect = button.getBoundingClientRect();
        const gridRect = button.parentElement.getBoundingClientRect();

        activeRect = {
            x: rect.x - gridRect.x,
            y: rect.y - gridRect.y,
            width: rect.width,
            height: rect.height
        };
    }

    function handleClick(e) {
        const button = e.currentTarget;
        setRect(button);
    }

    onMount(() => {
        const rootButton = document.querySelector('.blog-post');
        setRect(rootButton);
    });
</script>

<style>
    .grid {
        position: relative;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
        padding: 2rem;
        margin: 2rem 0;
        background: var(--bg-2);
        width: fit-content;
    }

    .grid button {
        background: none;
        padding: 1rem;
        border: 2px solid var(--txt-3);
        text-align: center;
        font-family: 'Space Mono', monospace;
    }
    .grid button:hover {
        background: var(--bg-3);
    }

    .active {
        position: absolute;
        border: 2px solid var(--blue);
        transition: 0.2s;
        pointer-events: none;
    }

    .root {
        grid-row: 1;
        grid-column: 1 / -1;
    }
    .about {
        grid-row: 2;
        grid-column: 1;
    }
    .projects {
        grid-row: 2;
        grid-column: 2;
    }
    .blog {
        grid-row: 2;
        grid-column: 3;
    }
    .photos {
        grid-row: 2;
        grid-column: 4;
    }
    .contact {
        grid-row: 2;
        grid-column: 5;
    }
    .projects-project {
        grid-row: 3;
        grid-column: 2;
    }
    .blog-post {
        grid-row: 3;
        grid-column: 3;
    }

    .scroll {
        overflow-x: auto;
    }

    @media (max-width: 800px) {
        .grid {
            gap: 0.5rem;
        }
        .grid button {
            padding: 0.5rem;
        }
    }
</style>

A while back, I added an interesting feature to my site. Lacking a better name, I've decided to call it "spatial page transitions". It's certainly not a novel concept, but I haven't really seen it in the web development space, so I thought I'd write a blog post about it.

## motivation

Client-side routing was one of the original reasons I chose SvelteKit for this site. Instead of letting the browser refresh the page, Svelte fetches the new page and swaps it in using JS. Since you stay in the same page context, you can add smooth transitions like fades or slides, which are conveniently included in Svelte's transition library.

Initially, I added a simple fly transition: old page exits downward, new page enters from the top. While it looked cool, it made navigating my site feel like scrolling a long list of pages. Websites aren't linear; they have hierarchy and nested relationships. So I wondered if I could somehow express this structure through the page transitions.

## idea

**The core idea is to lay out your website's pages in a 2d space, and have page transitions simulate moving around within this space.**

You can create the layout however you like, but I chose to use a grid, with the vertical axis representing page depth and the horizontal axis represent different categories of pages.

Here's a demonstration of my system. You can click on a box to simulate navigating to a page. The blue box represents what the user sees on their screen.

<div class="scroll">
    <figure class="grid">
        <div
            class="active"
            style:left="{activeRect.x}px"
            style:top="{activeRect.y}px"
            style:width="{activeRect.width}px"
            style:height="{activeRect.height}px"
        ></div>
        <button class="root" onclick={handleClick}>/</button>
        <button class="about" onclick={handleClick}>/about</button>
        <button class="projects" onclick={handleClick}>/projects</button>
        <button class="blog" onclick={handleClick}>/blog</button>
        <button class="photos" onclick={handleClick}>/photos</button>
        <button class="contact" onclick={handleClick}>/contact</button>
        <button class="projects-project" onclick={handleClick}>/projects/project</button>
        <button class="blog-post" onclick={handleClick}>/blog/post</button>
    </figure>
</div>

The root (/) page spans the entire top row because I wanted all pages to transition directly "upwards" to reach it. I also did not distinguish position for individual blog posts or projects, because navigating between them isn't very common.

You can try the actual transition on my site by navigating to a page like <a href="/contact">/contact</a> and navigating back. Notice the diagonal movement, because you're moving up in terms of depth and to the right in terms of category.

Spatial page transitions aren't just for show. They help users build a mental map of a site's structure and provide visual feedback about where they're going in the site hierarchy. Plus, they add some personality!

## implementation

To implement them in SvelteKit (with Svelte 5), we first need normal page transitions. This is what that would look like:

```svelte
<!-- +layout.svelte -->

<script>
    import { page } from '$app/state';
    import { fly } from 'svelte/transition';

    let { children } = $props();
<script>

<div class="container" data-sveltekit-noscroll>
    {#key page.url.pathname}
        <div
            class="transition"
            in:fly={{ duration: 150, delay: 50, y: -200 }}
            out:fly={{ duration: 150, y: 200 }}
        >
            {@render children?.()}
        </div>
    {/key}
</div>

<style>
    .container {
        height: 100%;
        display: grid;
    }

    .transition {
        grid-column-start: 1;
        grid-column-end: 2;
        grid-row-start: 1;
        grid-row-end: 2;
    }
</style>
```

The `#key` directive is used here to trigger the transition whenever the page changes. The transition itself is defined in the `in:fly` and `out:fly` directives. You can pass in an object with the desired duration, delay, and x/y movement. For fly transitions, I typically use a delay of 1/3-1/2 the duration on the `in:fly`, so the new page will appear after the old one has nearly disappeared.

Note the use of `display: grid` on `.container`. When the transition is happening, both the new and old pages will exist in `.container`, so we use a grid to make sure they are overlaid on top of each other. Also of note is the `data-sveltekit-noscroll` attribute on `.container`, which prevents SvelteKit from auto-scrolling to the top of the page when navigating.

Now we can add the actual spatial part. To create the effect, we need to change the transition based on the positions of the current and previous pages within that imaginary 2d space.

First, we need to store the pathnames of the current and previous pages. These state variables can be updated when the page changes using Svelte's `beforeNavigate` lifecycle function. Simply having an `$effect` based on `page.url.pathname` won't work, because the effect will run after the transition.

```svelte
<script>
    import { page } from '$app/state';
    import { fly } from 'svelte/transition';
    import { beforeNavigate } from '$app/navigation'; // [!code ++]

    let { children } = $props();

    // [!code ++:9]
    let currPage = $state(page.url.pathname);
    let prevPage = $state(''); 

    beforeNavigate((navigation) => {
        if (navigation.to?.url.pathname) {
            prevPage = currPage;
            currPage = navigation.to.url.pathname;
        }
    });
</script>

...
```

Now that we have the current and previous pages, we can calculate the transition properties based on their positions in the grid. We can do this by defining a `transition` function that takes the current and previous pages and returns the transition properties.

```svelte
<script>
    import { page } from '$app/state';
    import { fly } from 'svelte/transition';
    import { beforeNavigate } from '$app/navigation';
    import { prefersReducedMotion } from 'svelte/motion'; // [!code ++]

    let { children } = $props();

    let currPage = $state(page.url.pathname);
    let prevPage = $state('');

    beforeNavigate((navigation) => {
        if (navigation.to?.url.pathname) {
            prevPage = currPage;
            currPage = navigation.to.url.pathname;
        }
    });

    // [!code ++:49]
    const pages = [
        { name: 'projects', path: '/projects' },
        { name: 'blog', path: '/blog' },
        { name: 'photos', path: '/photos' },
        { name: 'about', path: '/about' },
        { name: 'contact', path: '/contact' }
    ];

    function transition(path, out) {
        // remove trailing slashes
        const cleanPath = path.replace(/\/$/, '');
        const cleanPrevPath = prevPage.replace(/\/$/, '');
        // calculate depth
        let currDepth = cleanPath.split('/').length;
        let prevDepth = cleanPrevPath.split('/').length;
        // calculate category indices
        const currParent = '/' + cleanPath.split('/')[1];
        const prevParent = '/' + cleanPrevPath.split('/')[1];
        let currParentIdx = pages.findIndex((page) => page.path === currParent);
        let prevParentIdx = pages.findIndex((page) => page.path === prevParent);
        // handle root page special case
        if (path === '/') {
            currParentIdx = prevParentIdx;
            currDepth = 1;
        }
        if (prevPage === '/') {
            prevParentIdx = currParentIdx;
            prevDepth = 1;
        }
        // calculate differences
        let xDiff = currParentIdx - prevParentIdx;
        let yDiff = currDepth - prevDepth;
        // handle out transitions and prefers-reduced-motion
        if (out) {
            xDiff *= -1;
            yDiff *= -1;
        }
        if (prefersReducedMotion.current) {
            xDiff *= 0;
            yDiff *= 0;
        }
        // add units and return transition properties
        return {
            duration: 150,
            delay: out ? 0 : 50,
            x: `${xDiff * 20}vh`,
            y: `${yDiff * 20}vh`
        };
    }
</script>

...
```

The transition function I use takes advantage of a `pages` array to find the horizontal position of categories. Page depth can be found from the number of slashes in the path.

The differences in page category and depth can then be calculated. For example, going from `/blog/post` to `/contact` would result in a `xDiff` of `3` and a `yDiff` of `-1`.

I chose to multiply the differences by `20vh`, or 20% of the viewport height, so that it would feel consistent across different devices. In our example, this would mean an `x` movement of `60vh` and a `y` movement of `-20vh`.

The `out` parameter is used to signal an in or out transition. This is necessary because the out transition needs to move in the opposite direction of the in transition, and only the in transition needs a delay.

Also, I use the `prefersReducedMotion` query to disable the transition movement when the user has reduced motion enabled. Transitions can cause discomfort for those with vestibular motion disorders, so this is an important accessibility consideration.

Finally, we can use the `transition` function in the `in:fly` and `out:fly` directives.

```svelte {7-8}
...

<div class="container" data-sveltekit-noscroll>
    {#key page.url.pathname}
        <div
            class="transition"
            in:fly={transition(page.url.pathname, false)}
            out:fly={transition(page.url.pathname, true)} 
        >
            {@render children?.()}
        </div>
    {/key}
</div>

...
```

## caveats

While this system works well for my site's relatively simple structure, there are some things to keep in mind:

- Transitions are probably a bad idea if performance is a top priority.
- Transition duration is a tradeoff between perceived speed and smoothness/visibility.
- Complex site structures might need more sophisticated mapping and logic.
- The transition distance needs to be balanced - too large and it feels jarring, too small and it's barely noticeable.
- Consider capping the x/y movement if you have a lot of pages or deep nesting.

## conclusion

I know most users will won't notice them on my site, but I still think spatial page transitions are pretty cool. They add an intuitive layer to navigation without adding any extra elements on the page. I believe more web developers should explore ways to make navigation feel more natural and coherent.

I hope you found this post interesting. If you implement something similar (or better), I'd love to see it!
