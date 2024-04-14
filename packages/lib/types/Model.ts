import type { FieldTypes } from "..";

export type ModelType = {
	_id: string;
	name: string;
	label?: string;
	description?: string;
	computedStyles: ({
		compute: BoolExpression;
	} & ({
		row: Record<string, string>;
	} | Record<string, Record<string, string>>))[];
	fields: FieldTypes[];
};



type CompartibleExpressions = "gt" | "gte" | "lt" | "lte"
type Expressions = "eq" | "neq" | CompartibleExpressions
type BoolExpression = {
	ex: Expressions
	value: string;
} | {
	and: BoolExpression[];
} | {
	or: BoolExpression[];
}