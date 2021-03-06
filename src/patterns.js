'use strict';

var patterns = {};

patterns.scriptPrefix = process.env.HUBOT_BOARD_PREFIX || '!board';
patterns.repository = "([-_\.0-9a-z]+)";
patterns.fullRepo = patterns.repository + "(?:\\/([^\\s]+))?";
patterns.tags = "(?:[\\s])#([^\\s]+)";
patterns.endspace = "(?:\\s+)?$";
patterns.full_command = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+(?:\([-_\.0-9a-z:]+))?(?:\\s+(?:to|in|on)\\s+" +
  patterns.repository +
  "(?:\\/([^\\s]+))?)?" +
  patterns.endspace,
  "i");

patterns.baseCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  patterns.endspace,
  "i");

patterns.getAllStatusCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+!(backlog|ready|working|done)$" +
  patterns.endspace,
  "i");

patterns.getAllMineCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+(?:!mine)" +
  patterns.endspace,
  "i");

patterns.getLatestCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+(?:!latest)" +
  patterns.endspace,
  "i");

patterns.milestoneCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+(?:\([-_\.0-9a-z:]+))?(?:\\s+)?" +
  patterns.endspace,
  "i");

patterns.milestoneStatusCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+(?:\([-_\.0-9a-z:]+))?(?:\\s+)?" +
  "\\s+!(backlog|ready|working|done)$" +
  patterns.endspace,
  "i");

patterns.milestoneMineCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "\\s+(?:\([-_\.0-9a-z:]+))?(?:\\s+)?" +
  "\\s+(?:!mine)" +
  patterns.endspace,
  "i");

patterns.list_issue = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "(?:\\s+)?" +
  patterns.tags + patterns.endspace,
  "i");

patterns.milestoneNewIssueCmd = new RegExp(
  "(" + patterns.scriptPrefix +
  "(?:\\:[^\\s]+)?)\\s+" +
  patterns.fullRepo +
  "(?:\\s+)?(?:\([-_\.0-9a-z:]+))?(?:\\s+)?" +
  "\\s+(?:!new)" +
  "([^-]+)(?:-)(.*[^]+)\?",
  "i");

module.exports = patterns;
