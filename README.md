# slimcord.js

A simple Discord Bot framework. Used for HaroBot and Lordgenome Discord Bots.

## Example
This will **only** start the bot with no modules.
```
const {Core} = require('slimcord.js');

let bot = new Core({});

bot.boot().catch(err => {
  console.error(err);
  process.exit(1);
});
```
