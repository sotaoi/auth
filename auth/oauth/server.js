const OAuthServer = require("../../express-oauth-server");

module.exports = (provider) => {
  return new OAuthServer({
    model: provider,
    grants: ["authorization_code", "refresh_token"],
    accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
    allowEmptyState: true,
    allowExtendedTokenAttributes: true,
  });
};
