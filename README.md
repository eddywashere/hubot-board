# hubot-board [![Build Status](http://img.shields.io/travis/eddywashere/hubot-board/master.svg)](https://travis-ci.org/eddywashere/hubot-board)

A lightweight kanban-ish chat bot for working with github issues

See [`src/board.js`](src/board.js) for full documentation.

## Installation

In hubot project repo, run:

```
npm install hubot-board --save
```

This also requires [hubot-github-identity](https://github.com/tombell/hubot-github-identity) >= `0.10.0`. To add that to your project, use:

```
npm install --save hubot-github-identity@0.10.0
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

- **!board user/repo** - shows default board (isssues labeled: ready, working, done)
- **!board user/repo !new <title> - <body> - creates a new issue
- **!board user/repo !(backlog|ready|working|done)** - shows all backlog items
- **!board user/repo !mine** - shows all issues assigned to you
- **!board user/repo milestone:version** - shows board for the given milestone (ex: mile-stone-name:part-two)
- **!board user/repo milestone:version !new <title> - <body> - creates a new issue for a milestone
- **!board user/repo milestone:version !(backlog|ready|working|done)** - show backlog issues for the given milestone
- **!board user/repo milestone:version !mine** - show issues assigned to you for the given milestone

## TODO

- brainstorm ideas for sorting issues by priority
- add in commands as needed
