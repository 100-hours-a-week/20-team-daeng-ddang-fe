import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import type { DailyRecordItem } from "@/entities/footprints/model/types";

const WalkIconSvg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="4" r="2" />
        <circle cx="18" cy="8" r="2" />
        <circle cx="20" cy="16" r="2" />
        <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
);

const MedicalCrossIconSvg = () => (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
    </svg>
);

interface RecordListSectionServerProps {
    selectedDate: string;
    records: DailyRecordItem[] | null;
}

const styles = {
    container: {
        padding: 16,
        backgroundColor: "#FAFAFA",
        minHeight: 200,
    },
    header: {
        fontSize: 16,
        fontWeight: 700,
        color: "#424242",
        marginBottom: 12,
    },
    list: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
    },
    recordItem: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
    },
    iconWrapperWalk: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "#FFB74D",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    iconWrapperHealth: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "#78ce7c",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    info: { flex: 1 as const },
    title: {
        fontSize: 15,
        fontWeight: 600,
        color: "#212121",
    },
    timeTextWalk: { color: "#FFB74D", fontWeight: 700, marginRight: 6, fontSize: 13 },
    timeTextHealth: { color: "#78ce7c", fontWeight: 700, marginRight: 6, fontSize: 13 },
    thumbnail: {
        width: 48,
        height: 48,
        borderRadius: 6,
        overflow: "hidden" as const,
        marginLeft: 12,
        backgroundColor: "#EEEEEE",
    },
    emptyState: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 0",
        gap: 8,
    },
    emptyIcon: { fontSize: 32, opacity: 0.5 },
    emptyMessage: { color: "#9E9E9E", fontSize: 14 },
};

export function RecordListSectionServer({ selectedDate, records }: RecordListSectionServerProps) {
    const formattedDate = format(new Date(selectedDate), "M월 d일 EEEE", { locale: ko });

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>{formattedDate}</h3>
            {!records || records.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📝</div>
                    <div style={styles.emptyMessage}>이 날의 기록이 없습니다.</div>
                </div>
            ) : (
                <div style={styles.list}>
                    {records.map((record) => {
                        const href =
                            record.type === "WALK"
                                ? `/footprints/walk/${record.id}?date=${selectedDate}`
                                : `/footprints/healthcare/${record.id}?date=${selectedDate}`;
                        return (
                            <Link
                                key={`${record.type}-${record.id}`}
                                href={href}
                                style={styles.recordItem}
                                prefetch={record.type === "WALK"}
                            >
                                <div
                                    style={
                                        record.type === "WALK"
                                            ? styles.iconWrapperWalk
                                            : styles.iconWrapperHealth
                                    }
                                >
                                    {record.type === "WALK" ? (
                                        <WalkIconSvg />
                                    ) : (
                                        <MedicalCrossIconSvg />
                                    )}
                                </div>
                                <div style={styles.info}>
                                    <div style={styles.title}>
                                        {record.createdAt ? (
                                            <>
                                                <span
                                                    style={
                                                        record.type === "WALK"
                                                            ? styles.timeTextWalk
                                                            : styles.timeTextHealth
                                                    }
                                                >
                                                    {format(new Date(record.createdAt), "a h시 mm분", {
                                                        locale: ko,
                                                    })}
                                                </span>
                                                <span>
                                                    {record.type === "WALK" ? "산책일지" : "헬스케어"}
                                                </span>
                                            </>
                                        ) : (
                                            record.title
                                        )}
                                    </div>
                                </div>
                                {record.imageUrl && (
                                    <div style={styles.thumbnail}>
                                        <Image
                                            src={record.imageUrl}
                                            alt=""
                                            width={48}
                                            height={48}
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
