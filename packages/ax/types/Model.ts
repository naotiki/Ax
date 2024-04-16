import type { FieldTypes } from "..";

export type ModelType = {
	readonly _id: string;
	name: string;
	fields: FieldTypes[];
	meta: {//破壊的変更ではない
		label?: string;
		description?: string;
		computedStyles: ({
			compute: BoolExpression;
		} & ({
			row: Record<string, string>;
		} | Record<string, Record<string, string>>))[];
	}
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