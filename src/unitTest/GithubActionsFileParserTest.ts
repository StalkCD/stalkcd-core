import {GithubActionsFileParser} from "../main/model/GitHubActions/GithubActionsFileParser";
import {Pipeline} from "../main/model/pipeline/Pipeline";
import {EnvironmentVariable} from "../main/model/pipeline/EnvironmentSection";
import {ParsingImpossibleError} from "../main/errors/ParsingImpossibleError";
import {assert, assertArray, assertDefined, assertStringKeyValueArray, assertThrows} from "./Asserts";
import {IStage} from "../main/model/pipeline/Stage";


const githubActionsFileParser = new GithubActionsFileParser();

function parseData(filename: string): Pipeline {
    return githubActionsFileParser.parse("testRes/" + filename);
}

function testDefinitions() {
    let pipeline = parseData("definitions.yml");
    assertDefined(pipeline.definitions)
    if (pipeline.definitions) {
        assert(pipeline.definitions.length, 1);
        assertArray(pipeline.definitions, (v: any) => v === "My-Definition-Test")
    }
}

function testEnvironment() {
    let pipeline = parseData("environment.yml");
    assertDefined(pipeline.environment)
    if (pipeline.environment) {
        assert(pipeline.environment.length, 3);
        assertArray(pipeline.environment, (v: EnvironmentVariable) => v.name === "my-var" && v.value === "test")
        assertArray(pipeline.environment, (v: EnvironmentVariable) => v.name === "my-number" && v.value === "0")
        assertArray(pipeline.environment, (v: EnvironmentVariable) => v.name === "my-boolean" && v.value === "true")
    }
}

function testEnvironmentWithStages() {
    let pipeline = parseData("stages.environment.yml");
    assertDefined(pipeline.stages)
    let env = pipeline.stages[0].environment;
    if (pipeline.stages && env) {
        assertDefined(env)
        assert(env.length, 3);
        assertArray(env, (v: EnvironmentVariable) => v.name === "my-var" && v.value === "test")
        assertArray(env, (v: EnvironmentVariable) => v.name === "my-number" && v.value === "0")
        assertArray(env, (v: EnvironmentVariable) => v.name === "my-boolean" && v.value === "true")
    }
}


function testTriggers1() {
    let pipeline = parseData("triggers1.yml");
    assertDefined(pipeline.triggers)
    if (pipeline.triggers) {
        assert(pipeline.triggers.length, 1)
        assert(pipeline.triggers[0], "push")
    }
}

function testTriggers2() {
    let pipeline = parseData("triggers2.yml");
    assertDefined(pipeline.triggers)
    if (pipeline.triggers) {
        assert(pipeline.triggers.length, 2)
        assertArray(pipeline.triggers, (t: string) => t === "push")
        assertArray(pipeline.triggers, (t: string) => t === "release")
    }
}

function testTriggers3() {
    assertThrows(() => parseData("triggers3.yml"), (err:Error) => err as ParsingImpossibleError);
}

function testOptions() {
    let pipeline = parseData("options.yml");
    let options = pipeline.options;
    assertDefined(options);
    if (options) {
        assert(options.length, 4);
        assertStringKeyValueArray(options, "shell", "sh")
        assertStringKeyValueArray(options, "working-directory", "mydir")
        assertStringKeyValueArray(options, "permissions", "read-all")
        assertStringKeyValueArray(options, "concurrency", "my-concurrency-test")
    }
}

function testOptions2() {
    let pipeline = parseData("options2.yml");
    let options = pipeline.options;
    assertDefined(options);
    if (options) {
        assert(options.length, 3);
        assertStringKeyValueArray(options, "shell", "sh")
        assertStringKeyValueArray(options, "permissions", "{\"actions\":\"write\",\"checks\":\"write\",\"contents\":\"read\",\"id-token\":\"read\"}")
        assertStringKeyValueArray(options, "concurrency", "{\"group\":\"my-concurrency-group\",\"cancel-in-progress\":false}")
    }
}

function testStage() {
    let pipeline = parseData("stages.name.yml");
    if (pipeline.stages) {
        assert(pipeline.stages.length, 2);
        assertArray(pipeline.stages, (s: IStage) => s.name === "A_Job_With_a_name");
        assertArray(pipeline.stages, (s: IStage) => s.name === "A_Job_with_another_name");
    }
}

function testThrowsReusableWorkflowCallJob(){
    assertThrows(() => parseData("jobs.ReusableWorkflowCallJob.yml"), (err:Error) => err as ParsingImpossibleError)
}

function testThrowsStagesOutputs() {
    assertThrows(() => parseData("stages.output.yml"), (err:Error) => err as ParsingImpossibleError);
}

function testWhen() {
    let pipeline = parseData("stages.when.yml");
    assertDefined(pipeline.stages)
    if (pipeline.stages[0]) {
        assert(pipeline.stages.length, 2)
        // @ts-ignore
        assert(pipeline.stages[0].when, "my if condition")
    }
}

function testAgent() {
    let pipeline = parseData("stages.agent.yml");
    assertDefined(pipeline.stages)
    if (pipeline.stages[0]) {
        assert(pipeline.stages.length, 2)
        // @ts-ignore
        assert(pipeline.stages[0].agent[0].name, "ubuntu-latest")
    }
}

function testStageOptions() {
    let pipeline = parseData("stages.options.yml");
    let options = pipeline.stages[0].options;
    assertDefined(options);
    if (options) {
        assert(options.length, 2);
        assertStringKeyValueArray(options, "timeout-minutes", "42");
        assertStringKeyValueArray(options, "permissions", "{\"contents\":\"read\"}");
    }
}

function testStepsName() {
    let pipeline = parseData("stages.steps.yml");
    let steps = pipeline.stages[0].steps;
    assertDefined(steps)
    if (steps) {
        assert(steps.length, 4)
        assert(steps[0].label, "Check out repository code")
        assert(steps[1].label, "Build image locally")
        assert(steps[2].label, "Run tests in docker image")
        assert(steps[3].label, "Uses")
    }
}

function testStepsRun() {
    let pipeline = parseData("stages.steps.yml");
    let steps = pipeline.stages[0].steps;
    assertDefined(steps)
    if (steps) {
        assert(steps.length, 4)
        assert(steps[0].command, "actions/checkout@v3")
        assert(steps[1].command, "docker build --target stalkcd-application --tag stalkcd-application:latest --file docker/Application.dockerfile .")
        assert(steps[2].command, "bash docker run --rm -v \"/home/runner/work/stalkcd/stalkcd/res:/usr/app/res\" -v \"/home/runner/work/stalkcd/stalkcd/src:/usr/app/src\" stalkcd-application")
        assert(steps[3].command, "my-usage")
    }
}

function testSimpleMainRun() {
    console.log(parseData("main.yml"));
}


// General WF information
testDefinitions();
testEnvironment();
testTriggers1();
testTriggers2();
testTriggers3();
testOptions();
testOptions2()
testThrowsReusableWorkflowCallJob();

// Stages
testStage()
testThrowsStagesOutputs();
testWhen();
testAgent();
testEnvironmentWithStages();
testStageOptions()

// steps
testStepsName()
testStepsRun()

testSimpleMainRun();
console.log("successfully tested");


