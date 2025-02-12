import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as yaml from 'yaml';

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);

    const fileList = fs.readdirSync('.');
    console.log(fileList);

    // read workspace.yml
    const workspaceYml = fs.readFileSync('workspace.yml', 'utf8');
    console.log(workspaceYml);

    // parse workspace.yml
    const workspace = yaml.parse(workspaceYml);
    console.log(workspace);
} catch (error: any) {
    core.setFailed(error.message);
}