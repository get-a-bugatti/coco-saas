class CommandBus {
  constructor() {
    this._handlers = new Map();
  }

  register(commandClass, handlerInstance) {
    this._handlers.set(commandClass, handlerInstance);
  }

  async dispatch(command) {
    const handler = this._handlers.get(command.constructor.name);
    if (!handler) {
      throw new Error(
        `No handler registered for command: ${command.constructor.name}`
      );
    }
    // Cross-cutting concerns like global logging or timing can go here
    return await handler.handle(command);
  }
}

module.exports = new CommandBus();
