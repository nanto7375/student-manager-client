import { Tabs, type TabsProps } from "@mui/material";

export const AppTabs = (props: TabsProps) => (
  <Tabs {...props} sx={{ mb: 1.5, ...props.sx }} />
);
