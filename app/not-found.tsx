import { Link } from "react-router";
import { ROUTES } from "~/constants";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link 
          to={ROUTES.HOME} 
          className="leo-green-bg rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          홈으로 돌아가기
        </Link>
        <Link 
          to={ROUTES.SIGNIN} 
          className="text-sm font-semibold text-gray-900 hover:text-gray-700"
        >
          로그인 <span aria-hidden="true">&nbsp;&rarr;</span>
        </Link>
      </div>
    </div>
  );
}