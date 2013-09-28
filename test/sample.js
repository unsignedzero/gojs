"use strict";

var run = require("../test").run
var Logger = require("./utils/logger").Logger

exports["test sample"] = function(assert) {
  var functionType, methods;
  functionType = "function"
  methods = ["draw", "curMode", "stoneCount", "curMode", "isValidMove"];
  run({
    "test fixture": function (assert) {
      methods.forEach(function (name) {
        assert.equal(typeof assert[name], functionType,
                     "`" + name + "` must be method of `assert`")
      })
    }
  }, new Logger(function(passes) {
    assert.equal(passes.length, methods.length, "all methdos were found")
  }))
}

if (require.main === module)
  require("../test").run(exports)
