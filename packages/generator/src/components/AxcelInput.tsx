import {
  Center,
  Checkbox,
  NumberInput,
  Select,
  TextInput,
} from "@mantine/core";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";
import type { LengthRule, RangeRule, AxType, DBType, ValueType } from "lib";

type AxcelInputProps = {
  field: ValueType<DBType, AxType>;
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
};
export const AxcelInput = ({
  field: { axType, ...field },
  value,
  onValueChange,
  disabled,
}: AxcelInputProps) => {
  if (axType.id === "Enum") {
    return (
      <Select
        autoFocus
        rightSectionWidth={"auto"}
        data={
             axType.entries.map((e) => ({
                value: e.value,
                label: e.label ?? e.value,
              }))
        }
        value={value ?? ""}
        onChange={(e) => onValueChange(e)}
        disabled={disabled}
        allowDeselect={false}
        placeholder={value===null ? "「空」" : undefined}
      />
    );
  }
  if (axType.id === "bool") {
    return (
      <Center>
        <Checkbox
          checked={value?.toLowerCase() === "true"}
          onChange={(e) => onValueChange(e.currentTarget.checked.toString())}
          disabled={disabled}
          description={value===null?"「空」":undefined}
        />
      </Center>
    );
  }
  if (axType.id === "date") {
    return (
      <DatePickerInput
        valueFormat="YYYY/MM/DD"
        autoFocus
        value={value ? new Date(value) : null}
        onChange={(d) => onValueChange(d?.toLocaleDateString() ?? "")}
        disabled={disabled}
        placeholder={value===null?"「空」":undefined}
      />
    );
  }
  if (axType.id === "datetime") {
    return (
      <DateTimePicker
        valueFormat="YYYY/MM/DD HH:mm"
        autoFocus
        value={value ? new Date(value) : null}
        onChange={(d) => onValueChange(d?.toLocaleString() ?? "")}
        disabled={disabled}
        placeholder={value===null?"「空」":undefined}
      />
    );
  }
  if (axType.js === "number") {
    const rule = field.rules.find((r) => r.ruleName === "range") as
      | RangeRule
      | undefined;
    return (
      <NumberInput
        autoFocus
        rightSectionWidth={"auto"}
        value={value ? Number(value) : undefined}
        min={rule?.params?.min}
        max={rule?.params?.max}
        allowDecimal={!(axType.id === "int")}
        onChange={(e) => onValueChange(e.toString())}
        disabled={disabled}
        placeholder={value===null?"「空」":undefined}
      />
    );
  }
  const rule = field.rules.find((r) => r.ruleName === "length") as
    | LengthRule
    | undefined;
  return (
    <TextInput
      autoFocus
      minLength={rule?.params?.minLength}
      maxLength={rule?.params?.maxLength}
      value={value ?? ""}
      onChange={(e) => onValueChange(e.currentTarget.value)}
      disabled={disabled}
      placeholder={value===null?"「空」":undefined}
    />
  );
};
