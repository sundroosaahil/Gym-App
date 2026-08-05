const { UAParser } = require('ua-parser-js');

function getDeviceInfo(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  const browser = result.browser.name || 'Unknown browser';
  const os = result.os.name || 'Unknown OS';
  const device = result.device.model || result.device.vendor || '';

  if (device) {
    return `${device} (${browser}, ${os})`;
  }
  return `${browser} on ${os}`;
}

module.exports = { getDeviceInfo };