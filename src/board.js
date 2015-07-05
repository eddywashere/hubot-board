// Description
//   A lightweight kanban chat bot for working with github issues
//
// Configuration:
//   HUBOT_BOARD_PREFIX=!board
//   HUBOT_BOARD_DEFAULT_TOKEN=yourtoken
//   HUBOT_BOARD_DEFAULT_USER=yourusername
//   HUBOT_BOARD_DEFAULT_STATUSES=['1 - Ready', '2 - Working', '3 - Done']
//
// Commands:
//   !board <user/repo> - shows default board (isssues labeled: ready, working, done)
//   !board <user/repo> !(backlog|ready|working|done) - shows all backlog items
//   !board <user/repo> !mine - shows all issues assigned to you
//   !board <user/repo> !latest - shows latest issues for a repo
//   !board <user/repo> <milestone:version> - shows board for the given milestone (ex: mile-stone-name:part-two)
//   !board <user/repo> <milestone:version> !(backlog|ready|working|done) - show backlog issues for the given milestone
//   !board <user/repo> <milestone:version> !mine - show issues assigned to you for the given milestone
//   !board <user/repo> <milestone:version> !new <title, body> !assign <user> - create a new issue for a milestone
// Notes:
//   requires hubot-github-identity
//
// Author:
//   Eddy Hernandez <edward.d.hernandez@gmail.com>

var _ = require('lodash');
var patterns = require('./patterns');
var Github = require('../github-client');
var scriptPrefix = process.env.HUBOT_BOARD_PREFIX || 'board';
var defaultUser = process.env.HUBOT_BOARD_DEFAULT_USER;
var defaultToken = process.env.HUBOT_BOARD_DEFAULT_TOKEN;
var statuses = process.env.HUBOT_BOARD_DEFAULT_STATUSES || ['1 - Ready', '2 - Working', '3 - Done'];
var allStatuses = ['0 - Backlog'].concat(statuses);

var failIntro = [
  'Argh!',
  'Sorrry.',
  'womp womp.',
  'Eep.',
  'Hmmm...',
  'Hmm.',
  'Slow down there.',
  'Whoa now.',
  'About that...'
];

function findByStrings(items, prop, strings){
  var collection = _.filter(items, function(i){
    var title = _.kebabCase(i[prop]);

    return _.every(strings, function(text){
      var pattern = new RegExp(text, 'ig');
      return title.match(pattern);
    });
  });

  if(collection.length){
    return collection;
  } else {
    return false;
  }
}

