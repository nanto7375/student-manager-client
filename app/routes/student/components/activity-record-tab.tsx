import React from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

import { getActivityRecordsApi } from "~/lib/api/activities.api";
import { FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";

type Props = { studentId: string };

export const ActivityRecordTab = ({ studentId }: Props) => {
  const { data: rawActivityRecords } = useQuery({
    queryKey: ['student-activities', studentId],
    queryFn: () => getActivityRecordsApi({ query: { studentId } }),
  });

  const activityRecords = React.useMemo(() => {
    if (!rawActivityRecords) return [];
    const endOfMonth = dayjs().endOf('month').format('YYYYMMDD');
    return rawActivityRecords.filter(r => r.date <= endOfMonth).sort((a, b) => b.date.localeCompare(a.date));
  }, [rawActivityRecords]);

  const grouped = React.useMemo(() =>
    (activityRecords ?? []).reduce<Record<string, typeof activityRecords>>((acc, record) => {
      const month = `${record.date.slice(0,4)}년 ${Number(record.date.slice(4,6))}월`;
      (acc[month] ??= []).push(record);
      return acc;
    }, {}),
  [activityRecords]);

  return (
    <FlexBox gap={1} sx={{ overflow: 'auto', flex: 1, minHeight: 0, flexWrap: 'wrap', alignContent: 'flex-start', alignItems: 'flex-start' }}>
      {Object.entries(grouped).map(([month, records]) => (
        <FlexBox key={month} flexDirection="column" sx={{ border: '1px solid #eee', borderRadius: '0.5rem', width: 'calc(50% - 0.5rem)' }}>
          <FlexBox padding="0.5rem 1rem" sx={{ backgroundColor: '#f5f5f5' }}>
            <AppleTg sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>{month}</AppleTg>
          </FlexBox>
          {records.map(record => (
            <FlexBox key={record.id} padding="0.5rem 1rem" sx={{ borderTop: '1px solid #eee', backgroundColor: record.isMakeup ? '#fff8e1' : 'white' }}>
              <FlexBox gap={2} alignItems="center" fullWidth justifyContent="space-between">
                <AppleTg sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {Number(record.date.slice(4,6))}/{Number(record.date.slice(6,8))}
                  {record.isMakeup && <span style={{ color: '#e65100' }}> (보강)</span>}
                </AppleTg>
                <FlexBox gap={1}>
                  {record.attendance && <AppleTg sx={{ fontSize: '0.75rem', color: '#4caf50' }}>출석</AppleTg>}
                  {record.report1 && <AppleTg sx={{ fontSize: '0.75rem', color: '#2196f3' }}>감상문</AppleTg>}
                  {record.report2 && <AppleTg sx={{ fontSize: '0.75rem', color: '#2196f3' }}>주간레오</AppleTg>}
                  {record.monthlyPreview && <AppleTg sx={{ fontSize: '0.75rem', color: '#9c27b0' }}>월간레오({record.monthlyReport ? '완료' : '개요 작성'})</AppleTg>}
                </FlexBox>
              </FlexBox>
            </FlexBox>
          ))}
        </FlexBox>
      ))}
    </FlexBox>
  );
};
