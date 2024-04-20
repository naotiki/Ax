import {
  type ModelType,
  type Rules,
  type JSType,
  ModelValidator,
  getAddedElement,
} from "lib";
import {
  AppShell,
  Burger,
  Title,
  Group,
  Button,
  Stack,
  Text,
  type SelectProps,
  Space,
  Badge,
  Loader,
  HoverCard,
  Notification,
  Center,
  ActionIcon,
  Modal,
  Code,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { IconCode, IconSearch } from "@tabler/icons-react";
import { fieldTypesSelectData } from "./components/FieldEditor";
import { nanoid } from "nanoid";
import type { ModelValidateError } from "lib/functions/ModelValidator";
import { ModelEditor } from "./components/ModelEditor";
import {
  SchemaEditorProvider,
  type SchemaEditorData,
} from "./components/EditSchemaContext";
import { injectProps } from "./utils/InjectProps";
//全変更可, テーブル+カラム追加+Axcel, Axcelのみ
const EditLevel = ["develop", "add", "axcelFront"] as const;
export type EditLevel = (typeof EditLevel)[number];

type EditorProps = {
  headerLeftSection?: React.ReactNode;
  headerRightSection?: React.ReactNode;
  initialModels: Schema;
  allowEditMode: EditLevel[];
};

export function AxEditor({ initialModels, ...props }: EditorProps) {
  const [opened, { toggle }] = useDisclosure();
  const [models, setModels] = useState(initialModels);
  const [issues, setErrors] = useState<ModelValidateError[] | null>(null);
  const [schemaEditorData, setSchemaEditorData] = useState<SchemaEditorData>({
    allowedLevel: props.allowEditMode,
    addedFieldIds: [],
    addedModelIds: [],
  });
  useEffect(() => {
    setErrors(null);
    ModelValidator(models).then((errors) => {
      setErrors(errors);
    });
    const added = getAddedElement(initialModels, models);
    setSchemaEditorData((s) => ({
      ...s,
      addedFieldIds: added.fieldIds,
      addedModelIds: added.modelIds,
    }));
  }, [models, initialModels]);
  useEffect(() => {
    setSchemaEditorData((s) => ({
      ...s,
      allowedLevel: props.allowEditMode,
    }));
  }, [props.allowEditMode]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const selectedModel =
    selectedModelId !== null
      ? models.find((m) => m._id === selectedModelId)
      : null;
  const [openedSchemaPreview, { open: openSchema, close: closeSchema }] =
    useDisclosure(false);
  return (
    <SchemaEditorProvider value={schemaEditorData}>
      {/* <MantineProvider theme={theme} defaultColorScheme="dark"> */}
      <Modal
        opened={openedSchemaPreview}
        onClose={closeSchema}
        title="Ax Schema"
      >
        <Group
          align="start"
          style={{
            alignItems: "stretch",
          }}
          justify="space-around"
        >
          <Box>
            <Title order={3}>変更前</Title>
            <Code block>{JSON.stringify(initialModels, null, 2)}</Code>
          </Box>
          <Box>
            <Title order={3}>変更後</Title>
            <Code block>{JSON.stringify(models, null, 2)}</Code>
          </Box>
        </Group>
      </Modal>
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
            <Title order={1}>
              <i>Axcel Editor</i>
            </Title>
            <ActionIcon variant="outline" onClick={openSchema}>
              <IconCode />
            </ActionIcon>
            {props.headerLeftSection}
            <Space style={{ flexGrow: 1 }} />
            {props.headerRightSection}
            {issues ? (
              <HoverCard shadow="md">
                <HoverCard.Target>
                  <Group>
                    <Badge
                      size="xl"
                      circle
                      color={
                        issues.length > 0
                          ? issues.some((e) => e.level === "error")
                            ? "red"
                            : issues.some((e) => e.level === "warn")
                              ? "yellow"
                              : "cyan"
                          : "green"
                      }
                    >
                      {issues.length}
                    </Badge>

                    <Button
                      disabled={
                        !issues || issues.some((e) => e.level === "error")
                      }
                      onClick={() => {
                        fetch("http://localhost:8080/api/ax/migrate", {
                          method: "POST",
                          body: JSON.stringify({
                            oldCheckSum: "123",
                            schema: models,
                          }),
                        }).then((r) => {});
                      }}
                    >
                      変更を適用
                    </Button>
                  </Group>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Center>
                    <IconSearch />
                    <Title order={5}>見つかった問題</Title>
                  </Center>
                  {issues.length > 0 ? (
                    issues.map((issue) => (
                      <Notification
                        key={
                          issue.msg +
                          issue.modelId +
                          issue.fieldId +
                          issue.level
                        }
                        color={
                          issue.level === "error"
                            ? "red"
                            : issue.level === "warn"
                              ? "yellow"
                              : "cyan"
                        }
                        withCloseButton={false}
                        title={(() => {
                          const model = models.find(
                            (m) => m._id === issue.modelId,
                          );
                          const modelName =
                            model?.meta?.label ?? model?.name ?? "不明";
                          if (issue.fieldId) {
                            const field = model?.fields.find(
                              (f) => f._id === issue.fieldId,
                            );
                            return `${modelName} > ${
                              field?.meta?.label ?? field?.name ?? "不明"
                            }`;
                          }
                          return modelName;
                        })()}
                        onClick={() => {
                          setSelectedModelId(issue.modelId);
                        }}
                      >
                        {issue.msg}
                        <Text size="xs">{issue.description}</Text>
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
            <Title order={3}>テーブル</Title>
          </AppShell.Section>
          <AppShell.Section>
            <Stack my={"md"} gap={"sm"}>
              {models.map((model) => (
                <Button
                  key={model._id}
                  fullWidth
                  variant={selectedModelId === model._id ? "outline" : "subtle"}
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
                  meta: {
                    label: `新しいテーブル ${id.slice(0, 4)}`,
                    computedStyles: [],
                  },
                  name: `NewTable_${id.slice(0, 4)}`,
                  fields: [],
                };
                setModels([...models, m]);
                setSelectedModelId(m._id);
              }}
              {...injectProps(schemaEditorData, "add")}
            >
              テーブルを追加
            </Button>
          </AppShell.Section>
        </AppShell.Navbar>
        <AppShell.Main>
          {selectedModel && (
            <ModelEditor
              model={selectedModel}
              schema={models}
              onSave={(model) => {
                if (model === null) {
                  setModels((models) =>
                    models.filter((m) => m._id !== selectedModelId),
                  );
                  return;
                }
                setModels((models) =>
                  models.map((m) => (m._id === model._id ? model : m)),
                );
              }}
            />
          )}
        </AppShell.Main>
      </AppShell>
      {/* </MantineProvider> */}
    </SchemaEditorProvider>
  );
}

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
export default AxEditor;
