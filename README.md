# Compsci.blog

This is a personal blog for my study of and experimentation with various aspects of computer science, from software engineering to computer architecture to artificial intelligence to human interaction.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
- [Author](#author)

## Overview

### Application functionality

Users should be able to:

- Read and view blog posts
- Filter blog posts by category and search
- Subscribe to a regular newsletter with posts

### Screenshot

![](./screenshot.jpg)

### Links

- Live Site URL: [https://compsciblog.herokuapp.com](https://compsciblog.herokuapp.com)

## My process

-I wanted to build a blog application before I started school, so that if I learned anything particularly interesting or if I wanted to discuss a topic, I could have a record of those topics somewhere where I can share with others.

- Because I'm the only one who will be posting, I currently have no use for setting up different types of users, and Django's admin site allows me to create posts as needed.

- I began by creating a boilerplate Django blog application, then added functionality bit by bit. My initial goal was to get an application running in production, so I established all of the variables and files I needed and then published.

- I found a wireframe of a blog website from moqups and created it with HTML/SCSS/JS. I styled individual posts by watching some videos about good blog post design, which included things such as having good titles, having a post summary at the top, having clear headers, avoiding long blocks of text, having a "read more" section, and having a way to subscribe.

- I integrated Twilio SendGrid so that I can send emails to subscribers (I'm not currently actually sending anything).

- I wanted to be able to experiment with various code snippets in my blog posts, so I used a rich text editor that can run scripts for my blog post body, and then call and defer the JavaScript that I need for each individual post.

- I wanted to add as much interactivity to my blog posts as possible, so I scripted things like VoteBoxes into certain posts. These snippets accept user input and make a fetch call to the Django backend and updates the frontend. I have not yet decided on using a RESTful API for the backend, but may choose to do so if my frontend becomes more complicated.

- I added a bunch of cognitive tests using React. It currently uses an in-browser Babel processor which isn't optimal but I haven't gotten around to changing that yet. The tests currently use localStorage to store the user's test results, but I may enable user authentication in the future for user-specific interactables.

- I had a comment section but I've since removed it because I feel like there was already too much going on in any single blog post. I do think comments are great but I want to think of a cleaner way to implement them.

### Built with

- Django
- PostgresQL
- Heroku
- Libraries used: React, D3, Chart, Three, Mathjax, Prism

### What I learned

### Continued development

- Improve blog design, as it's currently mostly just a wireframe, but retain readability
- Improve SEO
- Pay for Heroku before November! Get a domain name!

## Author

- Website - [wavegate](https://github.com/wavegate)
