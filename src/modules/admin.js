const Discord = require('discord.js');

class AdminModule {
  constructor(core, options) {
    this.core = core;
    this.options = options;
  }
  metadata() {
    return {
      name: 'Adminstration',
      desc: 'Provides administration and moderating.',
      author: 'Spaceboy Ross',
      ver: '0.1.0',
      url: 'https://github.com/SpaceboyRoss01/slimcord.js',
      provides: []
    };
  }
  async init() {
  }
  start() {
    this.core.registerCommand('mute', {
      description: 'Mutes a user',
      usage: 'mute <mention>',
      run: (args, message, channel, guild) => {
        message.reply('Command not implemented.');
      }
    });
  }
  destroy() {
    delete this.core.commands['mute'];
  }
}
module.exports = AdminModule;

// vim:set ts=2 sw=2 et:
