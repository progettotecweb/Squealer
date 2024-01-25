import PageContainer from "@/components/PageContainer";
import SignUpSequence from "@/components/SignUp/SignUpSequence";

export default function Page() {
    return (
        <PageContainer className="items-center justify-center h-[80vh]">
            <SignUpSequence />
        </PageContainer>
    );
}
