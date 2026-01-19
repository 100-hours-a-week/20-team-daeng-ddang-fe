"use client";

import { Header } from "@/widgets/Header/Header";
import { useRouter } from "next/navigation";
import { useLoadingStore } from "@/shared/store/useLoadingStore";

export default function GlobalLoadingTestPage() {
    const { showLoading, hideLoading } = useLoadingStore();
    const router = useRouter();

    return (
        <div>
            <Header title="산책하기" showBackButton={false} />
            <button onClick={() => router.push("/login")}>로그인하기</button>
            <div
                style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                <h1>Global Loading Test</h1>

                <button
                    onClick={() => showLoading("산책 결과를 불러오는 중이에요… 🐕")}
                >
                    로딩 시작 (메시지 있음)
                </button>

                <button onClick={() => showLoading()}>로딩 시작 (메시지 없음)</button>

                <button onClick={() => hideLoading()} style={{ marginTop: 16 }}>
                    로딩 종료
                </button>

                <p style={{ marginTop: 24, color: "#666", fontSize: 14 }}>
                    로딩 중에는 화면이 어두워지고 터치가 막혀야 합니다.
                    <br />
                    스피너는 화면 중앙에 고정되어야 합니다.
                </p>
            </div>
        </div>
    );
}
