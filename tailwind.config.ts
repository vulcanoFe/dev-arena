import type { Config } from 'tailwindcss'

export default {
	darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
			keyframes: {
				float: {
					'0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
					'20%': { opacity: '1' },
					'100%': { transform: 'translateY(-100vh) scale(1.4)', opacity: '0' },
				},
			},
			animation: {
				float: 'float 3.5s ease-in infinite',
			},
		},
  },
  plugins: [],
} satisfies Config