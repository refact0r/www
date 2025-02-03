---
published: true
name: cmail
description: an interplanetary messaging system
thumbnail: cmail.png
images: [cmail.png]
github: https://github.com/refact0r/cmail
website: https://cmail.vercel.app
date: 2024-09-07
---

Cmail is a web messaging platform that simulates communication between planets in our solar system. The project was created for the Fall 2024 EmP Hackfest by [me](https://github.com/refact0r), [shibest](https://github.com/shibest), [ben-6](https://github.com/ben-6), and [raymon-zhang](https://github.com/raymon-zhang). We won 1st place in Group 3.

## the idea

Inspired by the hackathon's theme of space exploration, we decided to tackle the problem of interplanetary communication. Although light travels very quickly, it still takes hours or even days to cross the large distances between planets. So we decided to explore how a future interplanetary messaging system would account for these delays. The name "cmail" was a play on "email" and the letter "c", which represents the speed of light in physics.

## the implementation

Structurally, our project ended up being quite simple. It consists of a Sveltekit frontend and a Supabase backend. Instead of having actual user accounts and sign-in, we decided to treat each planet as a separate user. So Earth can send messages to Mars, and Mars can send messages to Earth. The homepage displays a list of messages with progress bars indicating the remaining time until the message is delivered.

## the data

The hard part of the project was simulating the solar system itself. We had to navigate the complicated formats and options of the NASA JPL Horizons API. Since the planetary positions can pretty much be calculated in the future, we ended up just bulk downloading the data and storing it to avoid constantly making API requests. From there, it was just a matter of calculating the distance between planets and dividing by the speed of light to get the communication delay.

## the model

With the messaging system in place and a way to calculate communication delay, we thought we were almost done. Then, someone came up with an idea: what if we displayed a live model of the solar system on the home page? This would be a great way to show the user how far away they are from their destination planet. After a couple of hours, we managed to build a simplified 2D SVG representation of the solar system on the homepage. Active messages would be shown as dots on lines connecting two planets. We even added a time slider at the bottom to allow the user to see the movement of the planets over time.

## conclusion

Ultimately, I'm pretty proud of cmail. It was a fun and challenging project that we were able to complete in a short amount of time. Although our project didn't actually do anything useful, I think it showed the importance of good user interface design.
