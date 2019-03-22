const request = require('request');
const utils = require('./utils');
const config = require('./config');
const log = require('./log');
module.exports = function postDeploy() {
  const expUrl = `https://expo.io/@${config.expUsername}/${utils.readAppJSON().expo.slug}?release-channel=${utils.getExpChannelName()}`;
  const expUrlForQRCode = `https://exp.host/@${config.expUsername}/${utils.readAppJSON().expo.slug}?release-channel=${utils.getExpChannelName()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${expUrlForQRCode}`;

  log('Exponent URL', expUrl);
  log('QR Code URL ', qrUrl);

  const body = `
  This branch has been deployed to:
  ${expUrl}

  Install the [Expo](https://expo.io/) app and scan this QR code with your camera:

  ![QR Code](${qrUrl})
  `;

  if (config.githubPullRequestId) {
    const issueUrl = `https://${config.githubUsername}:${config.githubToken}@api.github.com/repos/${config.githubOrg}/${config.githubRepo}/issues/${config.githubPullRequestId}/comments`;
    log('GitHub Issue URL', issueUrl);
    request.post(
      {
        url: issueUrl,
        headers: { 'User-Agent': 'ci' },
        body: JSON.stringify({ body })
      },
      (error, response) => {
        if (error) {
          console.error('Failed to post comment to GitHub, an error occurred', error);
        } else if (response.statusCode >= 400) {
          console.error('Failed to post comment to GitHub, request failed with', response);
        } else {
          console.log(`Posted message to GitHub PR #${config.githubPullRequestId}`);
        }
      }
    );
  }
};
