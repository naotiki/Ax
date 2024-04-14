import type { ValueOf } from "./Utils";

export type DBType =
	| "String"
	| "Int"
	| "Float"
	| "Decimal"
	| "Date"
	| "Bool"
	| "Array"
	| "Enum"; /*"Relation"*/
export type JSType =
	| "string"
	| "number"
	| "boolean"
	| "Date"
	| "Array"
	| "Enum";
type AxTypesIdWithoutBuilder = "string" | "int" | "float" | "decimal" | "bool" | "date" | "datetime";
export type AxType =
	{
		id: AxTypesIdWithoutBuilder;
		js: JSType;
		db: DBType;
	}
	| {
		id: "Array";
		js: JSType;
		db: DBType;
		of: AxType;
	}
	| {
		id: "Enum";
		js: JSType;
		db: DBType;
		entries: {
			value: string;
			label?: string
		}[];
	}
export const AxTypes = {
	string: {
		id: "string",
		js: "string",
		db: "String",
	},
	int: {
		id: "int",
		js: "number",
		db: "Int",
	},
	float: {
		id: "float",
		js: "number",
		db: "Float",
	},
	decimal: {
		id: "decimal",
		js: "number",
		db: "Decimal",
	},
	bool: {
		id: "bool",
		js: "boolean",
		db: "Bool",
	},
	date: {
		id: "date",
		js: "Date",
		db: "Date",
	},
	datetime: {
		id: "datetime",
		js: "Date",
		db: "Date"
	}
} satisfies Record<AxTypesIdWithoutBuilder, AxType>;

export const AxTypeBuilders = {
	array: (of: AxType) => ({
		id: "Array",
		js: "Array",
		db: "Array",
		of: of,
	} as AxType),
	enum: (entries: { value: string; label?: string }[]) => ({
		id: "Enum",
		js: "Enum",
		db: "Enum",
		entries: entries,
	} as AxType),
}
