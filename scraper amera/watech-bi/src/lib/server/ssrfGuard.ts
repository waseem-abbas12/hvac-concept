const BLOCKED_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'];

/**
 * Validates a target URL against SSRF attacks (blocks loopback, AWS/GCP metadata, and private IP blocks).
 */
export function isSafeTargetUrl(rawUrl: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Invalid protocol. Only HTTP and HTTPS are permitted.' };
    }

    const host = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTNAMES.includes(host)) {
      return { safe: false, reason: 'Access to loopback or cloud metadata services is blocked.' };
    }

    // Check private RFC1918 IPv4 ranges
    if (
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return { safe: false, reason: 'Access to private internal network IP ranges is blocked.' };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Malformed URL provided.' };
  }
}