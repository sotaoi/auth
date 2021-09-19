"use strict";

/**
 * Module dependencies.
 */

var _ = require("lodash");
var OAuthError = require("./oauth-error");
var util = require("util");

function InsufficientScopeError(message, properties) {
  properties = _.assign(
    {
      code: 403,
      name: "insufficient_scope",
    },
    properties
  );

  OAuthError.call(this, message, properties);
}

/**
 * Inherit prototype.
 */

util.inherits(InsufficientScopeError, OAuthError);

/**
 * Export constructor.
 */

module.exports = InsufficientScopeError;
