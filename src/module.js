class Module {
  constructor(core, options={}) {
    this.core = core;
    this.options = options;
  }
  metadata() {
    throw new Error('Metadata not defined.');
  }
  init() {
    return Promise.resolve();
  }
  start() {
  }
  destroy() {
  }
}
module.exports = Module;

// vim:set ts=2 sw=2 et:
