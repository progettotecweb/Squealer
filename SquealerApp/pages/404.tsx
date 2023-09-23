import PageContainer from "@/components/PageContainer"
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <PageContainer className="text-slate-50">
      <h1 className=" text-4xl">404</h1>
      <p>Oops! The page you are looking for cannot be found.</p>
      <Link href="/">Go back to homepage</Link>
    </PageContainer>
  );
};

export default NotFoundPage;