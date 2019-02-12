module.exports = {
  Core: require('./src/core.js'),
  Module: require('./src/module.js'),
  modules: {
    AdminModule: require('./src/modules/admin.js'),
    GuildModule: require('./src/modules/guild.js')
  }
};

// vim:set ts=2 sw=2 et:
