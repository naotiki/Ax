import { DefaultValueProviders, type ModelType } from "lib";
import {
  Title,
  Group,
  Button, TextInput,
  Menu,
  Card,
  Text,
  Container, ActionIcon,
  Popover, Space
} from "@mantine/core";
import { useState } from "react";
import {
  IconCirclesRelation,
  IconEdit,
  IconId,
  IconLink,
  IconPlus, IconSort09,
  IconTrash
} from "@tabler/icons-react";
import { FieldEditor } from "./FieldEditor";
import { RelationEditor } from "./RelationEditor";
import { nanoid } from "nanoid";
type ModelEditorProps = {
  model: ModelType;
  models: ModelType[];
  onSave: (model: ModelType) => void;
};
export function ModelEditor({ model, models, onSave }: ModelEditorProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField = selectedFieldId !== null
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
          }} />
        <TextInput
          size="xl"
          label="表示名"
          placeholder="表示名"
          value={model.meta.label}
          onChange={(e) => {
            onSave({ ...model, meta: { ...model.meta, label: e.currentTarget.value } });
          }} />
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
                            (field) => field._id !== f._id
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
                      meta: {
                        label: `新しいフィールド ${id.slice(0, 4)}`,
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
                      meta: {
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
                      meta: {
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
                      meta: {
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
              fields: model.fields.map((field) => field._id === f._id ? f : field
              ),
            });
          }} />
      )}
      {selectedField && selectedField.fieldType === "relation" && (
        <RelationEditor
          otherModels={models.filter((m) => m._id !== model._id)}
          field={selectedField}
          onSave={(f) => {
            onSave({
              ...model,
              fields: model.fields.map((field) => field._id === f._id ? f : field
              ),
            });
          }} />
      )}
    </Group>
  );
}
