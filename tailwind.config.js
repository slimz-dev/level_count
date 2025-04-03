/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#ff49db',
			},
			fontFamily: {
				sans: ['Helvetica', 'Arial', 'sans-serif'],
			},
			fontSize: {
				clamp: 'clamp(1rem, 5vw + 0.2rem, 3rem)',
			},
			screens: {
				xs: '420px',
			},
		},
	},
	plugins: [],
};
