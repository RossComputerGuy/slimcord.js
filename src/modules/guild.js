const Module = require('../module.js');

class Guild {
  constructor(core, guild) {
    this.core = core;
    this.guild = guild;
  }
}

class GuildModule extends Module {
  metadata() {
    return {
      name: 'Guild Utilties',
      desc: 'Provides helping functions to manage and find guilds.',
      author: 'Spaceboy Ross',
      ver: '0.1.0',
      url: 'https://github.com/SpaceboyRoss01/slimcord.js',
      provides: [
        'slimbot.js/guilds'
      ]
    };
  }
  async init() {
    this.core.singleton('slimbot.js/guilds', () => ({
      findBy: (key, value) => new Guild(this.core, this.core.client.guilds.find(key, value)),
      get: () => this.core.client.guilds.array().map(guild => new Guild(this.core, guild))
    }));
  }
  start() {
  }
  destroy() {
  }
}
module.exports = GuildModule;

// vim:set ts=2 sw=2 et:
