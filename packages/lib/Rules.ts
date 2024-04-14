import type { Rules } from "./types/Rules";
export const GenerateRules = {
    length: (min: number, max: number) => {
        return {
            ruleName: "length",
            jsType: "string",
            params: {
                minLength: min,
                maxLength: max,
            }
        }
    },
    regex: (regex: string, regexName: string, hint: string) => {
        return {
            ruleName: "regex",
            jsType: "string",
            params: {
                regex: regex,
                regexName: regexName,
                hint: hint,
            }
        }
    },
    range: (min: number, max: number) => {
        return {
            ruleName: "range",
            jsType: "number",
            params: {
                min: min,
                max: max,
            }
        }
    }
} satisfies { [K in Rules["ruleName"]]: (...args: never[]) => Rules };

export const RuleParams = {
    length:["minLength", "maxLength"],
    
    regex: ["regex", "regexName", "hint"],
    range: ["min", "max"],
};