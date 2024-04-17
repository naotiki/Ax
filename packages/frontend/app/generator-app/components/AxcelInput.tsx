import {
  Center,
  Checkbox,
  NumberInput,
  Select,
  TextInput,
} from "@mantine/core";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";
import { type LengthRule, type RangeRule, type ValueType, type AxTypes, getAxTypeData, checkFieldType } from "lib";

type AxcelInputProps = {
  field: ValueType<AxTypes>;
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
};




export const AxcelInput = ({
  field,
  value,
  onValueChange,
  disabled,
}: AxcelInputProps) => {
  if (checkFieldType(field,"Enum")) {
    return (
      <Select
        autoFocus
        rightSectionWidth={"auto"}
        data={field.typeParams.entries.map((e) => ({
          value: e.value,
          label: e.meta.label ?? e.value,
        }))}
        value={value ?? ""}
        onChange={(e) => onValueChange(e)}
        disabled={disabled}
        allowDeselect={false}
        placeholder={value === null ? "「空」" : undefined}
      />
    );
  }
  if (checkFieldType(field,"bool")) {
    return (
      <Center>
        <Checkbox
          checked={value?.toLowerCase() === "true"}
          onChange={(e) => onValueChange(e.currentTarget.checked.toString())}
          disabled={disabled}
          description={value === null ? "「空」" : undefined}
        />
      </Center>
    );
  }
  if (checkFieldType(field,"date")) {
    if(field.typeParams.meta.isDateOnly){
      return (
        <DatePickerInput
          valueFormat="YYYY/MM/DD"
          autoFocus
          value={value ? new Date(value) : null}
          onChange={(d) => onValueChange(d?.toLocaleDateString() ?? "")}
          disabled={disabled}
          placeholder={value === null ? "「空」" : undefined}
        />
      );
    }
    return (
      <DateTimePicker
        valueFormat="YYYY/MM/DD HH:mm"
        autoFocus
        value={value ? new Date(value) : null}
        onChange={(d) => onValueChange(d?.toLocaleString() ?? "")}
        disabled={disabled}
        placeholder={value === null ? "「空」" : undefined}
      />
    );
  }
  if (getAxTypeData(field.axType).js === "number") {
    const rule = field.meta.rules.find((r) => r.ruleName === "range") as
      | RangeRule
      | undefined;
    return (
      <NumberInput
        autoFocus
        rightSectionWidth={"auto"}
        value={value ? Number(value) : undefined}
        min={rule?.params?.min}
        max={rule?.params?.max}
        allowDecimal={!(field.axType === "int")}
        onChange={(e) => onValueChange(e.toString())}
        disabled={disabled}
        placeholder={value === null ? "「空」" : undefined}
      />
    );
  }
  const rule = field.meta.rules.find((r) => r.ruleName === "length") as
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
      placeholder={value === null ? "「空」" : undefined}
    />
  );
};
