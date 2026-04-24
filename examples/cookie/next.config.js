const withPWA = require('next-pwa')({
  dest: 'public',
  dynamicStartUrl: true, // same as default
  dynamicStartUrlRedirect: '/login', // redirect target for the start URL
  // Required in next-pwa v7+: opt in to rewriting opaque/redirected start-URL
  // responses to 200 OK so they can be cached under the canonical start-URL key.
  // Only enable when the redirect stays within a trusted origin.
  trustStartUrlRedirects: true
})

module.exports = withPWA()
