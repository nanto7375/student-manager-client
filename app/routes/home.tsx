import { useQuery } from "@tanstack/react-query";
import { buildApi } from "~/lib/api-builder";

const getScheduleListApi = buildApi({ url: '/schedules', method: 'GET' });

export default function Home() {
  const { data: scheduleList, isLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi() });

  if (!isLoading) console.log(scheduleList);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Home</h1>
      </div>
      <div className="home-content">
        <h1>Home</h1>
      </div>
    </div>
  );
}