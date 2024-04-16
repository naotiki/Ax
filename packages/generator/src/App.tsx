import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  type ModelType,
  type DBType,
  type ValueType,
  DefaultValueProviders,
  type FieldDefault,
  type Rules,
  type JSType,
  type AxTypes,
  getAxTypeData,
  ModelValidator,
} from "ax";
import {
  AppShell,
  Burger,
  MantineProvider,
  Title,
  createTheme,
  Group,
  Button,
  Stack,
  TextInput,
  Menu,
  Card,
  Text,
  Container,
  Select,
  type SelectProps,
  ActionIcon,
  Popover,
  Radio,
  Space,
  Badge,
  Loader,
  HoverCard,
  Notification,
  Box,
  Center,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useEffect, useState, type FC } from "react";
import {
  IconCirclesRelation,
  IconEdit,
  IconId,
  IconLink,
  IconPlus,
  IconSearch,
  IconSort09,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { AxcelInput } from "./components/AxcelInput";
import { FieldEditor, fieldTypesSelectData } from "./components/FieldEditor";
import { RelationEditor } from "./components/RelationEditor";
import { nanoid } from "nanoid";
import type { ModelValidateError } from "ax/ModelValidator";

const theme = createTheme({
  defaultGradient: {
    from: "red",
    to: "orange",
    deg: 0,
  },
});

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [models, setModels] = useLocalStorage<ModelType[]>({
    key: "models",
    defaultValue: [],
  });
  const [errors, setErrors] = useState<ModelValidateError[] | null>(null);
  useEffect(() => {
    setErrors(null);
    ModelValidator(models).then((errors) => {
      setErrors(errors);
    });
  }, [models]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const selectedModel =
    selectedModelId !== null
      ? models.find((m) => m._id === selectedModelId)
      : null;
  return (
    <>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: "sm",
            collapsed: { mobile: !opened },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Title order={1}>Ax gen</Title>
              <Space style={{ flexGrow: 1 }} />
              {errors ? (
                <HoverCard shadow="md">
                  <HoverCard.Target>
                    <Group>
                      <Badge
                        size="xl"
                        circle
                        color={errors.length > 0 ? "red" : "green"}
                      >
                        {errors.length}
                      </Badge>

                      <Button disabled={!errors || errors.length > 0} onClick={()=>{
                        fetch("http://localhost:8080/migrate", {
                          method: "POST",
                          body: JSON.stringify(models),
                        })
                      }}>
                        変更を適用
                      </Button>
                    </Group>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Center>
                      <IconSearch />
                      <Title order={5}>見つかったエラー</Title>
                    </Center>
                    {errors.length > 0 ? (
                      errors.map((error) => (
                        <Notification
                          key={error.error + error.modelId + error.fieldId}
                          color="red"
                          withCloseButton={false}
                          title={(() => {
                            const model = models.find(
                              (m) => m._id === error.modelId,
                            );
                            const modelName =
                              model?.meta?.label ?? model?.name ?? "不明";
                            if (error.fieldId) {
                              const field = model?.fields.find(
                                (f) => f._id === error.fieldId,
                              );
                              return `${modelName} > ${
                                field?.meta?.label ?? field?.name ?? "不明"
                              }`;
                            }
                            return modelName;
                          })()}
                          onClick={() => {
                            setSelectedModelId(error.modelId);
                          }}
                        >
                          {error.error}
                        </Notification>
                      ))
                    ) : (
                      <Text size="md">エラーはありません</Text>
                    )}
                  </HoverCard.Dropdown>
                </HoverCard>
              ) : (
                <Loader />
              )}
            </Group>
          </AppShell.Header>
          <AppShell.Navbar p="md">
            <AppShell.Section>
              <Title order={3}>モデル</Title>
            </AppShell.Section>
            <AppShell.Section>
              <Stack my={"md"} gap={"sm"}>
                {models.map((model) => (
                  <Button
                    key={model._id}
                    fullWidth
                    variant={
                      selectedModelId === model._id ? "outline" : "subtle"
                    }
                    onClick={() => {
                      setSelectedModelId(model._id);
                    }}
                  >
                    {model.meta.label}
                  </Button>
                ))}
              </Stack>
            </AppShell.Section>
            <AppShell.Section>
              <Button
                fullWidth
                onClick={() => {
                  const id = nanoid();
                  const m: ModelType = {
                    _id: id,
                    meta:{
                      label:`新しいモデル ${id.slice(0, 4)}`,
                      computedStyles: [],
                    },
                    name: `NewModel_${id.slice(0, 4)}`,
                    fields: [],
                  };
                  setModels([...models, m]);
                  setSelectedModelId(m._id);
                }}
              >
                モデルを追加
              </Button>
            </AppShell.Section>
          </AppShell.Navbar>
          <AppShell.Main>
            {selectedModel && (
              <ModelEditor
                model={selectedModel}
                models={models}
                onSave={(model) => {
                  setModels((models) =>
                    models.map((m) => (m._id === model._id ? model : m)),
                  );
                }}
                errors={[]}
              />
            )}
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </>
  );
}
type ModelErrors = "DuplicatedModelName" | "InvalidModelName";
type ModelEditorProps = {
  model: ModelType;
  models: ModelType[];
  onSave: (model: ModelType) => void;
  errors: ModelErrors[];
};
function ModelEditor({ model, models, onSave, errors }: ModelEditorProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField =
    selectedFieldId !== null
      ? model.fields.find((f) => f._id === selectedFieldId)
      : null;
  return (
    <Group w={"100%"} h={"100%"} align="start">
      <Container my={"md"} style={{ flexGrow: 1 }}>
        <Title order={3} my={10}>
          モデル編集
        </Title>
        <TextInput
          size="xl"
          label="名前"
          placeholder="名前"
          value={model.name}
          onChange={(e) => {
            onSave({ ...model, name: e.currentTarget.value });
          }}
        />
        <TextInput
          size="xl"
          label="表示名"
          placeholder="表示名"
          value={model.meta.label}
          onChange={(e) => {
            onSave({ ...model, meta: { ...model.meta, label: e.currentTarget.value }});
          }}
        />
        <Title order={3}>フィールド</Title>
        {model.fields.map((f) => (
          <Card
            shadow="sm"
            withBorder
            key={f._id}
            onClick={() => {
              setSelectedFieldId(f._id);
            }}
            style={{
              cursor: "pointer",
            }}
          >
            <Card.Section>
              <Group>
                {f.fieldType === "value" ? <IconEdit /> : <IconLink />}
                <Title order={3}>{f.meta.label}</Title>
                {f.fieldType === "relation" && (
                  <>
                    <IconCirclesRelation />
                    <Title order={3}>
                      {models.find((m) => m._id === f.relation.modelId)?.meta?.label}
                    </Title>
                  </>
                )}
              </Group>
            </Card.Section>
            <Card.Section>
              <Group>
                {f.fieldType === "value" && (
                  <>
                    <Text>タイプ: {f.axType}</Text>
                  </>
                )}
                <Space style={{ flexGrow: 1 }} />
                <Popover width={200} position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <ActionIcon color="red" m={5}>
                      <IconTrash />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Button
                      fullWidth
                      color="red"
                      leftSection={<IconTrash />}
                      onClick={() => {
                        onSave({
                          ...model,
                          fields: model.fields.filter(
                            (field) => field._id !== f._id,
                          ),
                        });
                      }}
                    >
                      削除
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Card.Section>
          </Card>
        ))}
        <Menu shadow="md">
          <Menu.Target>
            <Button leftSection={<IconPlus />} fullWidth>
              フィールドを追加
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>フィールドタイプ</Menu.Label>
            <Menu.Item
              leftSection={<IconEdit />}
              onClick={() => {
                const id = nanoid();
                onSave({
                  ...model,
                  fields: [
                    ...model.fields,
                    {
                      _id: id,
                      name: `NewField_${id.slice(0, 4)}`,
                      meta:{
                        label:`新しいフィールド ${id.slice(0, 4)}`,
                        rules: [],
                        readonly: false,
                        invisible: false,
                      },
                      fieldType: "value",
                      axType: "string",
                      typeParams: {},
                      optional: true,
                      id: false,
                      unique: false,
                      default: undefined,
                    },
                  ],
                });
              }}
            >
              値
            </Menu.Item>
            <Menu.Item
              leftSection={<IconLink />}
              onClick={() => {
                const id = nanoid();
                onSave({
                  ...model,
                  fields: [
                    ...model.fields,
                    {
                      _id: id,
                      name: `NewField_${id.slice(0, 4)}`,
                      meta:{
                        label: `新しい関連付け ${id.slice(0, 4)}`,
                        readonly: false,
                        invisible: false,
                      },
                      fieldType: "relation",
                      relation: {
                        modelId: "",
                        relationFieldIds: [],
                      },
                    },
                  ],
                });
              }}
            >
              関連付け
            </Menu.Item>
            <Menu.Divider />
            <Menu.Label>テンプレート</Menu.Label>
            <Menu.Item
              leftSection={<IconSort09 />}
              onClick={() => {
                const id = nanoid();
                onSave({
                  ...model,
                  fields: [
                    ...model.fields,
                    {
                      _id: id,
                      name: "id",
                      meta:{
                        label: "ID",
                        readonly: true,
                        invisible: false,
                        rules: [],
                      },
                      fieldType: "value",
                      axType: "int",
                      typeParams: {},
                      optional: false,
                      id: true,
                      unique: false,
                      default: DefaultValueProviders.autoIncrement,
                    },
                  ],
                });
              }}
            >
              ID (連番)
            </Menu.Item>
            <Menu.Item
              leftSection={<IconId />}
              onClick={() => {
                const id = nanoid();
                onSave({
                  ...model,
                  fields: [
                    ...model.fields,
                    {
                      _id: id,
                      name: "id",
                      meta:{
                        label: "ID",
                        readonly: true,
                        invisible: false,
                        rules: [],
                      },
                      fieldType: "value",
                      axType: "string",
                      typeParams: {},
                      optional: false,
                      id: true,
                      unique: false,
                      default: DefaultValueProviders.uuid,
                    },
                  ],
                });
              }}
            >
              ID (UUID)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Container>
      {selectedField && selectedField.fieldType === "value" && (
        <FieldEditor
          field={selectedField}
          onSave={(f) => {
            onSave({
              ...model,
              fields: model.fields.map((field) =>
                field._id === f._id ? f : field,
              ),
            });
          }}
        />
      )}
      {selectedField && selectedField.fieldType === "relation" && (
        <RelationEditor
          otherModels={models.filter((m) => m._id !== model._id)}
          field={selectedField}
          onSave={(f) => {
            onSave({
              ...model,
              fields: model.fields.map((field) =>
                field._id === f._id ? f : field,
              ),
            });
          }}
        />
      )}
    </Group>
  );
}

type FieldDefaultEditorProps = {
  field: ValueType<AxTypes>;
  value: FieldDefault<DBType> | undefined;
  onChange: (value: FieldDefault<DBType> | undefined) => void;
};
export const FieldDefaultEditor: FC<FieldDefaultEditorProps> = ({
  field,
  value,
  onChange,
}: FieldDefaultEditorProps) => {
  const [radioValue, setRadioValue] = useState<"none" | "value" | "provider">(
    () => value?.type ?? "none",
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
              value={
                value?.type === "value" ? value?.defaultValue ?? null : null
              }
              onValueChange={(v) => {
                onChange({
                  type: "value",
                  dbType: getAxTypeData(field.axType).db,
                  defaultValue: v,
                });
              }}
            />
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
          }))}
        />
      )}
    </>
  );
};

export const renderSelectOption: SelectProps["renderOption"] = ({ option }) => (
  <Group flex="1" gap="xs">
    {fieldTypesSelectData.find((item) => item.value === option.value)?.icon}
    {option.label}
  </Group>
);
export const ruleLabels = {
  length: {
    name: "文字数",
    jsType: "string",
    description: "文字数を指定します。",
  },
  range: {
    name: "範囲",
    jsType: "number",
    description: "数値の範囲を指定します。",
  },
  regex: {
    name: "パターン",
    jsType: "string",
    description: "文字の形式を指定します。",
  },
} satisfies Record<
  Rules["ruleName"],
  { name: string; jsType: JSType; description: string }
>;
export default App;
