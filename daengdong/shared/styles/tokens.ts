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
        800: '#424242', // Sub Text (Darker)
        700: '#616161', // Sub Text
        500: '#9E9E9E', // Disabled / Placeholder
        300: '#E0E0E0', // Border (Darker)
        200: '#EEEEEE', // Border / Divider
        100: '#F5F5F5', // Background (Darker)
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

export const spacing = [2, 4, 8, 12, 16, 20, 24, 32, 40] as const;
