import {
  type DBType,
  type ValueType,
  DefaultValueProviders,
  type FieldDefault, type AxTypes,
  getAxTypeData
} from "lib";
import {
  Group, Select, ActionIcon,
  Radio, Box
} from "@mantine/core";
import { useState, type FC } from "react";
import { IconX } from "@tabler/icons-react";
import { AxcelInput } from "./AxcelInput";

type FieldDefaultEditorProps = {
  field: ValueType<AxTypes>;
  value: FieldDefault<DBType> | undefined;
  onChange: (value: FieldDefault<DBType> | undefined) => void;
};
export const FieldDefaultEditor: FC<FieldDefaultEditorProps> = ({
  field, value, onChange,
}: FieldDefaultEditorProps) => {
  const [radioValue, setRadioValue] = useState<"none" | "value" | "provider">(
    () => value?.type ?? "none"
  );
  return (
    <>
      <Radio.Group
        value={radioValue}
        onChange={(e) => {
          const value = e as "none" | "value" | "provider";
          setRadioValue(value);
          if (value === "none") {
            onChange(undefined);
            return;
          }
          if (value === "value") {
            onChange({
              type: "value",
              dbType: getAxTypeData(field.axType).db,
              defaultValue: null,
            });
            return;
          }
        }}
        label="デフォルト"
        description="デフォルト値を設定します。"
        defaultValue="none"
      >
        <Group mt="xs">
          <Radio value="none" label="なし" />
          <Radio value="value" label="固定値" />
          <Radio value="provider" label="自動生成" />
        </Group>
      </Radio.Group>
      {radioValue === "value" && (
        <Box>
          <Group>
            <AxcelInput
              field={field}
              value={value?.type === "value" ? value?.defaultValue ?? null : null}
              onValueChange={(v) => {
                onChange({
                  type: "value",
                  dbType: getAxTypeData(field.axType).db,
                  defaultValue: v,
                });
              }} />
            <ActionIcon
              variant="subtle"
              color="red"
              size={"md"}
              onClick={() => {
                onChange({
                  type: "value",
                  dbType: getAxTypeData(field.axType).db,
                  defaultValue: null,
                });
              }}
              disabled={value?.type !== "value" || value?.defaultValue === null}
            >
              <IconX />
            </ActionIcon>
          </Group>
        </Box>
      )}
      {radioValue === "provider" && (
        <Select
          label="プリセット"
          value={value?.type === "provider" ? value?.id ?? null : null}
          onChange={(v) => {
            onChange({
              ...DefaultValueProviders[v as keyof typeof DefaultValueProviders],
            });
          }}
          data={Object.values(DefaultValueProviders).map((v) => ({
            value: v.id,
            label: v.name,
            disabled: v.dbType !== getAxTypeData(field.axType).db,
          }))} />
      )}
    </>
  );
};
