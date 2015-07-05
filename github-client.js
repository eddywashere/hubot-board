var Github = require("github");
var async = require('async');
var _ = require('lodash');
var defaultStatuses = process.env.HUBOT_BOARD_DEFAULT_STATUSES || ['1 - Ready', '2 - Working', '3 - Done'];

// TODO - refactor this after refactoring board.js

var GithubClient = function(token){
    this.client = new Github({
      version: "3.0.0"
    });

    this.client.authenticate({
        type: "token",
        token: token
    });
};

function getStatusColor(status) {
  var text = status;

  if(status && status.toLowerCase){
    text = status.toLowerCase();
  } else {
    return '#cccccc';
  }

  if (text.indexOf('blocked') >= 0 || text === 'red'){
    return '#c40022';
  } else if(text.indexOf('backlog') >= 0 || text === 'purple'){
    return '#9966ee';
  } else if(text.indexOf('done') >= 0 || text === 'green'){
    return '#00a96d';
  } else if(text.indexOf('working') >= 0 || text === 'yellow'){
    return '#ff9d00';
  } else if(text.indexOf('ready') >= 0 || text === 'blue'){
    return '#1e6ec1';
  } else if(text === 'black'){
    return '#333333';
  } else {
    return '#cccccc';
  }
}

function Issue (item, status, text){
  this.pretext = null;
  this.title = item.number ? item.number + ' ' + item.title : item.title;
  this.title_link = item.html_url;
  this.color = getStatusColor(status);
  if(text){
    this.text = text;
  }
}

function Milestone (item, status){
  this.title = item.title + ' [' + item.open_issues + '/' + (item.open_issues + item.closed_issues) + ']';
  this.title_link = item.html_url;
  this.color = getStatusColor(status);
}

GithubClient.prototype.getIssues = function(options, cb){
  var github = this;

  github.client.issues.repoIssues(options, function(err, items){
    if(options.per_page){
      cb(err, items);
    } else {
      github.getCollection(err, items, cb);
    }
  });
};

GithubClient.prototype.getBoardIssues = function(username, repo, milestone, statuses, cb){
  var github = this;
  var calls = {};
  statuses = statuses || defaultStatuses;

  statuses.forEach(function(status){
    calls[status] = function(callback){
      var options = {
        user: username,
        repo: repo,
        labels: status
      };
      if(milestone && milestone.number){
        options.milestone = milestone.number;
      }
      github.client.issues.repoIssues(options, function(err, items){
        github.getCollection(err, items, callback);
      });
    };
  });

  async.parallel(
    calls,
    function(err, results) {
      cb(err, results);
    }
  );
};

GithubClient.prototype.getMilestones = function(user, repo, cb){
  var github = this;

  var options = {
    user: user,
    repo: repo,
    per_page: 100
  };

  github.client.issues.getAllMilestones(options, function(err, items){
    github.getCollection(err, items, cb);
  });
};

GithubClient.prototype.getMilestone = function(number, fullRepo, cb){
  var github = this;
  var user = fullRepo.split('/')[0];
  var repo = fullRepo.split('/')[1];

  var options = {
    user: user,
    repo: repo,
    number: number
  };

  github.client.issues.getMilestone(options, cb);
};

GithubClient.prototype.getCollection = function(err, items, cb, collection){
    var github = this;

    collection = collection || [];
    collection = collection.concat(items);
    if(github.client.hasNextPage(items)){
      return github.client.getNextPage(items, function(err, data){
        return github.getCollection(err, data, cb, collection);
      });
    } else {
      cb(err, collection);
    }
};

GithubClient.prototype.sendBoardMessage = function(title, robot, res, issues, statuses){
  var content = [];
  statuses = statuses || defaultStatuses;

  statuses.forEach(function(status){
    if(issues[status]){
      issues[status].forEach(function(issue, i){
        var msg = new Issue(issue, status);
        if(i === 0){
          var header = new Issue({title: status}, 'black');
          content.push(header);
        }
        content.push(msg);
      });
    }
  });

  content.unshift(new Issue(title, 'black'));
  robot.emit('slack-attachment',{
    channel: res.message.room,
    content: content
  });
};

GithubClient.prototype.sendIssues = function(title, robot, res, issues){
  var content = [];

  issues.forEach(function(issue, i){
    var labels = _.pluck(issue.labels, 'name').join(', ');
    var msg = new Issue(issue, labels, 'Labels: ' + labels);
    content.push(msg);
  });

  content.unshift(new Issue(title, 'black'));
  robot.emit('slack-attachment',{
    channel: res.message.room,
    content: content
  });
};

GithubClient.prototype.sendBoardMilestones = function(name, robot, res, milestones){
  var content = [];

  milestones.forEach(function(milestone){
      var msg = new Milestone(milestone, 'green');
      content.push(msg);
  });

  content.unshift(new Issue({title: 'Milestones'}, 'black'));
  robot.emit('slack-attachment',{
    channel: res.message.room,
    content: content
  });
};

module.exports = GithubClient;
