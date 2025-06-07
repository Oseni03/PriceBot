import React from "react";
import { Header } from "./header";
import { Footer } from "./footer";

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Header />
			<main>{children}</main>
			<Footer />
		</>
	);
};

export default PageWrapper;
