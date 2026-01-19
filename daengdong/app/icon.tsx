import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Import tokens to ensure consistency - wait, importing from local file in edge can be tricky if it has dependencies. 
// tokens.ts is pure const, so it should be fine. But to be safe and simple:
const primaryColor = '#FFB74D';

export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primaryColor,
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="4" r="2" fill="currentColor" stroke="none" />
                    <circle cx="18" cy="8" r="2" fill="currentColor" stroke="none" />
                    <circle cx="20" cy="16" r="2" fill="currentColor" stroke="none" />
                    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" fill="currentColor" stroke="none" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
