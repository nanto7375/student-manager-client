import { useQuery } from "@tanstack/react-query";
import { buildApi } from "~/lib/api-builder";
import { useToast, TOAST_TYPE } from "~/providers/toast-provider";

const getScheduleListApi = buildApi({ url: '/schedules', method: 'GET' });

export default function Home() {
  const { data: scheduleList, isLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi() });
  const { showToast } = useToast();

  if (!isLoading) console.log(scheduleList);

  const handleShowSuccessToast = () => {
    showToast('성공적으로 처리되었습니다!', TOAST_TYPE.SUCCESS);
  };

  const handleShowErrorToast = () => {
    showToast('오류가 발생했습니다.', TOAST_TYPE.ERROR);
  };

  const handleShowWarningToast = () => {
    showToast('주의가 필요합니다.', TOAST_TYPE.WARNING);
  };

  return (
    <div className="home-container p-8">
      <div className="home-header mb-6">
        <h1 className="text-3xl font-bold">Home</h1>
      </div>
      <div className="home-content">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Toast 테스트</h2>
          <div className="flex gap-4">
            <button 
              onClick={handleShowSuccessToast}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              성공 토스트
            </button>
            <button 
              onClick={handleShowErrorToast}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              에러 토스트
            </button>
            <button 
              onClick={handleShowWarningToast}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              경고 토스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}