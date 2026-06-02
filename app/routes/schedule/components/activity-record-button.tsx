import React from "react";
import { Button } from "@mui/material";
import { AppleTg } from "~/components/typography";

type ActivityRecordButtonProps = {
  value: boolean;
  buttonTextOn: string;
  buttonTextOff: string | React.ReactNode;
  onClick: () => void;
  mainBgColor?: string;
  disabledBgColor?: string;
  fontColor?: string;
  activeEffect?: boolean;
};

export const ActivityRecordButton = ({ value, buttonTextOn, buttonTextOff, onClick, mainBgColor = 'transparent', disabledBgColor = 'grey.500', fontColor = 'black', activeEffect = false }: ActivityRecordButtonProps) => (
  <Button
    variant="contained"
    size="small"
    disableRipple
    sx={{ minWidth: 0, px: 1, py: 0, width: '100%', height: '100%', borderRadius: 0, boxShadow: 'none', backgroundColor: value ? disabledBgColor : mainBgColor, color: fontColor, cursor: 'default', '&:hover': { boxShadow: 'none' }, ...(activeEffect && { transition: 'transform 0.15s, opacity 0.15s', '&:active': { transform: 'scale(0.9)', opacity: 0.8 } }) }}
    onClick={onClick}
  >
    <AppleTg sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{value ? buttonTextOff : buttonTextOn}</AppleTg>
  </Button>
);
