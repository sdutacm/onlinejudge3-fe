export class GeneralSocketHandler {
  events: [string, Function][] = [];

  registerEvent(event: string, handler: Function, replace = false) {
    if (replace) {
      this.events = this.events.filter(([e]) => e !== event);
    }
    this.events.push([event, handler]);
  }

  unregisterEvent(event: string) {
    this.events = this.events.filter(([e]) => e !== event);
  }

  bindEvents(socket: SocketIOClient.Socket) {
    this.events.forEach(([event, handler]) => {
      socket.on(event, handler);
    });
  }
}

export const globalGeneralSocketHandler = new GeneralSocketHandler();
