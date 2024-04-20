import { Group, Stack, Switch, Title, Text, Divider } from "@mantine/core";
import { json } from "@remix-run/node";
import { useState } from "react";
import { ColorSchemeToggle } from "~/components/ColorSchemeToggle";
import Editor from "~/generator-app/AxEditor";
export function loader() {
  return json({});
}
export default function AxEditor() {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Stack>
        <Editor
          initialModels={[]}
          allowEditMode={checked ? ["develop","axcelFront","add"] : ["add","axcelFront"]}
          headerLeftSection={
            <Group>
              <ColorSchemeToggle />
            </Group>
          }
          headerRightSection={
            <Group >
              {checked && (
                <Stack gap={0}>
                  <Title c={"red"} order={4}>
                    開発者モード
                  </Title>
                  <Text c={"dimmed"} size="sm">全ての変更が可能になりますが、データ損失の危険があります。</Text>
                </Stack>
              )}
              <Switch
                checked={checked}
                onChange={(event) => setChecked(event.currentTarget.checked)}
                label="開発者モード"
                description="管理者のみが利用できるモード"
                color="red"
              />
              <Divider orientation="vertical"/>
            </Group>
          }
        />
      </Stack>
    </>
  );
}
