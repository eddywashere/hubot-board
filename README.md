# hubot-board [![Build Status](http://img.shields.io/travis/eddywashere/hubot-board/master.svg)](https://travis-ci.org/eddywashere/hubot-board)

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
  "hubot-github-identity",
  "hubot-board"
]
```

## Registering your github account with hubot

Step 1: Create a token to access your github info as yourself

```
curl -i https://api.github.com/authorizations -d '{"note":"token for slackbot","scopes":["repo"]}' -u “yourusername"
```

Step 2: Register your username and token

- locally at `http://localhost:8080/github/identity`
- production `https://HUBOT_HOSTNAME/github/identity`

Step 3: Tell hubot who you are

- in a channel `hubot I am eddywashere`
- direct message to hubot `I am eddywashere`

## Chat commands

- **hubot board user/repo** - shows default board (isssues labeled: ready, working, done)
- **hubot board user/repo !(backlog|ready|working|done)** - shows all backlog items
- **hubot board user/repo !mine** - shows all issues assigned to you
- **hubot board user/repo <milestone:version>** - shows board for the given milestone (ex: mile-stone-name:part-two)
- **hubot board user/repo <milestone:version> !(backlog|ready|working|done)** - show backlog issues for the given milestone
- **hubot board user/repo <milestone:version> !mine** - show issues assigned to you for the given milestone
