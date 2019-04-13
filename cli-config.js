#!/usr/bin/env node
"use strict";
const program = require("commander");
const _ = require("lodash");
const Table = require("cli-table");
const { loadWorkspace, updateWorkspace } = require("./helpers");

program
    .command("list")
    .alias("ls")
    .description("List properties of your workspace")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action(options => {
        const workspace = loadWorkspace(options.configFile);
        let table = new Table({
            head: ["PROPERTY", "VALUE"],
        });
        _.forOwn(workspace.config, (value, key) => {
            table.push([key, value]);
        });
        console.log(table.toString());
    });

program
    .command("set [property] [value]")
    .description("Set a workspace property")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((property, value, options) => {
        const workspace = loadWorkspace(options.configFile);
        workspace.config[property] = value;
        updateWorkspace(options.configFile, workspace);
        let table = new Table({
            head: ["PROPERTY", "VALUE"],
        });
        table.push([property, value]);
        console.log(table.toString());
    });

program
    .command("unset [property]")
    .description("Unset a workspace property")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((property, options) => {
        const workspace = loadWorkspace(options.configFile);
        delete workspace.config[property];
        updateWorkspace(options.configFile, workspace);
        console.log(`Property [${property}] has unset successfully.`);
    });

program
    .command("get-value [property]")
    .description("Get a workspace property")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((property, options) => {
        const workspace = loadWorkspace(options.configFile);
        const value = workspace.config[property];
        let table = new Table({
            head: ["PROPERTY", "VALUE"],
        });
        table.push([property, value]);
        console.log(table.toString());
    });

program.parse(process.argv);
