# hubot-board

A lightweight kanban-ish chat bot for working with github issues

See [`src/board.js`](src/board.js) for full documentation.

## Installation

In hubot project repo, run:

```
npm install hubot-board --save
```

This also requires a forked version of [hubot-github-identity](https://github.com/eddywashere/hubot-github-identity/commit/b1df4045e36e321e55c2a2baead5456e1d5d664f). To add that to your project, use:

```
npm install --save eddywashere/hubot-github-identity#b1df4045e36e321e55c2a2baead5456e1d5d664f
```

Then add **hubot-board** & **hubot-github-identity** to your `external-scripts.json`:

```json
[
  "hubot-github-identity"
  "hubot-board"
]
```

## Chat commands

```
hubot board <user/repo> - shows default board (isssues labeled: ready, working, done)

hubot board <user/repo> !backlog - shows all backlog items

hubot board <user/repo> !mine - shows all issues assigned to you

hubot board <user/repo> <milestone:version> - shows board for the given milestone (ex: mile-stone-name:part-two)

hubot board <user/repo> <milestone:version> !backlog - show backlog issues for the given milestone

hubot board <user/repo> <milestone:version> !mine - show issues assigned to you for the given milestone
```