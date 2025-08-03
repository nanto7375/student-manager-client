import { useLoaderData } from "react-router";

export const clientLoader = async ({params}: {params: {scheduleId: string}}) => {
  // const schedule = await getScheduleById(params.scheduleId);
  return { schedule: {id: params.scheduleId} };
}

export default function ScheduleId() {
  const { schedule } = useLoaderData<typeof clientLoader>();
  // console.log(schedule);
  if (!schedule.id) return null;
  return (
    <div>
      <h1>{schedule.id}</h1>
    </div>
  )
}