export type SocketMap = Record<string, SocketIOClient.Socket>;

export type SocketKey = 'session' | 'judger' | 'competition';

export function getSocket(key: SocketKey): SocketIOClient.Socket | undefined {
  // @ts-ignore
  if (!window._sockets) {
    // @ts-ignore
    window._sockets = {};
  }
  // @ts-ignore
  return window._sockets[key];
}

export function setSocket(key: SocketKey, socket: SocketIOClient.Socket) {
  // @ts-ignore
  if (!window._sockets) {
    // @ts-ignore
    window._sockets = {};
  }
  // @ts-ignore
  window._sockets[key] = socket;
}

export function clearSocket(key: SocketKey) {
  const existed = getSocket(key);
  // @ts-ignore
  window._sockets[key] = undefined;
  if (existed) {
    return existed.disconnect();
  }
}
