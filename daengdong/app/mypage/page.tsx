import { redirect } from "next/navigation";
import { MyPage } from "@/views/mypage/MyPage";
import { getMyPageSummarySsrData } from "@/server/mypageSsr";

export default async function Page() {
  const summary = await getMyPageSummarySsrData();
  if (!summary) {
    redirect("/login");
  }

  return <MyPage initialSummaryData={summary} />;
}
