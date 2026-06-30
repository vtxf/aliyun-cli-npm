#!/usr/bin/env node

const { executeAliyunCli } = require('./executor');

const args = process.argv.slice(2);

(async () => {
  try {
    await executeAliyunCli(args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
