/*
    * checkJwt.js
    * Middleware to validate JWT tokens from Auth0 for protected routes.
    * Author:
*/
// https://auth0.com/docs/secure/tokens/json-web-tokens
// https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
// https://developer.auth0.com/resources/guides/api/express/basic-authorization
// https://auth0.com/docs/quickstart/backend/nodejs/interactive 
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// Middleware to check the JWT in the Authorization header of incoming requests
function checkJwt() {
    const domain = process.env.AUTH0_DOMAIN;
    const audience = process.env.AUTH0_AUDIENCE;

    // Ensure that the necessary environment variables are set
    if (!domain || !audience) {
        throw new Error("AUTH0_DOMAIN and AUTH0_AUDIENCE must be set in environment variables");
    }

    // Return the middleware function that will validate the JWT
    return jwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `https://${domain}/.well-known/jwks.json`,
        }),
        audience,
        issuer: `https://${domain}/`,
        algorithms: ["RS256"],
    });
}

module.exports = { checkJwt };