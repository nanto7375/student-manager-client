import React from "react";
import { Button } from "@mui/material";
import { AppleTg } from "~/components/typography";
import type { ActivityStatus } from "../activity-records.type";

type ActivityRecordButtonProps = {
  status: ActivityStatus;
  label: string;
  onClick: () => void;
  activeEffect?: boolean;
};

const STATUS_BG: Record<ActivityStatus, string> = {
  pending: 'transparent',
  completed: 'rgba(123, 171, 130, 0.75)',
  failed: 'grey.500',
};

export const ActivityRecordButton = ({ status, label, onClick, activeEffect = false }: ActivityRecordButtonProps) => (
  <Button
    variant="contained"
    size="small"
    disableRipple
    sx={{ minWidth: 0, px: 1, py: 0, width: '100%', height: '100%', borderRadius: 0, boxShadow: 'none', backgroundColor: STATUS_BG[status], color: status === 'pending' ? 'black' : 'white', cursor: 'default', '&:hover': { boxShadow: 'none', backgroundColor: STATUS_BG[status] }, ...(activeEffect && { transition: 'transform 0.15s, opacity 0.15s', '&:active': { transform: 'scale(0.9)', opacity: 0.8 } }) }}
    onClick={onClick}
  >
    <AppleTg sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{label}</AppleTg>
  </Button>
);
