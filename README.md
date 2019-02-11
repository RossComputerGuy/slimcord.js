# slimcord.js

A simple Discord Bot framework. Used for HaroBot and Lordgenome Discord Bots.

## Example
This will **only** start the bot with no modules.
```js
const {Core} = require('slimcord.js');

let bot = new Core({});

bot.boot().catch(err => {
  console.error(err);
  process.exit(1);
});
```

## Example Module
```js
class MyModule {
  constructor(core, options) {
    this.core = core;
    this.options = options;
  }
  metadata() {
    return {
      name: 'My Module',
      desc: 'Hello, world.',
      author: 'Spaceboy Ross',
      ver: '0.1.0',
      url: 'https://example.com',
      provides: [
        'mymodule/mything'
      ]
    };
  }
  async init() {
    this.core.instance('mymodule/mything', (opts) => Object.assign({val: 'Hello, world'}, opts));
  }
  start() {
    this.core.registerCommand('hello', {
      description: 'Hello, world',
      usage: 'hello',
      run: (args, message, channel) => channel.send('Hello, world!')
    });
  }
  destroy() {
    delete this.core.command['hello'];
  }
}
```
