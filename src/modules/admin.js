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
      provides: [
        'slimcord.js/admin'
      ]
    };
  }
  init() {
    this.core.singleton('slimcord.js/admin', () => ({
      isUserBotOwner: (user) => this.core.config('botOwners').indexOf(user.id) > -1,
      isUserPriviledged: (member, perms=[]) => member.hasPermissions(perms) || this.core.config('botOwners').indexOf(user.id) > -1
    }));
    return Promise.resolve();
  }
  start() {
    this.core.registerCommand('mute', {
      description: 'Mutes a user',
      usage: 'mute <mention>',
      run: (args, message, channel, guild) => {
        if (args['_'].length > 1) return message.reply('Error: Too many arguments');
        if (typeof args['toggle'] != 'string') args['toggle'] = 'true';
        if (typeof args['value'] != 'string') args['value'] = 'true';
        if (typeof args['reason'] != 'string') args['reason'] = 'Unknown reason';
        let readStorage = (path) => Promise.resolve(this.core.config('storage.' + path));
        if (this.core.config('storageProvider') && this.core.has(this.core.config('storageProvider'))) {
          readStorage = this.core.make(this.core.config('storageProvider')).readStorage;
        }
        if (message.member.hasPermissions('MUTE_MEMBERS')) {
          const member = guild.members.find('name', args['_'][0]) || message.mentions.members.array()[0];
          if (!member) return message.reply('Error: user not found!').catch(err => {
            if (this.core.config('enableLogging')) this.core.logger.error(err);
          });
          member.setMute(args['toggle'] == 'true' ? !message.member.mute : args['value'] == 'true', args['reason']).then(() => {
            message.reply('Muted user').catch(err => {
              if (this.core.config('enableLogging')) this.core.logger.error(err);
            });
          }).catch(err => message.reply(err.stack).catch(err => {
            if (this.core.config('enableLogging')) this.core.logger.error(err);
          }));
        } else message.reply('You do not have permission to use this command!').catch(err => {
          if (this.core.config('enableLogging')) this.core.logger.error(err);
        });
      }
    });
  }
  destroy() {
    delete this.core.commands['mute'];
  }
}
module.exports = AdminModule;

// vim:set ts=2 sw=2 et:
