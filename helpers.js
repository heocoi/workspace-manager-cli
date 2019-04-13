const fs = require("fs");
const homedir = require('os').homedir();
const workspaceFileName = ".wkm.json";

const getWorkspaceFilePath = dir => dir ? `${dir}/${workspaceFileName}` : `${homedir}/${workspaceFileName}`;

module.exports.loadWorkspace = dir => {
    const workspaceFile = getWorkspaceFilePath(dir);
    let initWorkspace = {
        projects: [],
        config: {},
    };
    if (!fs.existsSync(workspaceFile)) {
        fs.writeFileSync(workspaceFile, JSON.stringify(initWorkspace, null, 2));
    }
    return JSON.parse(fs.readFileSync(workspaceFile));
};

module.exports.updateWorkspace = (dir, workspace) => {
    const workspaceFile = getWorkspaceFilePath(dir);
    fs.writeFileSync(workspaceFile, JSON.stringify(workspace, null, 2));
};