import { useQuery } from "@tanstack/react-query";
import { buildApi } from "~/lib/api-builder";
import { useToast } from "~/providers/toast-provider";
import { Button } from "@mui/material";
import { TITLE } from "~/constants";

const getScheduleListApi = buildApi({ path: '/schedules', method: 'GET' });

export default function Home() {
  const { showToast } = useToast();

  const { data: scheduleList, error: scheduleListError, isLoading: scheduleListLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi(), staleTime: Infinity });

  return (
    <div className="home-container w-full h-full flex justify-center items-center">
      <span className="text-2xl font-bold leo-green-text">{TITLE.kor}</span>
      <span className="text-2xl font-bold leo-brown-text">&nbsp;{TITLE.eng}</span>
    </div>
  );
}