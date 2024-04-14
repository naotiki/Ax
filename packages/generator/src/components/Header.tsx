import { Container, Group, Title, Space, Text } from "@mantine/core";

export function Header() {
	return (
		<Group  gap={10} align={"center"}>
			<Title order={1} style={{}}>
				axcel.gen
			</Title>
			<Space style={{ flexGrow: 1 }} />
		</Group>
	);
}
