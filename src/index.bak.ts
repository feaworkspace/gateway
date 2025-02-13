import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import WorkspaceConfigRenderer from './config/WorkspaceConfigRenderer.js';
import { fromError } from 'zod-validation-error';

try {
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    const configRenderer = new WorkspaceConfigRenderer('workspace.yml');
    const workspaceConfig = configRenderer.render();
    console.log(workspaceConfig.toYaml());
} catch (error: any) {
    const message = fromError(error).toString();
    // the error is now readable by the user
    // you may print it to console
    console.error(error);
    console.error(message);
    core.setFailed(error);
}