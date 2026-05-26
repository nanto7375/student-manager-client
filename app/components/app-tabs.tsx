import { Tabs, type TabsProps } from "@mui/material";

export const AppTabs = (props: TabsProps) => (
  <Tabs {...props} sx={{ mb: 1.5, '& .Mui-selected': { color: '#555 !important', fontWeight: 600 }, ...props.sx }} />
);
