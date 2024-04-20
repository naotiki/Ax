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
import { useSchamaEditorContext } from "./EditSchemaContext";
import { injectProps } from "../utils/InjectProps";
export type FieldEditorProps = {
  field: ValueType<AxTypes>;
  onSave: (field: ValueType<AxTypes>) => void;
  isNewModel: boolean;
};
export function FieldEditor({ field, onSave, isNewModel }: FieldEditorProps) {
  const ctx = useSchamaEditorContext();
  const isNewField = ctx.addedFieldIds.includes(field._id) || isNewModel;
  const [newEnum, setNewEnum] = useState<{
    value: string;
    label: string;
  }>({ value: "", label: "" });
  return (
    <Box>
      <Title order={3} my={10}>
        カラム編集
      </Title>
      <TextInput
        size="xl"
        placeholder="名前"
        label="名前"
        value={field.name}
        onChange={(e) => {
          onSave({ ...field, name: e.currentTarget.value });
        }}
        {...injectProps(ctx, "develop", isNewField)}
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
        {...injectProps(ctx, "axcelFront", isNewField)}
      />

      <Select
        value={field.axType}
        onChange={(value) => {
          let typeParams = {};
          switch (value as AxTypes) {
            case "string":
            case "int":
            case "float":
            case "decimal":
            case "bool":
            case "date":
              typeParams = {
                updatedAt: false,
                meta: {
                  isDateOnly: false,
                },
              } satisfies AxTypesWithProperties["date"];
              break;
            case "Array":
              typeParams = {
                of: "string",
              } satisfies AxTypesWithProperties["Array"];
              break;
            case "Enum":
              typeParams = {
                name: "",
                entries: [],
              } satisfies AxTypesWithProperties["Enum"];
              break;
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
        {...injectProps(ctx, "develop", isNewField)}
      />
      {checkFieldType(field, "date") && (
        <Box ml={20}>
          <Checkbox
            label="日付のみ"
            description="日付のみを許可します。"
            checked={field.typeParams.meta.isDateOnly}
            onChange={(e) => {
              onSave({
                ...field,
                typeParams: {
                  ...field.typeParams,
                  meta: {
                    ...field.typeParams.meta,
                    isDateOnly: e.currentTarget.checked,
                  },
                },
              });
            }}
            {...injectProps(ctx, "axcelFront", isNewField)}
          />
        </Box>
      )}
      {checkFieldType(field, "Enum") && (
        <Box ml={20}>
          <TextInput
            label="選択肢グループの名前"
            placeholder="選択肢グループの名前(英数記号)"
            value={field.typeParams.name}
            onChange={(e) => {
              onSave({
                ...field,
                typeParams: {
                  ...field.typeParams,
                  name: e.currentTarget.value,
                },
              });
            }}
            {...injectProps(ctx, "develop", isNewField)}
          />
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
              {...injectProps(ctx, "add", isNewField)}
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
              {...injectProps(ctx, "add", isNewField)}
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
                        meta: {
                          label:
                            newEnum.label !== "" ? newEnum.label : undefined,
                        },
                      } satisfies AxTypesWithProperties["Enum"]["entries"][number],
                    ],
                  },
                });
                setNewEnum({ value: "", label: "" });
              }}
              {...injectProps(ctx, "add", isNewField)}
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
          {...injectProps(ctx, "develop", isNewField)}
        />
      )}
      <Textarea
        label="説明"
        description="カラムの説明"
        value={field.meta.description}
        onChange={(e) => {
          onSave({
            ...field,
            meta: { ...field.meta, description: e.currentTarget.value },
          });
        }}
        {...injectProps(ctx, "axcelFront", isNewField)}
      />

      <FieldDefaultEditor
        key={field._id}
        field={field}
        value={field.default}
        onChange={(v) => {
          onSave({ ...field, default: v });
        }}
        {...injectProps(ctx, "develop", isNewField)}
      />
      <Stack my={20}>
        <Checkbox
          label="「空」を許可"
          description="値が「空」になることを許可します。"
          checked={field.optional}
          onChange={(e) => {
            onSave({ ...field, optional: e.currentTarget.checked });
          }}
          {...injectProps(ctx, "develop", isNewField)}
          disabled={
            field.id || injectProps(ctx, "develop", isNewField).disabled
          }
        />
        <Checkbox
          label="IDとして指定"
          description="IDとして使用する場合はチェックしてください。"
          checked={field.id}
          onChange={(e) => {
            onSave({ ...field, id: e.currentTarget.checked });
          }}
          {...injectProps(ctx, "develop", isNewField)}
          disabled={
            field.optional || injectProps(ctx, "develop", isNewField).disabled
          }
        />
        <Checkbox
          label="ユニークな値"
          description="値が一意であることを保証します。"
          checked={field.unique}
          onChange={(e) => {
            onSave({ ...field, unique: e.currentTarget.checked });
          }}
          {...injectProps(ctx, "develop", isNewField)}
          disabled={
            field.id || injectProps(ctx, "develop", isNewField).disabled
          }
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
          {...injectProps(ctx, "axcelFront", isNewField)}
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
          {...injectProps(ctx, "axcelFront", isNewField)}
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
                {...injectProps(ctx, "axcelFront", isNewField)}
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
                {...injectProps(ctx, "axcelFront", isNewField)}
              />
              <Divider />
            </Stack>
          </Box>
        ))}
        <Menu shadow="md" {...injectProps(ctx, "axcelFront", isNewField)}>
          <Menu.Target>
            <Button
              leftSection={<IconPlus />}
              {...injectProps(ctx, "axcelFront", isNewField)}
              fullWidth
            >
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
