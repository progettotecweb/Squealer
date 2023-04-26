import IconBxDownvote from '@/svg/IconBxDownvote'
import IconBxUpvote from '@/svg/IconBxUpvote'
import IconReply from '@/svg/IconReply'
import Image from 'next/image'
import { PageContainer } from '@/components/PageContainer/PageContainer'

const channels = [
	"Home", "§TOP 100", "§CONTROVERSIAL", "§friends"
]

const squeals = [
	{},{},{},{},{}
]

const Channels = () => {
	return (
		<header className="sticky flex overflow-x-scroll top-0 w-full bg-gray-700">
			{
				channels.map((channel, index) => {
					return (<div key={index} className="inline-block px-4 py-1 m-4 text-white bg-gray-600 rounded-xl text whitespace-nowrap">
						{channel}
					</div>)
				})
			}
		</header>

	)
}

const Squeal = () => {
	return (
		<section className="w-full rounded-xl bg-gray-800 mt-5 p-5">
			<header className="grid grid-cols-2 gap-4">
				<Image className="rounded-full" src="/profile.jpg" alt="profile" width={50} height={50} />
				<div className="">
					<h1>Username</h1>
					<h3>Time - Place</h3>
				</div>
			</header>
			<main className="my-3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit earum ut saepe vero fugiat quidem, necessitatibus sapiente. Fugiat exercitationem, voluptatibus, cum perferendis aspernatur, nesciunt eveniet odio quod in veniam neque.</main>
			<footer className="flex flex-row w-full">
				<div className="flex flex-auto">
					<IconBxUpvote />
					<IconBxDownvote />
				</div>
				<IconReply/>
			</footer>
		</section>
	)
}

export default function LandingPage() {
	return (
		<PageContainer className="w-full flex flex-col justify-center items-center">
			<Channels />
			<main className="flex flex-col items-center justify-center px-5 w-full sm:w-full md:w-6/12">
				{
					squeals.map((squeal, index) => {
						return (<Squeal key={index} />)
					})
				}
			</main>
		</PageContainer>
	)
}