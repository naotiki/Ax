import {
  useMantineColorScheme,
  useComputedColorScheme,
  ActionIcon,
} from "@mantine/core";
import { ClientOnly } from "remix-utils/client-only";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  return (
    <ClientOnly>
      {() => {
        return (
          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
          >
            {computedColorScheme === "light" ? (
              <IconMoon stroke={1.5} />
            ) : (
              <IconSun stroke={1.5} />
            )}
          </ActionIcon>
        );
      }}
    </ClientOnly>
  );
}
