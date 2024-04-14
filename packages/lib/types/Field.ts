import type { DBType, AxType, RulesOfJSType, JSType } from "..";

export type FieldTypes = ValueType<DBType, AxType> | RelationType<DBType, AxType>;

export type FieldType<F extends string> = {
	_id:string;
	name: string;
	label?: string;
	description?: string;
	fieldType: F;

	readonly: boolean,
	invisible: boolean
};
type DBAttributeOf<D extends DBType> = {
	type: D;
	defaultValue?: string;
} | {
	type: D;
	defaultValueProviderName: string;
};

export type ValueType<D extends DBType, A extends AxType> = {
	axType: A;
	rules: RulesOfJSType<A["js"]>[];
	optional: boolean;
	id: boolean;
	unique: boolean;
	default?: FieldDefault<D>;
} & FieldType<"value"> ;

export type RelationType<D extends DBType, J extends AxType> = {
	relation: {
		modelId: string;
		relationFieldIds: string[];
		displayColumn?: string;
	};
} & FieldType<"relation">;

export type FieldDefault<D extends DBType>={
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