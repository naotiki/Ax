import {
  type AxTypes,
  AxTypeBuilders,
  type Rules,
  RuleParams,
  type ValueType,
  checkFieldType,
  getAxTypeData,
  type AxTypesWithProperties,
} from "lib";
import {
  Title,
  Group,
  Button,
  Stack,
  TextInput,
  Menu,
  Text,
  Box,
  Select,
  ActionIcon,
  Textarea,
  Checkbox,
  Divider,
  MenuItem,
} from "@mantine/core";
import { type ReactNode, useState } from "react";
import {
  IconCalendar,
  IconCheckbox,
  IconDecimal,
  IconLetterCase,
  IconList,
  IconListLetters,
  IconNumber123,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { RuleEditor } from "./RuleEditor";
import { renderSelectOption, ruleLabels } from "../AxEditor";
import { FieldDefaultEditor } from "./FieldDefaultEditor";
export type FieldEditorProps = {
  field: ValueType<AxTypes>;
  onSave: (field: ValueType<AxTypes>) => void;
};
export function FieldEditor({ field, onSave }: FieldEditorProps) {
  const [newEnum, setNewEnum] = useState<{
    value: string;
    label: string;
  }>({ value: "", label: "" });
  return (
    <Box>
      <Title order={3} my={10}>
        フィールド編集
      </Title>
      <TextInput
        size="xl"
        placeholder="名前"
        label="名前"
        value={field.name}
        onChange={(e) => {
          onSave({ ...field, name: e.currentTarget.value });
        }}
      />

      <TextInput
        size="xl"
        label="表示名"
        placeholder="表示名"
        value={field.meta.label}
        onChange={(e) => {
          onSave({
            ...field,
            meta: { ...field.meta, label: e.currentTarget.value },
          });
        }}
      />

      <Select
        value={field.axType}
        onChange={(value) => {
          let typeParams = {};
          if (value === "Enum") {
            typeParams = {
              name: "",
              entries: [],
            } satisfies AxTypesWithProperties["Enum"];
          } else if (value === "Array") {
            typeParams = {
              of: "string",
            } satisfies AxTypesWithProperties["Array"];
          }
          onSave({ ...field, axType: value as AxTypes, typeParams });
        }}
        leftSection={
          fieldTypesSelectData.find((e) => e.value === field.axType)?.icon
        }
        label="種類"
        placeholder="種類"
        allowDeselect={false}
        size="md"
        data={fieldTypesSelectData}
        renderOption={renderSelectOption}
      />
      {checkFieldType(field, "Enum") && (
        <Box ml={20}>
          <TextInput label="選択肢グループの名前" value={field.typeParams.name} onChange={(e)=>{
            onSave({
              ...field,
              typeParams: {
                ...field.typeParams,
                name: e.currentTarget.value
              }
            })
          }}/>
          {field.typeParams.entries.map((e) => (
            <Text key={e.value}>
              {e.value} {e.meta.label}
            </Text>
          ))}
          <Group wrap="nowrap" gap={0}>
            <TextInput
              placeholder="新しい選択肢"
              value={newEnum.value}
              onChange={(e) => {
                setNewEnum({ ...newEnum, value: e.currentTarget.value });
              }}
              style={{
                flexGrow: 1,
              }}
            />
            <TextInput
              placeholder="新しい表示名"
              value={newEnum.label}
              onChange={(e) => {
                setNewEnum({ ...newEnum, label: e.currentTarget.value });
              }}
              style={{
                flexGrow: 1,
              }}
            />
            <ActionIcon
              variant="transparent"
              onClick={() => {
                if (
                  field.axType !== "Enum" ||
                  newEnum.value === "" ||
                  field.typeParams.entries
                    .map((e) => e.value)
                    .includes(newEnum.value)
                ) {
                  return;
                }
                console.log(field.typeParams.entries);

                onSave({
                  ...field,
                  typeParams: {
                    ...field.typeParams,
                    entries: [
                      ...field.typeParams.entries,
                      {
                        value: newEnum.value,
                        meta:{
                          label: newEnum.label !== "" ? newEnum.label : undefined,
                        }
                      } satisfies AxTypesWithProperties["Enum"]["entries"][number],
                    ],
                  },
                });
                setNewEnum({ value: "", label: "" });
              }}
            >
              <IconPlus />
            </ActionIcon>
          </Group>
        </Box>
      )}
      {checkFieldType(field, "Array") && (
        <Select
          value={field.typeParams.of}
          onChange={(value) => {
            onSave({
              ...field,
              typeParams: AxTypeBuilders.array(value as AxTypes),
            });
          }}
          leftSection={
            fieldTypesSelectData.find((e) => e.value === field.axType)?.icon
          }
          label="リストの種類"
          placeholder="リストの種類"
          allowDeselect={false}
          size="md"
          data={fieldTypesSelectData.filter(
            (e) => e.value !== "Array" && e.value !== "Enum",
          )}
          renderOption={renderSelectOption}
        />
      )}
      <Textarea
        label="説明"
        description="フィールドの説明"
        value={field.meta.description}
        onChange={(e) => {
          onSave({
            ...field,
            meta: { ...field.meta, description: e.currentTarget.value },
          });
        }}
      />

      <FieldDefaultEditor
        key={field._id}
        field={field}
        value={field.default}
        onChange={(v) => {
          onSave({ ...field, default: v });
        }}
      />
      <Stack my={20}>
        <Checkbox
          label="「空」を許可"
          description="値が「空」になることを許可します。"
          checked={field.optional}
          onChange={(e) => {
            onSave({ ...field, optional: e.currentTarget.checked });
          }}
          disabled={field.id}
        />
        <Checkbox
          label="IDとして指定"
          description="IDとして使用する場合はチェックしてください。"
          checked={field.id}
          onChange={(e) => {
            onSave({ ...field, id: e.currentTarget.checked });
          }}
          disabled={field.optional}
        />
        <Checkbox
          label="ユニークな値"
          description="値が一意であることを保証します。"
          checked={field.unique}
          onChange={(e) => {
            onSave({ ...field, unique: e.currentTarget.checked });
          }}
          disabled={field.id}
        />
        <Divider />
        <Checkbox
          label="変更禁止"
          description="Axcelからの変更を禁止します。"
          checked={field.meta.readonly}
          onChange={(e) => {
            onSave({
              ...field,
              meta: { ...field.meta, readonly: e.currentTarget.checked },
            });
          }}
        />
        <Checkbox
          label="非表示"
          description="Axcelから見えなくします。"
          checked={field.meta.invisible}
          onChange={(e) => {
            onSave({
              ...field,
              meta: { ...field.meta, invisible: e.currentTarget.checked },
            });
          }}
        />
      </Stack>
      <Box>
        <Text fw={700}>入力規則</Text>
        <Text size="sm" c={"dimmed"}>
          入力のルールを設定します。
        </Text>
        {field.meta.rules.map((rule) => (
          <Box key={rule.ruleName}>
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={600}>{ruleLabels[rule.ruleName].name}</Text>
                <Text size="sm" c={"dimmed"}>
                  {ruleLabels[rule.ruleName].description}
                </Text>
              </Stack>
              <ActionIcon
                color="red"
                onClick={() => {
                  onSave({
                    ...field,
                    meta: {
                      ...field.meta,
                      rules: field.meta.rules.filter(
                        (r) => r.ruleName !== rule.ruleName,
                      ),
                    },
                  });
                }}
              >
                <IconTrash />
              </ActionIcon>
            </Group>
            <Stack gap={5}>
              <RuleEditor
                rule={rule}
                onRuleChange={(r) => {
                  console.log(r);

                  onSave({
                    ...field,
                    meta: {
                      ...field.meta,
                      rules: field.meta.rules.map((rr) =>
                        rr.ruleName === r.ruleName ? r : rr,
                      ),
                    },
                  });
                }}
              />
              <Divider />
            </Stack>
          </Box>
        ))}
        <Menu shadow="md">
          <Menu.Target>
            <Button leftSection={<IconPlus />} fullWidth>
              ルールを追加
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {Object.entries(ruleLabels)
              .filter(([k, v]) => v.jsType === getAxTypeData(field.axType).js)
              .map(([k, rule]) => (
                <MenuItem
                  key={rule.name}
                  disabled={field.meta.rules
                    .map((r) => r.ruleName)
                    .includes(k as Rules["ruleName"])}
                  onClick={() => {
                    onSave({
                      ...field,
                      meta: {
                        ...field.meta,
                        rules: [
                          ...field.meta.rules,
                          {
                            ruleName: k as Rules["ruleName"],
                            jsType: getAxTypeData(field.axType).js,
                            params: Object.fromEntries(
                              RuleParams[k as keyof typeof RuleParams].map(
                                (p) => [p, undefined],
                              ),
                            ),
                          } as Rules,
                        ],
                      },
                    });
                  }}
                >
                  {rule.name}
                </MenuItem>
              ))}
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
}

export const fieldTypesSelectData: {
  value: string;
  label: string;
  icon?: ReactNode;
}[] = [
  {
    value: "string",
    label: "文字列",
    icon: <IconLetterCase />,
  },
  {
    value: "int",
    label: "整数",
    icon: <IconNumber123 />,
  },
  {
    value: "float",
    label: "少数",
    icon: <IconDecimal />,
  },
  {
    value: "decimal",
    label: "高精度数値",
    icon: <IconDecimal />,
  },
  {
    value: "bool",
    label: "真偽値",
    icon: <IconCheckbox />,
  },
  {
    value: "date",
    label: "日付",
    icon: <IconCalendar />,
  },
  {
    value: "Array",
    label: "リスト",
    icon: <IconList />,
  },
  {
    value: "Enum",
    label: "選択",
    icon: <IconListLetters />,
  },
] satisfies Array<{
  value: AxTypes;
  label: string;
  icon?: ReactNode;
}>;
