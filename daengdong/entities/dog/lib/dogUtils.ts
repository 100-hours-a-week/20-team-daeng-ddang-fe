import dayjs from 'dayjs';

export const getAgeString = (birthDate: string | null, isBirthDateUnknown: boolean) => {
    if (isBirthDateUnknown || !birthDate) return '모름';
    const birth = dayjs(birthDate);
    const now = dayjs();
    if (birth.isAfter(now)) return '-';

    const years = now.diff(birth, 'year');
    const months = now.diff(birth, 'month') % 12;

    if (years === 0 && months === 0) return '0개월';
    if (years === 0) return `${months}개월`;
    return `${years}년 ${months}개월`;
};