module.exports = function(robot) {

  // 'board <user/repo>'
  robot.hear(patterns.baseCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      token = token || defaultToken;
      if(err && !token){ return console.log(err)}

      var github = new Github(token);
      github.getBoardIssues(username, repo, null, null, function(err, issues){
        if(err){ return console.log(err)};
        var title = {
          title: repo + ' - milestone issue(s)',
          html_url: 'https://github.com/' + username + '/' + repo + '/milestones'
        };
        github.sendBoardMessage(title, robot, res, issues);
      });
    });
  });

  // 'board <user/repo> !(backlog|ready|working|done)'
  robot.hear(patterns.getAllStatusCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];
    var label = res.match[4];

    var labels = _.filter(allStatuses, function(status){
      return status.match(new RegExp(label, 'i'));
    });

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      token = token || defaultToken;
      if(err && !token){ return console.log(err)}

      var github = new Github(token);
      github.getBoardIssues(username, repo, null, labels, function(err, issues){
        if(err){ return console.log(err)}
        var title = {
          title: repo + ' - ' + label + ' issue(s)',
          html_url: 'https://github.com/' + username + '/' + repo + '/labels/' + encodeURIComponent(labels[0])
        };
        github.sendBoardMessage(title, robot, res, issues, labels);
      });
    });
  });

  // 'board <user/repo> !mine'
  robot.hear(patterns.getAllMineCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.getGitHubUserAndToken(res.envelope.user.name, function(err, ghUser, token){
      if(err){ return console.log(err)}

      var github = new Github(token);
      var options = {
        user: username,
        repo: repo,
        assignee: ghUser
      };
      github.getIssues(options, function(err, issues){
        if(err){ return console.log(err)}
        var title = {
          title: repo + ' - Issues assigned to @' + ghUser,
          html_url: 'https://github.com/' + username + '/' + repo + '/assigned/' + ghUser
        };
        github.sendIssues(title, robot, res, issues);
      });
    });
  });

  // 'board <user/repo> !latest'
  robot.hear(patterns.getLatestCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      token = token || defaultToken;
      if(err && !token){ return console.log(err)}

      var github = new Github(token);
      var options = {
        user: username,
        repo: repo,
        per_page: 5,
        page: 0
      };
      github.getIssues(options, function(err, issues){
        if(err){ return console.log(err)}
        var title = {
          title: repo + ' - Latest Issues',
          html_url: 'https://github.com/' + username + '/' + repo + '/issues'
        };
        github.sendIssues(title, robot, res, issues);
      });
    });
  });

  // 'board <user/repo> <milestone:version>'
  robot.hear(patterns.milestoneCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];
    var milestoneStrings = res.match[4].split(':');

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      token = token || defaultToken;
      if(err && !token){ return console.log(err)}

      var github = new Github(token);

      github.getMilestones(username, repo, function(err, milestones){
        if(err){ return console.log(err)}
        var matchedMilestones = findByStrings(milestones, 'title', milestoneStrings);
        var milestone, options;

        if(matchedMilestones.length){
          milestone = matchedMilestones[0];
          options = {user: username, repo: repo, milestone: milestone.number};

          github.getBoardIssues(username, repo, milestone, null, function(err, issues){
            if(err){ return console.log(err)}

            var title = {title: repo + ' - ' + milestone.title + ' milestone', html_url: milestone.html_url};
            github.sendBoardMessage(title, robot, res, issues);
          });
        } else {
          return res.send(res.random(failIntro) + ' I couldn\'t find a milestone with the following text: ' + milestoneStrings.join(', ') + '.');
        }
      });
    });
  });

  // 'board <user/repo> <milestone:version> !(backlog|ready|working|done)'
  robot.hear(patterns.milestoneStatusCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];
    var milestoneStrings = res.match[4].split(':');
    var label = res.match[5];

    var labels = _.filter(allStatuses, function(status){
      return status.match(new RegExp(label, 'i'));
    });

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      token = token || defaultToken;
      if(err && !token){ return console.log(err)}

      var github = new Github(token);

      github.getMilestones(username, repo, function(err, milestones){
        if(err){ return console.log(err)}

        var matchedMilestones = findByStrings(milestones, 'title', milestoneStrings);
        var milestone, options;

        if(matchedMilestones.length){
          milestone = matchedMilestones[0];
          options = {user: username, repo: repo, milestone: milestone.number};

          github.getBoardIssues(username, repo, milestone, labels, function(err, issues){
            if(err){ return console.log(err)}

            var title = {title: repo + ' - ' + milestone.title + ' milestone, ' + label + ' issues', html_url: milestone.html_url};
            github.sendBoardMessage(title, robot, res, issues, labels);
          });
        } else {
          return res.send(res.random(failIntro) + ' I couldn\'t find a milestone with the following text: ' + milestoneStrings.join(', ') + '.');
        }
      });
    });
  });

  // 'board <user/repo> <milestone:version> !mine'
  robot.hear(patterns.milestoneMineCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];
    var milestoneStrings = res.match[4].split(':');

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.getGitHubUserAndToken(res.envelope.user.name, function(err, ghUser, token){
      if(err){ return console.log(err)}

      var github = new Github(token);

      github.getMilestones(username, repo, function(err, milestones){
        if(err){ return console.log(err)}

        var matchedMilestones = findByStrings(milestones, 'title', milestoneStrings);
        var milestone, options;

        if(matchedMilestones.length){
          milestone = matchedMilestones[0];
          options = {user: username, repo: repo, assignee: ghUser, milestone: milestone.number};

          github.getIssues(options, function(err, issues){
            if(err){ return console.log(err)}

            var title = {title: repo + ' - ' + milestone.title + ' milestone, assigned to: ' + ghUser, html_url: milestone.html_url};
            github.sendIssues(title, robot, res, issues);
          });
        } else {
          return res.send(res.random(failIntro) + ' I couldn\'t find a milestone with the following text: ' + milestoneStrings.join(', ') + '.');
        }
      });
    });
  });

  // 'board <user/repo> <milestone:version> !new'
  robot.hear(patterns.milestoneNewIssueCmd, function(res) {
    var username = res.match[2];
    var repo = res.match[3];
    var milestoneStrings = res.match[4] ? res.match[4].split(':') : false;
    var issueTitle = _.trim(res.match[5]);
    var issueBody = _.trim(res.match[6]);
    var options;

    if(!defaultUser && !repo){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    if(!repo){
      repo = username;
      username = defaultUser;
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      if(err){ return console.log(err)}

      var github = new Github(token);

      options = {
        user: username,
        repo: repo,
        title: issueTitle,
        body: issueBody
      };

      if(!milestoneStrings){
        return github.createIssue(options, function(err, issue){
          if(err){ return console.log(err)}

          var title = {title: 'Issue created for ' + repo, html_url: issue.html_url};
          github.sendIssues(title, robot, res, [issue]);
        });
      }

      github.getMilestones(username, repo, function(err, milestones){
        if(err){ return console.log(err)}

        var matchedMilestones = findByStrings(milestones, 'title', milestoneStrings);
        var milestone;

        if(matchedMilestones.length){
          milestone = matchedMilestones[0];
          options.milestone = milestone.number;

          github.createIssue(options, function(err, issue){
            if(err){ return console.log(err)}

            var title = {title: 'Issue created for ' + repo + ' - ' + milestone.title + ' milestone', html_url: issue.html_url};
            github.sendIssues(title, robot, res, [issue]);
          });
        } else {
          return res.send(res.random(failIntro) + ' I couldn\'t find a milestone with the following text: ' + milestoneStrings.join(', ') + '.');
        }
      });
    });
  });
};
