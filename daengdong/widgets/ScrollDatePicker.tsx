import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { colors, spacing } from '@/shared/styles/tokens';
import dayjs from 'dayjs';

interface ScrollDatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: string) => void;
    initialDate?: string;
    mode?: 'date' | 'yearMonth';
}

export function ScrollDatePicker({ isOpen, onClose, onConfirm, initialDate, mode = 'date' }: ScrollDatePickerProps) {
    const today = dayjs();
    const [selectedYear, setSelectedYear] = useState(initialDate ? dayjs(initialDate).year() : today.year());
    const [selectedMonth, setSelectedMonth] = useState(initialDate ? dayjs(initialDate).month() + 1 : today.month() + 1);
    const [selectedDay, setSelectedDay] = useState(initialDate ? dayjs(initialDate).date() : today.date());

    const years = Array.from({ length: today.year() - 1999 }, (_, i) => today.year() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const getDaysInMonth = (year: number, month: number) => dayjs(`${year}-${month}-01`).daysInMonth();
    const maxDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);

    const validatedDay = Math.min(selectedDay, maxDaysInMonth);

    const days = Array.from({ length: maxDaysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    const handleConfirm = () => {
        let dateStr;
        if (mode === 'yearMonth') {
            dateStr = dayjs(`${selectedYear}-${selectedMonth}-01`).format('YYYY-MM-DD');
        } else {
            dateStr = dayjs(`${selectedYear}-${selectedMonth}-${validatedDay}`).format('YYYY-MM-DD');
        }
        onConfirm(dateStr);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <Backdrop
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <Sheet
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <Header>
                            <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                            <Title>{mode === 'yearMonth' ? '캘린더 월 선택' : '생년월일 선택'}</Title>
                            <ConfirmButton type="button" onClick={handleConfirm}>확인</ConfirmButton>
                        </Header>

                        <PickerContainer>
                            <SelectionHighlight />

                            <WheelColumn
                                items={years}
                                selectedValue={selectedYear}
                                onSelect={setSelectedYear}
                                label="년"
                            />
                            <WheelColumn
                                items={months}
                                selectedValue={selectedMonth}
                                onSelect={setSelectedMonth}
                                label="월"
                            />
                            {mode === 'date' && (
                                <WheelColumn
                                    items={days}
                                    selectedValue={validatedDay}
                                    onSelect={setSelectedDay}
                                    label="일"
                                />
                            )}
                        </PickerContainer>
                    </Sheet>
                </>
            )}
        </AnimatePresence>
    );
}

interface WheelColumnProps {
    items: number[];
    selectedValue: number;
    onSelect: (val: number) => void;
    label: string;
}

function WheelColumn({ items, selectedValue, onSelect, label }: WheelColumnProps) {
    const ITEM_HEIGHT = 40;
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const index = items.indexOf(selectedValue);
            if (index !== -1) {
                containerRef.current.scrollTop = index * ITEM_HEIGHT;
            }
        }
    }, [items, selectedValue]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        if (items[index]) {
            onSelect(items[index]);
        }
    };

    return (
        <ColumnWrapper>
            <ScrollContainer
                ref={containerRef}
                onScroll={handleScroll}
            >
                <PaddingDiv />
                {items.map((item) => (
                    <Item key={item} isSelected={item === selectedValue}>
                        {item}
                    </Item>
                ))}
                <PaddingDiv />
            </ScrollContainer>
            <ColumnLabel>{label}</ColumnLabel>
        </ColumnWrapper>
    );
}

const Backdrop = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
`;

const Sheet = styled(motion.div)`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important; 
    background: white;
    border-radius: 16px;
    z-index: 101;
    width: 90%;
    max-width: 320px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${spacing[3]}px ${spacing[4]}px;
    border-bottom: 1px solid ${colors.gray[200]};
`;

const Title = styled.h2`
    font-size: 16px;
    font-weight: 600;
    color: ${colors.gray[900]};
`;

const ButtonBase = styled.button`
    font-size: 14px;
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
`;

const CancelButton = styled(ButtonBase)`
    color: ${colors.gray[700]};
`;

const ConfirmButton = styled(ButtonBase)`
    color: ${colors.primary[600]};
    font-weight: 600;
`;

const PickerContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    height: 200px;
    overflow: hidden;
    gap: 32px;
`;

const SelectionHighlight = styled.div`
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 40px;
    transform: translateY(-50%);
    background-color: ${colors.gray[50]}; // Slight highlight
    border-top: 1px solid ${colors.gray[200]};
    border-bottom: 1px solid ${colors.gray[200]};
    pointer-events: none; // Let clicks pass through
`;

const ColumnWrapper = styled.div`
    position: relative;
    width: 60px;
    height: 100%;
    display: flex;
    justify-content: center;
`;

const ScrollContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;

const PaddingDiv = styled.div`
    height: 80px; // (200px container - 40px item) / 2
`;

const Item = styled.div<{ isSelected: boolean }>`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: ${({ isSelected }) => (isSelected ? colors.gray[900] : colors.gray[500])};
    font-weight: ${({ isSelected }) => (isSelected ? '600' : '400')};
    scroll-snap-align: center;
    transition: all 0.2s;
`;

const ColumnLabel = styled.div`
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: ${colors.gray[900]};
    font-weight: 500;
    pointer-events: none;
`;
