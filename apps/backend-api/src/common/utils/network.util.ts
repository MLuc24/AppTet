import * as os from 'os';

/**
 * Get the local network IP address (for mobile app connection)
 */
export function getLocalNetworkIP(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const alias of iface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }

  return 'localhost';
}
