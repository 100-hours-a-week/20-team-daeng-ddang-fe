export const colors = {
    primary: {
        50: '#FFF3E0',
        100: '#FFE0B2',
        200: '#FFCC80',
        300: '#FFB74D',
        400: '#ffa726ff',
        500: '#ffa726ff',
        600: '#ff9800ff',
        700: '#ff7043ff',
    },
    green: {
        500: '#81C784',
        600: '#66BB6A',
    },
    blue: {
        500: '#4FC3F7',
        600: '#6c90f2ff',
    },
    gray: {
        900: '#212121',
        800: '#424242',
        700: '#616161',
        600: '#757575',
        500: '#9E9E9E',
        400: '#BDBDBD',
        300: '#E0E0E0',
        200: '#EEEEEE',
        100: '#F5F5F5',
        50: '#FAFAFA',
    },
    semantic: {
        success: '#78ce7cff',
        warning: '#ffd54cff',
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

export const spacing = [2, 4, 8, 12, 16, 20, 24, 32, 40] as const;

export const zIndex = {
    header: 50,
    bottomNav: 1000,
    overlay: 1400,
    modal: 1500,
    toast: 2000,
    max: 99999,
} as const;
