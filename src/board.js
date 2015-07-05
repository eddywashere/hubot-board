// Description
//   A lightweight kanban chat bot for working with github issues
//
// Configuration:
//   HUBOT_BOARD_DEFAULT_USER=yourusername
//   HUBOT_BOARD_DEFAULT_STATUSES=['1 - Ready', '2 - Working', '3 - Done']
//
// Commands:
//   hubot board <user/repo> - shows default board (isssues labeled: ready, working, done)
//   hubot board <user/repo> !backlog - shows all backlog items
//   hubot board <user/repo> !mine - shows all issues assigned to you
//   hubot board <user/repo> <milestone:version> - shows board for the given milestone (ex: mile-stone-name:part-two)
//   hubot board <user/repo> <milestone:version> !backlog - show backlog issues for the given milestone
//   hubot board <user/repo> <milestone:version> !mine - show issues assigned to you for the given milestone
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
var statuses = process.env.HUBOT_BOARD_DEFAULT_STATUSES || ['1 - Ready', '2 - Working', '3 - Done'];
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
  robot.respond(patterns.baseCmd, function(res) {
    var username = defaultUser || res.match[2];
    var repo = res.match[3] || res.match[2];

    if(!defaultUser && !res.match[3]){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      if(err){ return console.log(err)}

      var github = new Github(token);
      github.getBoardIssues(username, repo, null, null, function(err, issues){
        if(err){ return console.log(err)};
        github.sendBoardMessage({title: repo + ' - issue(s)'}, robot, res, issues);
      });
    });
  });

  // 'board <user/repo> !backlog'
  robot.respond(patterns.getAllBacklogCmd, function(res) {
    var username = defaultUser || res.match[2];
    var repo = res.match[3] || res.match[2];
    var labels = ['0 - Backlog'];

    if(!defaultUser && !res.match[3]){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      if(err){ return console.log(err)}

      var github = new Github(token);
      github.getBoardIssues(username, repo, null, labels, function(err, issues){
        if(err){ return console.log(err)}
        github.sendBoardMessage({title: repo + ' - issue(s)'}, robot, res, issues, labels);
      });
    });
  });

  // 'board <user/repo> !mine'
  robot.respond(patterns.getAllMineCmd, function(res) {
    var username = defaultUser || res.match[2];
    var repo = res.match[3] || res.match[2];

    if(!defaultUser && !res.match[3]){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
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
        github.sendIssues('Issues assigned to @' + ghUser, robot, res, issues);
      });
    });
  });


  // 'board <user/repo> <milestone:version>'
  robot.respond(patterns.milestoneCmd, function(res) {
    var username = defaultUser || res.match[2];
    var repo = res.match[3] || res.match[2];
    var milestoneStrings = res.match[4].split(':');

    if(!defaultUser && !res.match[3]){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      if(err){ return console.log(err)}

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

  // 'board <user/repo> <milestone:version> !backlog'
  robot.respond(patterns.milestoneBacklogCmd, function(res) {
    var username = defaultUser || res.match[2];
    var repo = res.match[3] || res.match[2];
    var milestoneStrings = res.match[4].split(':');
    var labels = ['0 - Backlog'];

    if(!defaultUser && !res.match[3]){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
    }

    robot.identity.findToken(res.envelope.user.name, function(err, token){
      if(err){ return console.log(err)}

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

            var title = {title: repo + ' - ' + milestone.title + ' milestone', html_url: milestone.html_url};
            github.sendBoardMessage(title, robot, res, issues, labels);
          });
        } else {
          return res.send(res.random(failIntro) + ' I couldn\'t find a milestone with the following text: ' + milestoneStrings.join(', ') + '.');
        }
      });
    });
  });

  // 'board <user/repo> <milestone:version> !mine'
  robot.respond(patterns.milestoneMineCmd, function(res) {
    var username = defaultUser || res.match[2];
    var repo = res.match[3] || res.match[2];
    var milestoneStrings = res.match[4].split(':');

    if(!defaultUser && !res.match[3]){
      return res.send(res.random(failIntro) + ' Looks like someone didn\'t set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.')
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

};
