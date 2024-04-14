import type { ValueType } from "./Field";
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
type AxTypesWithoutBuilder = Exclude<AxTypes, "Array" | "Enum">;
export type AxTypes = keyof AxTypesWithProperties;
export type AxTypeOfTypeExtender<T extends AxTypes> = AxTypesWithProperties[T]
export type AxTypesWithProperties = {
	string: {}
	int: {}
	float: {}
	decimal: {}
	bool: {}
	date: {
		meta: {
			isDateOnly?: boolean;
		}
		updatedAt?: boolean;//TODO 
	},
	Array: {
		of: AxTypes
	}
	Enum: {
		name:string;
		entries: { value: string; label?: string }[]
	}
}
export type AxTypeDetail<A extends AxTypes> = (typeof AxTypeDatas)[A]
export type AxTypeData =
	{
		id: AxTypes;
		js: JSType;
		db: DBType;
	}
export function getAxTypeData<A extends AxTypes>(a: A): AxTypeDetail<A> {
	return AxTypeDatas[a]
}
export const AxTypeDatas = {
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
	Array: {
		id: "Array",
		js: "Array",
		db: "Array",
	},
	Enum: {
		id: "Enum",
		js: "Enum",
		db: "Enum",
	}
} satisfies Record<AxTypes, AxTypeData>;

export const AxTypeBuilders = {
	array: (of: AxTypes) => ({
		id: "Array",
		js: "Array",
		db: "Array",
		of: of,
	} as AxTypeData),
	enum: (entries: { value: string; label?: string }[]) => ({
		id: "Enum",
		js: "Enum",
		db: "Enum",
		entries: entries,
	} as AxTypeData),
}
