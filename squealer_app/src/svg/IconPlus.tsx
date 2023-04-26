
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
	return (
	  <svg
		viewBox="0 0 24 24"
		fill="currentColor"
		height="1em"
		width="1em"
		{...props}
	  >
		<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
	  </svg>
	);
  }
  
  export default IconPlus;