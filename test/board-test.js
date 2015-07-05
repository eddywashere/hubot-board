var path = require('path');
var chai = require('chai');
var sinon = require('sinon');
var Helper = require ('hubot-test-helper');
var patterns = require('../src/patterns');
var expect;

chai.use(require('sinon-chai'));
expect = chai.expect;

var room = null;
var github;
var helper = new Helper(path.join(__dirname, "..", "src", "board.js"));

describe('board', function() {

  describe('<user/repo>', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        findToken: sinon.spy()
      };
    });

    it("responds with board info for default statuses", function() {
      var msg = 'hubot board username/repo';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.robot.identity.findToken).to.have.been.calledWith('me');
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";

      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

  describe('<user/repo> !(backlog|ready|working|done)', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        findToken: sinon.spy()
      };
    });

    it("responds with all the backlog issues for a repo", function() {
      var msg = 'hubot board username/repo !backlog';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.robot.identity.findToken).to.have.been.calledWith('me');
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username !backlog';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";

      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

  describe('<user/repo> !latest', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        findToken: sinon.spy()
      };
    });

    it("responds with all the latest issues for a repo", function() {
      var msg = 'hubot board username/repo !latest';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.robot.identity.findToken).to.have.been.calledWith('me');
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username !latest';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";

      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

  describe('<user/repo> !mine', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        getGitHubUserAndToken: sinon.spy()
      };
    });

    it("responds with all my issues for a repo", function() {
      var msg = 'hubot board username/repo !mine';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.robot.identity.getGitHubUserAndToken).to.have.been.calledWith('me');
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username !mine';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";

      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

  describe('<user/repo> <milestone:version>', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        findToken: sinon.spy()
      };
    });

    it("responds with board info for a specific milestone", function() {
      var msg = 'hubot board username/repo milestone-name:one';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username  milestone-name:one';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

  describe('<user/repo> <milestone:version> !(backlog|ready|working|done)', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        findToken: sinon.spy()
      };
    });

    it("responds with backlog issues for a specific milestone", function() {
      var msg = 'hubot board username/repo milestone:one !backlog';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username milestone-name:one !backlog';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

  describe('<user/repo> <milestone:version> !mine', function() {
    beforeEach(function() {
      room = helper.createRoom();
      room.robot.identity = {
        getGitHubUserAndToken: sinon.spy()
      };
    });

    it("responds with all my issues for a repo", function() {
      var msg = 'hubot board username/repo milestone:three !mine';
      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.robot.identity.getGitHubUserAndToken).to.have.been.calledWith('me');
    });

    it("suggests full user/repo when default user not set", function() {
      var msg = 'hubot board username milestone:three !mine';
      var response = "Looks like someone didn't set HUBOT_BOARD_DEFAULT_USER. Try using username/repo in the meantime.";

      room.user.say('me', msg);
      expect(['me', msg]).to.deep.equal(room.messages[0]);
      expect(room.messages[1][1]).to.contain(response);
    });
  });

});
