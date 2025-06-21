import AuthPage from "@/components/auth-page";
import PublicLayout from "@/components/layouts/public-layout";
import React from "react";

function Page() {
	return (
		<PublicLayout>
			<AuthPage actionText={"Sign in"} redirectPath={"/dashboard/chat"} />
		</PublicLayout>
	);
}

export default Page;
