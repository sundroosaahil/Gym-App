const { UAParser } = require('ua-parser-js');

/**
 * Builds a human-readable device description for logging.
 *
 * @param {string} userAgentString - value of req.headers['user-agent']
 * @param {string|null} clientModel - device model sent from the frontend via
 *   navigator.userAgentData.getHighEntropyValues(['model']) (Chromium only).
 *   Pass null/undefined if not available.
 */
function getDeviceInfo(userAgentString, clientModel) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  const browser = result.browser.name || 'Unknown browser';
  const os = result.os.name || 'Unknown OS';

  // Prefer the real model from Client Hints (e.g. "vivo X200 Pro").
  // Fall back to whatever ua-parser-js could guess from the UA string.
  const device = (clientModel && clientModel.trim()) || result.device.model || result.device.vendor || '';

  if (device) {
    return `${device} (${browser}, ${os})`;
  }
  return `${browser} on ${os}`;
}

module.exports = { getDeviceInfo };