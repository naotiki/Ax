import { Group, Stack, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import { ColorSchemeToggle } from "~/components/ColorSchemeToggle";
import Editor from "~/generator-app/AxEditor";
export function loader(){
    return json({
        
    })
}
export default function AxEditor() {
  return (
    <>
      <Stack>
        <Editor
          initialModels={[]}
          allowEditMode="safety"
          headerLeftSection={
            <Group>
              <ColorSchemeToggle />
            </Group>
          }
        />
      </Stack>
    </>
  );
}
