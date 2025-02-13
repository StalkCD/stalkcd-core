import {clean} from "../../util";

export interface IStep {
    label?: string;
    command?: string;

    // experimental
    reusableCallParameters?: {[p: string]: string | number | boolean};
    environment?: {[p: string]: string | number | boolean};
    when?: string[];
    workingDirectory?: string
}

export class Step {
    constructor(
        init: IStep,
    ) {
        this.label = init.label;
        this.command = init.command;

        // experimental
        this.environment = init.environment
        this.reusableCallParameters = init.reusableCallParameters
        this.when = init.when
        this.workingDirectory = init.workingDirectory
    }

    label?: string;
    command?: string;

    // experimental
    reusableCallParameters?: {[p: string]: string | number | boolean}
    environment?: {[p: string]: string | number | boolean}
    when?: string[];
    workingDirectory?: string

    toSerial(): any {
        return clean(Object.assign({}, this));
    }

    public static fromSerial(init: IStep): Step {
        return new Step(init as IStep);
    }
}
