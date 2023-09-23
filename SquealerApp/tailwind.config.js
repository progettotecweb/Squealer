/** @type {import('tailwindcss').Config} */
const path = require('path')

export default {
  content: [
	// dev
    path.resolve("./SquealerApp/pages/**/*.{js,ts,jsx,tsx,mdx}"),
    path.resolve("./SquealerApp/components/**/*.{js,ts,jsx,tsx,mdx}"),

	// prod
	path.resolve("./pages/**/*.{js,ts,jsx,tsx,mdx}"),
	path.resolve("./components/**/*.{js,ts,jsx,tsx,mdx}"),
  ],
    theme: {
		extend: {
			colors: {
				theme: {
					light: "#f1f1ee",
					dark: "#513312"
				},
				vintageWood: {
					50: "#e2dcca",
					100: "#d3c7a9",
					200: "#b69f71",
					300: "#9b7a47",
					400: "#845c2b",
					500: "#71471a",
					600: "#643a11",
					700: "#5b330e",
					800: "#56300e",
					900: "#533010",
				},
				amarettoSour: {
					50: "#edeadc",
					100: "#eae3ca",
					200: "#e2d3a8",
					300: "#d9c089",
					400: "#cdab6d",
					500: "#bf9655",
					600: "#ad8141",
					700: "#996c32",
					800: "#825825",
					900: "#6a451b",
				},
				darkTruffle: {
					50: "#deddda",
					100: "#cbc9c6",
					200: "#a7a4a0",
					300: "#86827e",
					400: "#6b6560",
					500: "#574e48",
					600: "#4b3f37",
					700: "#46362c",
					800: "#473124",
					900: "#4b2e1b",
				},
				greyhound: {
					50: "#ecebeb",
					100: "#e6e6e6",
					200: "#dbdbdb",
					300: "#cecece",
					400: "#c1bfbc",
					500: "#b2aca3",
					600: "#a19584",
					700: "#8e7b63",
					800: "#7b6144",
					900: "#664928",
				},
			},
		},
	},

  plugins: [],
}
