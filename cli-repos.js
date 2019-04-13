#!/usr/bin/env node
"use strict";
const program = require("commander");
const _ = require("lodash");
const Table = require("cli-table");
const shell = require("shelljs");
const { loadWorkspace, updateWorkspace } = require("./helpers");

const getProject = workspace => {
    const project = _.find(workspace.projects, [
        "name",
        workspace.config.project,
    ]);

    return project;
};

program
    .command("list")
    .alias("ls")
    .description("List your repositories in active project")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action(options => {
        const workspace = loadWorkspace(options.configFile);
        const project = getProject(workspace);
        if (_.isEmpty(project)) {
            console.log(
                "You must set active project first. \nwkm config set project [project_name]."
            );
            return;
        }
        const { repos } = project;
        if (repos.length === 0) {
            console.log(`No repositories in project [${project.name}]`);
            return;
        }
        let table = new Table({
            head: ["REPOSITORY", "PATH"],
        });
        _.map(repos, repo => {
            table.push([repo.name, repo.path]);
        });
        console.log(table.toString());
    });

program
    .command("create [repo_name]")
    .description("Create a new repository in active project")
    .option("-p, --path [path]", "Path to new repository")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((repoName, options) => {
        const workspace = loadWorkspace(options.configFile);
        const project = getProject(workspace);
        if (_.isEmpty(project)) {
            console.log(
                "You must set active project first. \nwkm config set project [project_name]."
            );
            return;
        }

        const projectIdx = _.indexOf(workspace.projects, project);
        const { repos } = project;
        repos.push({
            name: repoName,
            path: options.path || process.cwd(),
        });
        _.set(workspace, ["projects", projectIdx, "repos"], repos);
        updateWorkspace(options.configFile, workspace);
    });

program
    .command("get-path [repo_name]")
    .description("Print repository path into console")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((repoName, options) => {
        const workspace = loadWorkspace(options.configFile);
        const project = getProject(workspace);
        if (_.isEmpty(project)) {
            console.log(
                "You must set active project first. \nwkm config set project [project_name]."
            );
            return;
        }

        const { repos } = project;
        if (repos.length === 0) {
            console.log(`No repositories in project [${project.name}]`);
            return;
        }

        const repo = _.find(repos, ["name", repoName]);
        if (_.isEmpty(repo)) {
            console.log(`You don't have repository [${repoName}] in project [${project.name}].`);
            return;
        }
        console.log(_.get(repo, "path"));
    });

program
    .command("copy-path [repo_name]")
    .description("Copy repository path into clipboard")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((repoName, options) => {
        const workspace = loadWorkspace(options.configFile);
        const project = getProject(workspace);
        if (_.isEmpty(project)) {
            console.log(
                "You must set active project first. \nwkm config set project [project_name]."
            );
            return;
        }

        const { repos } = project;
        if (repos.length === 0) {
            console.log(`No repositories in project [${project.name}]`);
            return;
        }

        const repo = _.find(repos, ["name", repoName]);
        if (_.isEmpty(repo)) {
            console.log(`You don't have repository [${repoName}] in project [${project.name}].`);
            return;
        }
        shell.exec(`echo ${_.get(repo, "path")} | pbcopy`);
    });

program
    .command("open [repo_name]")
    .description("Open repository path in defined editor")
    .option(
        "-c, --config-file [dir]",
        "Use/Store config file (workspace.json) in custom directory."
    )
    .action((repoName, options) => {
        const workspace = loadWorkspace(options.configFile);
        const project = getProject(workspace);
        if (_.isEmpty(project)) {
            console.log(
                "You must set active project first. \nwkm config set project [project_name]."
            );
            return;
        }

        const { repos } = project;
        if (repos.length === 0) {
            console.log(`No repositories in project [${project.name}]`);
            return;
        }

        const repo = _.find(repos, ["name", repoName]);
        if (_.isEmpty(repo)) {
            console.log(`You don't have repository [${repoName}] in project [${project.name}].`);
            return;
        }
        shell.exec(`${workspace.config.editor} ${_.get(repo, "path")}`);
    });

program.parse(process.argv);
