#!/usr/bin/env node
"use strict";
const meow = require("meow");
const fs = require("fs");
const _ = require("lodash");
const shell = require("shelljs");
const Table = require("cli-table");
const homedir = require('os').homedir();

// ======================================== //
//                                          //
// ======================================== //
const cli = meow(
    `
  Usage
    $ wkm projects list
    $ wkm projects create [project-name]

    $ wkm config list
    $ wkm config set [config-key] [config-value]
    $ wkm config list
    $ wkm config get-value [config-key]

    $ wkm repos list
    $ wkm repos create [repo-name] --path=[repo-path]
    $ wkm repos get-path [repo-name]
    $ wkm repos copy-path [repo-name]
    $ wkm repos open [repo-name]

  Options
    --verbose, -v         print debug info to console
    --config-path, -c     path to config file
`,
    {
        flags: {
            verbose: {
                type: "boolean",
                alias: "v",
                default: false,
            },
            configPath: {
                type: "string",
                alias: "c",
                default: `${homedir}`,
            },
        },
    }
);

const loadWorkspace = workspaceFile => {
    let initWorkspace = {
        projects: [],
        config: {},
    };
    if (!fs.existsSync(workspaceFile)) {
        fs.writeFileSync(workspaceFile, JSON.stringify(initWorkspace, null, 2));
    }
    return JSON.parse(fs.readFileSync(workspaceFile));
};

const updateWorkspace = (workspaceFile, workspace) => {
    fs.writeFileSync(workspaceFile, JSON.stringify(workspace, null, 2));
};

// ======================================== //
// MAIN                                     //
// ======================================== //

// cli.flags.verbose &&
//     console.log(`CLI input: ${JSON.stringify(cli.input, null, 2)}`);
// cli.flags.verbose && console.log(`CLI options: ${cli.flags}`);

const { configPath } = cli.flags;
const [entity, action, ...params] = cli.input;

const workspaceFile = `${configPath}/wkm.json`;
const workspace = loadWorkspace(workspaceFile);
cli.flags.verbose && console.log(JSON.stringify(workspace, null, 2));

switch (entity) {
    case "projects":
        switch (action) {
            case "list":
                console.log(_.join(_.map(workspace.projects, "name"), "\n"));
                break;
            case "create":
                const [projectName] = params;
                // TODO: validate
                // skip if project name exists in config file
                workspace.projects.push({ name: projectName, repos: [] });
                updateWorkspace(workspaceFile, workspace);
                break;
            default:
                // TODO: invalid projects action
                break;
        }
        break;

    case "config":
        switch (action) {
            case "list":
                console.log(JSON.stringify(workspace.config, null, 2));
                break;
            case "set":
                // TODO: validate
                workspace.config[params[0]] = params[1];
                updateWorkspace(workspaceFile, workspace);
                break;
            case "unset":
                // TODO: validate
                delete workspace.config[params[0]];
                updateWorkspace(workspaceFile, workspace);
                break;
            case "get-value":
                console.log(workspace.config[params[0]]);
                break;
            default:
                // TODO: invalid config action
                break;
        }
        break;

    case "repos":
        if (
            _.isEmpty(workspace.config.project) ||
            _.isUndefined(workspace.config.project)
        ) {
            console.log("Project not set yet.");
        } else {
            const project = _.find(workspace.projects, [
                "name",
                workspace.config.project,
            ]);
            const projectIdx = _.indexOf(workspace.projects, project);
            let repos = project.repos;
            switch (action) {
                case "list":
                    let table = new Table({
                        head: ["NAME", "PATH"],
                    });
                    _.map(repos, repo => {
                        table.push([repo.name, repo.path]);
                    });
                    console.log(table.toString());
                    break;
                case "create":
                    let { path } = cli.flags;
                    // TODO: validate
                    repos.push({
                        name: params[0],
                        path: path || process.cwd(),
                    });
                    _.set(workspace, ["projects", projectIdx, "repos"], repos);
                    updateWorkspace(workspaceFile, workspace);
                    break;
                case "get-path":
                    // print repo path into console
                    console.log(_.get(_.find(repos, ["name", params[0]]), "path"));
                    break;
                case "copy-path":
                    // copy repo path into clipboard
                    shell.exec(`echo ${_.get(_.find(repos, ["name", params[0]]), "path")} | pbcopy`);
                    break;
                case "open":
                    // open repo folder using editor which set in workspace.json
                    shell.exec(`${workspace.config.editor} ${_.get(_.find(repos, ["name", params[0]]), "path")}`);
                default:
                    break;
            }
        }
        break;

    default:
        // TODO: invalid entity
        break;
}

process.exit(0);
