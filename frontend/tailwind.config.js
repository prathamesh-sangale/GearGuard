/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#5E5CE6',
                    secondary: '#FF9F0A',
                    bg: '#F8F9FA',
                    sidebar: '#FFFFFF',
                    text: '#212529',
                    muted: '#6C757D',
                    border: '#DEE2E6',
                }
            },
            borderRadius: {
                'none': '0',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
            },
            borderWidth: {
                '1': '1px',
            }
        },
    },
    plugins: [],
}
