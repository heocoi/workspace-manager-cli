#!/usr/bin/env node
"use strict";
const program = require("commander");

program
  .version('0.2.0')
  .description('Manage your workspace (projects, repositories ...) from CLI.')
  .command('config [action]', 'Manage workspace properties')
  .command('projects [action]', 'Create and manage project')
  .command('repos [action]', 'Create and manage repository')
  .parse(process.argv);

process.exit(0);
