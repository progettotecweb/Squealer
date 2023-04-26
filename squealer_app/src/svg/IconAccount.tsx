function IconAccount(props: React.SVGProps<SVGSVGElement>) {
	return (
	  <svg
		viewBox="0 0 24 24"
		fill="currentColor"
		height="1em"
		width="1em"
		{...props}
	  >
		<path d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
	  </svg>
	);
  }

export default IconAccount;