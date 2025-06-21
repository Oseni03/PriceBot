import { NextRequest, NextResponse } from "next/server";
import { ContactService, ContactFormData } from "@/services/contact";
import { z } from "zod";

// Validation schema for contact form data
const contactFormSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be less than 100 characters"),
	email: z.string().email("Invalid email address"),
	subject: z
		.string()
		.min(1, "Subject is required")
		.max(200, "Subject must be less than 200 characters"),
	message: z
		.string()
		.min(10, "Message must be at least 10 characters")
		.max(2000, "Message must be less than 2000 characters"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate the request body
		const validationResult = contactFormSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.errors,
				},
				{ status: 400 }
			);
		}

		const formData: ContactFormData = validationResult.data;

		// Create the contact submission
		const contact = await ContactService.createContact(formData);

		return NextResponse.json(
			{
				message: "Contact form submitted successfully",
				contact: {
					id: contact.id,
					name: contact.name,
					email: contact.email,
					subject: contact.subject,
					status: contact.status,
					createdAt: contact.createdAt,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Contact form submission error:", error);

		return NextResponse.json(
			{ error: "Failed to submit contact form. Please try again." },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		if (status) {
			// Get contacts by status
			const contacts = await ContactService.getContactsByStatus(
				status as any
			);
			return NextResponse.json({ contacts });
		} else {
			// Get all contacts
			const contacts = await ContactService.getAllContacts();
			return NextResponse.json({ contacts });
		}
	} catch (error) {
		console.error("Error fetching contacts:", error);

		return NextResponse.json(
			{ error: "Failed to fetch contact submissions" },
			{ status: 500 }
		);
	}
}
