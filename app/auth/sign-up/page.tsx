import AuthPage from "@/components/auth-page";
import PageWrapper from "@/components/page-wrapper";
import React from "react";

function Page() {
	return (
		<PageWrapper>
			<AuthPage actionText={"Sign up"} redirectPath={"/dashboard/chat"} />
		</PageWrapper>
	);
}

export default Page;
