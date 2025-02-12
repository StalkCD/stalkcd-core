enum FailedComparisonReason {
    UNEQUAL_AMOUNT_OF_KEYS = "UNEQUAL_AMOUNT_OF_KEYS",
    NOT_SAME_ELEMENT_TYPE = "NOT_SAME_ELEMENT_TYPE",
    UNEQUAL_STRING = "UNEQUAL_STRING",
    UNEQUAL_BOOLEAN = "UNEQUAL_BOOLEAN",
    UNEQUAL_NUMBER = "UNEQUAL_NUMBER",
    UNEQUAL_UNKNOWN_TYPE = "UNEQUAL_UNKNOWN_TYPE",
}

export class Comparator {

    /**
     * This will compare two objects deeply and provide a map of the occurred differences.
     * @param expected - expected object, this is the truth so to say.
     * @param actual - the actual object, it is the object which has to hold true to the expected.
     * @param specialCasesCallback - use this with extreme caution, it is possible to break the comparing functionality with this.
     *                              This is for syntactic equality and can circumvent the true-equality which is checked by this class.
     *                              Errors can be thrown and will not affect the program-flow, meaning normal operation is continued and the special case is omitted.
     *                              There are two types of comparisons which are possible:
     *                              1. Create simple comparisons for values
     *                                  e.g. one key is a string and the other an array, but there is a way they can be considered the same.
     *                              2. Create Complex comparisons for Entries in the Object.
     *                                  e.g. there are two names of a key which are valid.
     *                                       This case would never be compared so this has to be caught at one layer above.
     */
    public static compareObjects(expected: object, actual: object, specialCasesCallback: (context: any[], expectedElement: any, actualElement: any) => boolean = () => false): Map<string, string[]> {
        // initialize error Map
        let map = new Map<string, string[]>();
        for (let reason in FailedComparisonReason) {
            map.set(reason, []);
        }

        // do comparison
        this.internalCompareObjects(expected, actual, [], map, specialCasesCallback);

        // filter empty entries
        let resultMap = new Map<string, string[]>()
        map.forEach((value, key) => {
            if (value.length > 0) {
                resultMap.set(key, value);
            }
        })
        return resultMap;
    }

    private static internalCompareObjects(expected: any, actual: any, context: any[], errors: Map<string, string[]>, specialCaseEquality: (context: any[], expectedElement: any, actualElement: any) => boolean): Map<string, string[]> {
        if (expected === null) {
            if (actual !== null) {
                this.error(errors, FailedComparisonReason.NOT_SAME_ELEMENT_TYPE, context + " type: null --> actual: " + typeof actual)
            }
            return errors;
        }
        let expectedKeys: string[] = Object.keys(expected);
        if (expectedKeys.length !== Object.keys(actual).length) {
            this.error(errors, FailedComparisonReason.UNEQUAL_AMOUNT_OF_KEYS, this.contextString(context));
        }
        for (let key of expectedKeys) {
            // setup
            let expectedElement: any = expected[key];
            let actualElement: any = actual[key];
            let current_context: any[] = [...context, key];

            // special cases of value comparison
            if (this.isSpecialCaseValid(() => specialCaseEquality([...current_context], expectedElement, actualElement))) {
                continue;
            }

            // normal processing
            if (typeof expectedElement !== typeof actualElement) {
                this.error(errors, FailedComparisonReason.NOT_SAME_ELEMENT_TYPE, this.contextString(current_context) + " type: " + typeof expectedElement + " --> actual: " + typeof actualElement);
                continue
            }
            // console.log("Expected: " + current_context + " = " + expectedElement);
            // console.log("Actual: " + current_context + " = " + actualElement);
            // console.log();
            let contextErrorString: string = this.contextString(current_context) + " = " + expectedElement + " --> actual = " + actualElement

            switch (typeof expectedElement) {
                case "string":
                    expectedElement === actualElement ? "" : this.error(errors, FailedComparisonReason.UNEQUAL_STRING, contextErrorString);
                    break;
                case "boolean":
                    expectedElement === actualElement ? "" : this.error(errors, FailedComparisonReason.UNEQUAL_BOOLEAN, contextErrorString);
                    break;
                case "number":
                    expectedElement === actualElement ? "" : this.error(errors, FailedComparisonReason.UNEQUAL_NUMBER, contextErrorString);
                    break;
                case "object":
                    this.internalCompareObjects(expectedElement, actualElement, current_context, errors, specialCaseEquality);
                    break;
                case "function":
                    // functions are intentionally ignored
                    break;
                default:
                    expectedElement === actualElement ? "" : this.error(errors, FailedComparisonReason.UNEQUAL_UNKNOWN_TYPE, contextErrorString);
            }
        }
        return errors
    }

    private static contextString(context: any[]): string {
        return "obj[" + context.join("][") + "]"
    }

    /**
     * only give reasons which are given in the Enum FailedComparisonReason
     * @param errors the list of errors given my the enum and their respective reasons why they failed.
     * @param reason an enum FailedComparisonReason
     * @param context current context of the error
     * @private
     */
    private static error(errors: Map<string, string[]>, reason: string, context: string): void {
        // @ts-ignore --> only an enum type shall be given, these are initialized in the constructor
        errors.get(reason).push(context);
    }

    private static isSpecialCaseValid(myFunction: () => boolean) {
        try {
            let b = myFunction();
            // noinspection SuspiciousTypeOfGuard
            if (b === undefined || typeof b !== 'boolean') { // someone could pass a function which returns no value, in this case false is assumed.
                return false
            }
            return b;
        } catch (err) {
            return false
        }
    }
}