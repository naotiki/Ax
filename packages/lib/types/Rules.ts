import type { AxTypeDatas, DBType, JSType } from "./Types";

export type RuleBase<T extends Lowercase<string>, JST extends JSType, R extends {}> = {
	ruleName: T;
	jsType: JST;
  params: R;
} ;

export type Rules = LengthRule | RangeRule | RegexRule;

export type RulesOfJSType<T extends JSType> = Extract<
	Rules,
	RuleBase<Rules["ruleName"], T, object>
>;

export type LengthRule = RuleBase<
	"length",
	typeof AxTypeDatas.string.js,
	{
		minLength?: number;
		maxLength?: number;
	}
>;

export type RangeRule = RuleBase<
	"range",
	"number",
	{
		min?: number;
		max?: number;
	}
>;

export type RegexRule = RuleBase<
	"regex",
	"string",
	{
		regex: string;
		regexName?: string;
		hint?: string;
	}
>;
