/**
 * slimcord.js - A simple Discord Bot framework
 * Copyright (c) Tristan Ross
 *
 * Based on OS.js codebase
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
 * See LICENSE file for more information
 */
const merge = require('deepmerge');
const Discord = require('discord.js');
const EventEmitter = require('events');
const omitDeep = require('omit-deep');
const {moduleHandler, resolveTreeByKey} = require('./utils.js');
const winston = require('winston');
const yargsParser = require('yargs-parser');

const config = Symbol('config');
const createGraph = Symbol('createGraph');
const modules = Symbol('modules');

const runtimeMethods = {
  commands: {},
  registerCommand(name, opts={}) {
    if (this.commands[name]) {
      throw new Error(`Command ${name} already exists.`);
    }
    if (typeof opts != 'object') {
      throw new Error('opts is not an object.');
    }
    if (Array.isArray(opts.description) && typeof opts.description != 'string') {
      throw new Error('opts.description is not an array or string.');
    }
    if (Array.isArray(opts.usage) && typeof opts.usage != 'string') {
      throw new Error('opts.usage is not an array or string.');
    }
    if (typeof opts.run != 'function') {
      throw new Error('opts.run is not a function.');
    }
    this.commands[name] = opts;
  }
};

class Core extends EventEmitter {
  constructor(config, options={}) {
    super();
    const merger = merge.default ? merge.default : merge;
    const omitted = omitDeep(require('./config.defaults.json'), options.omit || []);
    this.configuration = merger(omitted, config);
    this[modules] = moduleHandler(this);
    this.client = new Discord.Client();
    this.booted = false;
    this.started = false;
    this.destroyed = false;
    if (this.config('enableLogging')) {
      this.logger = winston.createLogger({
        ...this.config('logger'),
        transports: this.config('logger.transports').map(t => new winston.transports[t.type](t.opts))
      });
    }
    // TODO: use winston to log events.
  }
  
  config(key, defaultValue) {
    return key ? resolveTreeByKey(this.configuration, key, defaultValue) : Object.assign({}, this.configuration);
  }
  
  instance(name, callback) {
    this[modules].bind(name, false, callback);
  }
  singleton(name, callback) {
    this[modules].bind(name, true, callback);
  }
  
  boot() {
    if (this.booted) {
      return Promise.resolve(true);
    }
    for (const methodName in runtimeMethods) {
      if (typeof runtimeMethods[methodName] === 'function') {
        this[methodName] = runtimeMethods[methodName].bind(this);
      } else {
        this[methodName] = runtimeMethods[methodName];
      }
    }
    this.started = false;
    this.destroyed = false;
    this.booted = true;
    this.client.on('message', message => {
      this.emit('message', message);
      if (message.content.substring(0, this.config('prefix').length) == this.config('prefix') && !message.author.bot) {
        let args = yargsParser(message.content);
        let name = args['_'].shift().replace(this.config('prefix'), '');
        if (this.commands[name]) {
          this.emit('command.run', name, args, message, message.guild);
          try {
            this.commands[name].run(args, message, message.channel, message.guild);
          } catch(ex) {
            this.emit('error', ex);
            if (this.has('slimcord.js/embed')) {
              message.channel.send(this.make('slimcord.js/embed', {
                type: 'error',
                message: `Command '${name}' ran into an error!\n${ex.stack}`
              }));
            }
          }
        } else {
          this.emit('command.notHas', name, args, message);
          if (this.config('enableLogging')) {
            this.logger.warn(`Command '${name}' not found`);
          }
          if (this.has('slimcord.js/embed')) {
            message.channel.send(this.make('slimcord.js/embed', {
              type: 'error',
              message: `Command '${name}' not found`
            }));
          }
        }
      }
    });
    this.emit('slimcord.js:init');
    return this.client.login(this.config('discord.token')).then(() => this[modules].init(true).then(() => this.start()));
  }
  
  destroy() {
    if (this.destroyed) {
      return false;
    }
    this.emit('slimcord.js:destroy');
    this.booted = false;
    this.destroyed = true;
    this.started = false;
    this[modules].destroy();
    this.client.destroy();
    return true;
  }
  
  start() {
    if (this.started) {
      return Promise.resolve(true);
    }
    this.started = true;
    this.emit('slimcord.js:start');
    return this[modules].init(false).then(() => true);
  }

  register(ref, options) {
    return this[modules].register(ref, options);
  }

  make(name, ...args) {
    return this[modules].make(name, ...args);
  }
  has(name) {
    return this[modules].has(name);
  }
  getModuleMetadata(name) {
    return this[modules].getModuleMetadata(name);
  }
  getModuleNames(name) {
    return this[modules].getModuleNames(name);
  }
}
module.exports = Core;

// vim:set ts=2 sw=2 et:
