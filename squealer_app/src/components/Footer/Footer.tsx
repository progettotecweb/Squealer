import IconAccount from "@/svg/IconAccount"
import IconPlus from "@/svg/IconPlus"
import IconSearch from "@/svg/IconSearch"

export const Footer: React.FC = () => {
	return (
		<footer className="fixed bottom-0 left-0 flex flex-row items-center justify-around text-center w-full h-20 bg-gray-700">
			<IconSearch />
			<IconPlus />
			<IconAccount />
		</footer>
	)
}