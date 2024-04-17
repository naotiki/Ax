import type { AxTypes, ModelType, RelationType, ValueType } from "lib";
import { Box, Select, TextInput, Title } from "@mantine/core";
import type { FC } from "react";

type RelationEditorProps = {
  otherModels: ModelType[];
  field: RelationType;
  onSave: (field: RelationType) => void;
};
export const RelationEditor: FC<RelationEditorProps> = ({
  otherModels,
  field,
  onSave,
}: RelationEditorProps) => {
  return (
    <Box>
      <Title order={3} my={10}>
        リレーション編集
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
          onSave({ ...field, meta:{...field.meta,label: e.currentTarget.value} });
        }}
      />
      <Select
        value={field.relation.modelId}
        onChange={(value) => {
          if (value === null) return;
          const defaultRerationField = otherModels
            .find((m) => m._id === value)
            ?.fields?.find((f) => f.fieldType === "value" && f.id) as
            | ValueType<AxTypes>
            | undefined;
          onSave({
            ...field,
            relation: {
              modelId: value,
              relationFieldIds: defaultRerationField
                ? [defaultRerationField._id]
                : [],
            },
          });
        }}
        label="関連付け"
        description="関連付けるモデルを選択してください"
        allowDeselect={false}
        data={
          field.relation.modelId
            ? otherModels.map((m) => ({
                value: m._id,
                label: m.meta.label ?? m.name,
              }))
            : [
                { value: "", label: "未選択", disabled: true },
                ...otherModels.map((m) => ({
                  value: m._id,
                  label: m.meta.label ?? m.name,
                })),
              ]
        }
      />
      <Select
        value={field.relation.relationFieldIds[0]}
        onChange={(value) => {
          if (value === null) return;
          onSave({
            ...field,
            relation: {
              ...field.relation,
              relationFieldIds: [value],
            },
          });
        }}
        label="参照フィールド"
        description="モデルの特定に使われるフィールドを指定してください。フィールドはIDである必要があります。"
        allowDeselect={false}
        data={otherModels
          .find((m) => m._id === field.relation.modelId)
          ?.fields.map((f) => ({
            value: f._id,
            label: f.meta.label ?? f.name,
            disabled: f.fieldType !== "value" || !f.id /* &&!f.unique */,
          }))}
        disabled={!field.relation.modelId}
      />
      <Select
        value={field.meta.displayColumn}
        onChange={(value) => {
          onSave({
            ...field,
            meta:{
              ...field.meta,
              displayColumn: value ?? undefined,
            },
          });
        }}
        label="表示フィールド"
        description="Axcel上で表示されるフィールドです。"
        allowDeselect
        data={otherModels
          .find((m) => m._id === field.relation.modelId)
          ?.fields.map((f) => ({
            value: f._id,
            label: f.meta.label ?? f.name,
          }))}
        disabled={!field.relation.modelId}
      />
    </Box>
  );
};
