/** Parent messaging is same-origin by default. Cross-origin hosts must be
 * explicitly configured by the application, never inferred from a referrer. */
export function trustedParentOrigin(configured: string | undefined, localOrigin: string): string | null {
  try {
    const url = new URL(configured === undefined || configured === '' ? localOrigin : configured.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || url.origin === 'null') return null;
    return url.origin;
  } catch { return null; }
}

function parentEndpoint(host: Window, configured?: string) {
  const origin = trustedParentOrigin(configured, host.location.origin);
  return origin && host.parent !== host ? { origin, target: host.parent } : null;
}

export function notifyParentReady(host: Window, configured?: string): boolean {
  const endpoint = parentEndpoint(host, configured);
  if (!endpoint) return false;
  try {
    endpoint.target.postMessage({ type: 'PREVIEW_READY' }, endpoint.origin);
    return true;
  } catch { return false; }
}

export interface ParentRpcOptions {
  parentOrigin?: string;
  timeoutMs?: number;
}

interface PendingResponse {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** The transport owns correlation, validation, deadlines and listener cleanup.
 * A valid request ID alone never authenticates a response. */
export class ParentRpcClient {
  private readonly endpoint: ReturnType<typeof parentEndpoint>;
  private readonly pending = new Map<string, PendingResponse>();
  private readonly timeoutMs: number;
  private closed = false;

  constructor(private readonly host: Window, options: ParentRpcOptions = {},
    private readonly onPending: (count: number) => void = () => {}) {
    this.endpoint = parentEndpoint(host, options.parentOrigin);
    this.timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs! > 0
      ? Math.min(options.timeoutMs!, 60000) : 30000;
    if (this.endpoint) host.addEventListener('message', this.receive);
  }

  private readonly receive = (event: MessageEvent) => {
    if (this.closed || !this.endpoint || event.source !== this.endpoint.target ||
      event.origin !== this.endpoint.origin) return;
    const response = event.data;
    if (!response || typeof response !== 'object' || Array.isArray(response) ||
      typeof response.messageId !== 'string' || typeof response.success !== 'boolean' ||
      (!response.success && response.error !== undefined && typeof response.error !== 'string')) return;
    const request = this.pending.get(response.messageId);
    if (!request) return;
    this.remove(response.messageId);
    if (response.success) request.resolve(response.payload);
    else request.reject(new Error(response.error ?? 'Unknown RPC error'));
  };

  private remove(id: string) {
    const request = this.pending.get(id);
    if (!request) return;
    clearTimeout(request.timer);
    this.pending.delete(id);
    this.onPending(this.pending.size);
  }

  call(name: string, payload: unknown): Promise<unknown> {
    if (this.closed || !this.endpoint) return Promise.reject(new Error('Trusted parent messaging unavailable'));
    if (!name || name.length > 256) return Promise.reject(new Error('Invalid RPC name'));
    let id: string;
    try {
      const bytes = this.host.crypto.getRandomValues(new Uint8Array(16));
      id = 'rpc-' + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch { return Promise.reject(new Error('Secure RPC identifiers unavailable')); }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.remove(id);
        reject(new Error('Playground RPC timed out'));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.onPending(this.pending.size);
      try {
        this.endpoint!.target.postMessage({ type: name, payload, messageId: id }, this.endpoint!.origin);
      } catch (error) {
        this.remove(id);
        reject(error instanceof Error ? error : new Error('RPC message could not be sent'));
      }
    });
  }

  dispose() {
    if (this.closed) return;
    this.closed = true;
    this.host.removeEventListener('message', this.receive);
    for (const [id, request] of this.pending) {
      this.remove(id);
      request.reject(new Error('Playground RPC closed'));
    }
  }
}
