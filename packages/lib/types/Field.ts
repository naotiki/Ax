import type { DBType, RulesOfJSType, AxTypes, AxTypeOfTypeExtender, AxTypeDetail } from "..";

export type FieldTypes = ValueType<AxTypes> | RelationType;

export type FieldType<F extends string, M extends {}> = {
	readonly _id: string;
	name: string;
	readonly fieldType: F;
	meta: {
		label?: string;
		description?: string;
		readonly: boolean;
		invisible: boolean;
	} & M
};

export type ValueType<A extends AxTypes> = {
	axType: A;
	typeParams: AxTypeOfTypeExtender<A>;
	optional: boolean;
	id: boolean;
	unique: boolean;
	default?: FieldDefault<AxTypeDetail<A>["db"]>;
} & FieldType<"value", {
	rules: RulesOfJSType<AxTypeDetail<A>["js"]>[];
}>;

export type RelationType = {
	relation: {
		modelId: string;
		relationFieldIds: string[];
	};
} & FieldType<"relation", { displayColumn?: string; }>;

export type FieldDefault<D extends DBType> = {
	type: "value";
	dbType: D;
	defaultValue: string | null;
} | {
	type: "provider";
	dbType: D;
	name: string;
	id: string;
	expression: string;
}
export function checkFieldType<A extends AxTypes>(field: ValueType<AxTypes>, t: A): field is ValueType<A> {
	return field.axType === t
}