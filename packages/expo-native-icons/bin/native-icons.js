#!/usr/bin/env node
process.exitCode = require('../plugin/build/cli').main(process.argv.slice(2))
