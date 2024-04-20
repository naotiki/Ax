import { createContext, useContext } from "react";
import type { EditLevel } from "../AxEditor";

export type SchemaEditorData = {
  allowedLevel: EditLevel[];
  addedFieldIds: string[];
  addedModelIds: string[];
};

const EditSchemaContext = createContext<SchemaEditorData | undefined>(undefined);

export const useSchamaEditorContext = () => {
  return useContext(EditSchemaContext) as SchemaEditorData;
};

export const SchemaEditorProvider = EditSchemaContext.Provider;
