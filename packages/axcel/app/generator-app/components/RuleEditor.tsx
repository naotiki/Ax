import { NumberInput, TextInput } from "@mantine/core";
import type { RegexRule, Rules } from "ax";
import type { FC } from "react";
type RuleEditorProps = {
  rule: Rules;
  onRuleChange: (rule: Rules) => void;
};
export const RuleEditor: FC<RuleEditorProps> = ({
  rule,
  onRuleChange,
}: RuleEditorProps) => {
  const values = Object.values(rule.params);
  switch (rule.ruleName) {
    case "length": {
      return (
        <>
          <NumberInput
            label="最小文字列長"
            value={Number(values[0])}
            allowDecimal={false}
            allowNegative={false}
            onChange={(value) => {
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 0 ? value : v];
                  }),
                ),
              });
            }}
          />
          <NumberInput
            label="最大文字列長"
            value={Number(values[1])}
            allowDecimal={false}
            allowNegative={false}
            onChange={(value) => {
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 1 ? value : v];
                  }),
                ),
              });
            }}
          />
        </>
      );
    }
    case "range": {
      return (
        <>
          <NumberInput
            label="最小値"
            value={Number(values[0])}
            onChange={(value) => {
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 0 ? value : v];
                  }),
                ),
              });
            }}
          />
          <NumberInput
            label="最大値"
            value={Number(values[1])}
            onChange={(value) => {
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 1 ? value : v];
                  }),
                ),
              });
            }}
          />
        </>
      );
    }
    case "regex": {
      return (
        <>
          <TextInput
            label="パターン"
            description="正規表現でパターンを記述できます。"
            value={values[0]}
            onChange={(e) => {
              const value = e.currentTarget.value;
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 0 ? value : v];
                  }),
                ) as RegexRule["params"],
              });
            }}
          />
          <TextInput
            label="パターン名"
            description="パターンの表示名です。"
            value={values[1]}
            onChange={(e) => {
              const value = e.currentTarget.value;
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 1 ? value : v];
                  }),
                ) as RegexRule["params"],
              });
            }}
          />
          <TextInput
            label="ヒント"
            description="パターンに合致しなかった場合表示する文字列です。"
            value={values[2]}
            onChange={(e) => {
              const value = e.currentTarget.value;
              onRuleChange({
                ...rule,
                params: Object.fromEntries(
                  Object.entries(rule.params).map(([k, v], i) => {
                    return [k, i === 2 ? value : v];
                  }),
                ) as RegexRule["params"],
              });
            }}
          />
        </>
      );
    }
  }
};
