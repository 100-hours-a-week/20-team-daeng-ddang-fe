"use client";

import styled from "@emotion/styled";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useDailyRecordsQuery } from "@/features/footprints/api/useFootprintsQuery";
import { DailyRecordItem } from "@/entities/footprints/model/types";
import Image from "next/image";
import MedicalCrossIcon from "@/shared/assets/icons/medical-cross.svg";
import WalkIcon from "@/shared/assets/icons/paw-print.svg";


import { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface RecordListSectionProps {
    selectedDate: string;
    onRecordClick: (item: DailyRecordItem) => void;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    initialRecords?: DailyRecordItem[];
}

export const RecordListSection = ({ selectedDate, onRecordClick, scrollContainerRef, initialRecords }: RecordListSectionProps) => {
    const { data: records, isLoading } = useDailyRecordsQuery(selectedDate, { initialData: initialRecords });
    const listRef = useRef<HTMLDivElement>(null);
    const [listOffset, setListOffset] = useState(0);

    const formattedDate = format(new Date(selectedDate), "M월 d일 EEEE", { locale: ko });

    useEffect(() => {
        if (listRef.current) {
            setListOffset(listRef.current.offsetTop);
        }
    }, [records]);

    const virtualizer = useVirtualizer({
        count: records?.length || 0,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 76,
        scrollMargin: listOffset,
        overscan: 3,
    });

    if (isLoading) {
        return (
            <Container>
                <Header>{formattedDate}</Header>
                <Message>기록을 불러오는 중...</Message>
            </Container>
        );
    }

    if (!records || records.length === 0) {
        return (
            <Container>
                <Header>{formattedDate}</Header>
                <EmptyState>
                    <EmptyIcon>📝</EmptyIcon>
                    <Message>이 날의 기록이 없습니다.</Message>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>{formattedDate}</Header>
            <div ref={listRef}>
                <List style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                        const record = records[virtualRow.index];
                        return (
                            <div
                                key={`${record.type}-${record.id}`}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualRow.start - listOffset}px)`,
                                }}
                            >
                                <RecordItem onClick={() => onRecordClick(record)}>
                                    <IconWrapper $type={record.type}>
                                        {record.type === 'WALK'
                                            ? <WalkIcon width={20} height={20} />
                                            : <MedicalCrossIcon width={25} height={25} />
                                        }
                                    </IconWrapper>
                                    <Info>
                                        <Title>
                                            {record.createdAt ? (
                                                <>
                                                    <TimeText $type={record.type}>{format(new Date(record.createdAt), 'a h시 mm분', { locale: ko })}</TimeText>
                                                    <span>{record.type === 'WALK' ? '산책일지' : '헬스케어'}</span>
                                                </>
                                            ) : (
                                                record.title
                                            )}
                                        </Title>
                                    </Info>
                                    {record.imageUrl && (
                                        <Thumbnail>
                                            <Image src={record.imageUrl} alt="thumbnail" width={48} height={48} style={{ objectFit: 'cover' }} />
                                        </Thumbnail>
                                    )}
                                </RecordItem>
                            </div>
                        );
                    })}
                </List>
            </div>
        </Container>
    );
};

const Container = styled.div`
    padding: ${spacing[4]}px;
    background-color: ${colors.gray[50]};
    min-height: 200px;
`;

const Header = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: ${colors.gray[800]};
    margin-bottom: ${spacing[3]}px;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[3]}px;
`;

const RecordItem = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    padding: ${spacing[3]}px;
    border-radius: ${radius.md};
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    cursor: pointer;
    transition: transform 0.1s;

    &:active {
        transform: scale(0.98);
    }
`;

const IconWrapper = styled.div<{ $type: 'WALK' | 'HEALTH' }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${({ $type }) => $type === 'WALK' ? colors.primary[300] : colors.semantic.success};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: ${spacing[3]}px;
    color: white;
`;

const Info = styled.div`
    flex: 1;
`;

const Title = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 2px;
`;



const Thumbnail = styled.div`
    width: 48px;
    height: 48px;
    border-radius: ${radius.sm};
    overflow: hidden;
    margin-left: ${spacing[3]}px;
    background-color: ${colors.gray[200]};
`;

const Message = styled.div`
    color: ${colors.gray[500]};
    font-size: 14px;
    text-align: center;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${spacing[6]}px 0;
    gap: ${spacing[2]}px;
`;

const EmptyIcon = styled.div`
    font-size: 32px;
    margin-bottom: ${spacing[2]}px;
    opacity: 0.5;
`;

const TimeText = styled.span<{ $type: 'WALK' | 'HEALTH' }>`
    font-size: 13px;
    color: ${({ $type }) => $type === 'WALK' ? colors.primary[300] : colors.semantic.success};
    font-weight: 700;
    margin-right: 6px;
`;
