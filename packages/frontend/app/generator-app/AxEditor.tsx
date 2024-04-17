
import {
  type ModelType,
  type Rules,
  type JSType,
  ModelValidator,
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import {
  IconSearch,
} from "@tabler/icons-react";
import { fieldTypesSelectData } from "./components/FieldEditor";
import { nanoid } from "nanoid";
import type { ModelValidateError } from "lib/functions/ModelValidator";
import { ModelEditor } from "./components/ModelEditor";

type EditLevel = "develop" | "safety" | "onlyAxcel"

type EditorProps = {
  headerLeftSection?: React.ReactNode;
  headerRightSection?: React.ReactNode;
  initialModels:ModelType[];
  allowEditMode:EditLevel;
}

export function AxEditor(props:EditorProps) {
  const [opened, { toggle }] = useDisclosure();
  const [models, setModels] = useState(props.initialModels);
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
      {/* <MantineProvider theme={theme} defaultColorScheme="dark"> */}
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
              <Title order={1} ><i>Axcel Editor</i></Title>
              {props.headerLeftSection}
              <Space style={{ flexGrow: 1 }} />
              {props.headerRightSection}
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
                        fetch("http://localhost:8080/api/lib/migrate", {
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
              />
            )}
          </AppShell.Main>
        </AppShell>
      {/* </MantineProvider> */}
    </>
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
