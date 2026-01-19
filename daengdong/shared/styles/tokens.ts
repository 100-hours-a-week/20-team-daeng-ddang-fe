/**
 * Design Tokens
 * 
 * 이 파일은 프로젝트의 "단일 디자인 기준(Single Source of Truth)"입니다.
 * 모든 색상, radius, spacing 값은 이 토큰을 통해서만 사용해야 합니다.
 * 임의의 hex 값이나 px 값 사용을 지양해주세요.
 * 
 * 사용 예시:
 * import { colors, spacing, radius } from '@/shared/styles/tokens';
 * 
 * color: ${colors.gray[900]};
 * padding: ${spacing[4]}px; // 16px
 * border-radius: ${radius.md};
 */

export const colors = {
    primary: {
        500: '#FFB74D',
        600: '#FFA726',
        700: '#FB8C00',
    },
    green: {
        500: '#81C784',
        600: '#66BB6A',
    },
    blue: {
        500: '#4FC3F7',
    },
    gray: {
        900: '#212121', // Main Text
        700: '#616161', // Sub Text
        500: '#9E9E9E', // Disabled / Placeholder
        200: '#EEEEEE', // Border / Divider
        50: '#FAFAFA',  // Background
    },
    semantic: {
        success: '#66BB6A',
        warning: '#FFEE58',
        error: '#E57373',
        info: '#4FC3F7',
    },
} as const;

export const radius = {
    sm: '8px',
    md: '12px',
    lg: '20px',
    full: '999px',
} as const;

// Usage: spacing[index]
// [0, 2, 4, 8, 12, 16, 20, 24, 32, 40] - Added 0 at index 0 for convenience if needed, 
// but spec said "spacing = [2, 4, 8, 12, 16, 20, 24, 32, 40]" which is 9 elements.
// To access 16px, it's spacing[4].
export const spacing = [2, 4, 8, 12, 16, 20, 24, 32, 40] as const;
