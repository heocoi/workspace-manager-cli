#!/usr/bin/env node
"use strict";
const program = require("commander");
const _ = require("lodash");
const Table = require("cli-table");
const { loadWorkspace, updateWorkspace } = require("./helpers");

program
    .command("list")
    .alias("ls")
    .description("List your projects")
    .option('-c, --config-file [dir]', 'Use/Store config file (workspace.json) in custom directory.')
    .action((options) => {
        const workspace = loadWorkspace(options.configFile);
        const projectNames = _.map(workspace.projects, "name");
        let table = new Table({
            head: ["PROJECT", "DEFAULT"],
        });
        _.map(projectNames, name => {
            const defaultProjectName = workspace.config.project;
            table.push([name, _.isEqual(name, defaultProjectName) ? "   *   " : "" ]);
        });
        console.log(table.toString());
    });

program
    .command("create [project_name]")
    .description("Create a new project")
    .option('-c, --config-file [dir]', 'Use/Store config file (workspace.json) in custom directory.')
    .action((projectName, options) => {
        const workspace = loadWorkspace(options.configFile);
        if (_.includes(_.map(workspace.projects, "name"), projectName)) {
            // skip if project name exists in config file
            console.log(`Project [${projectName}] already exists.`);
        } else {
            workspace.projects.push({ name: projectName, repos: [] });
            // set new project as active one
            workspace.config.project = projectName;
            updateWorkspace(options.configFile, workspace);
            console.log(`Project [${projectName}] has created successfully.`);
        }
    });

program.parse(process.argv)