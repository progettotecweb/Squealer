import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";

const AboutPage = async () => {
    return (
        <PageContainer>
            <main className="w-[80%]">
                <h1 className="text-2xl">About Squealer</h1>

                <p>
                    Squealer is a project built with many different
                    technologies, like:
                </p>
                <ul className=" list-none">
                    <li><CustomLink type="a" href="https://nextjs.org/" newTab>Next.js</CustomLink></li>
                    <li><CustomLink type="a" href="https://tailwindcss.com/" newTab>Tailwind css</CustomLink></li>
                    <li><CustomLink type="a" href="https://swr.vercel.app/" newTab>Vercel SWR</CustomLink></li>
                    <li><CustomLink type="a" href="https://mui.com/material-ui/" newTab>Material UI</CustomLink></li>
                </ul>

            </main>
        </PageContainer>
    );
};

export default AboutPage;
