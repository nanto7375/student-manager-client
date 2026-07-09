import React from "react";
import { Button } from "@mui/material";
import { AppleTg } from "~/components/typography";
import type { ActivityStatus, MonthlyStatus } from "../activity-records.type";

type ActivityRecordButtonProps = {
  status: ActivityStatus;
  label: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  activeEffect?: boolean;
  monthlyStatus?: MonthlyStatus;
};

const STATUS_BG: Record<ActivityStatus, string> = {
  pending: 'transparent',
  completed: 'rgba(123, 171, 130, 0.75)',
  failed: 'grey.500',
};

const MONTHLY_STATUS_BG: Record<MonthlyStatus, string> = {
  pending: 'transparent',
  participated: 'rgba(123, 171, 130, 0.25)',
  preview: 'rgba(123, 171, 130, 0.5)',
  completed: 'rgba(123, 171, 130, 0.75)',
  failed: 'grey.500',
  none: 'grey.500',
};

const MONTHLY_STATUS_COLOR: Record<MonthlyStatus, string> = {
  pending: 'black',
  participated: 'black',
  preview: 'white',
  completed: 'white',
  failed: 'white',
  none: 'white',
};

export const ActivityRecordButton = ({ status, label, onClick, activeEffect = false, monthlyStatus }: ActivityRecordButtonProps) => {
  const bgColor = monthlyStatus ? MONTHLY_STATUS_BG[monthlyStatus] : STATUS_BG[status];
  const textColor = monthlyStatus ? MONTHLY_STATUS_COLOR[monthlyStatus] : (status === 'pending' ? 'black' : 'white');

  return (
    <Button
      variant="contained"
      size="small"
      disableRipple
      sx={{ minWidth: 0, px: 1, py: 0, width: '100%', height: '100%', borderRadius: 0, boxShadow: 'none', backgroundColor: bgColor, color: textColor, cursor: 'default', '&:hover': { boxShadow: 'none', backgroundColor: bgColor }, ...(activeEffect && { transition: 'transform 0.15s, opacity 0.15s', '&:active': { transform: 'scale(0.9)', opacity: 0.8 } }) }}
      onClick={onClick}
    >
      <AppleTg sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{label}</AppleTg>
    </Button>
  );
};
