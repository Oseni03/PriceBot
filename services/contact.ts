import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@prisma/client";

export interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export interface ContactWithId extends ContactFormData {
	id: string;
	status: ContactStatus;
	createdAt: Date;
	updatedAt: Date;
}

export class ContactService {
	/**
	 * Create a new contact form submission
	 */
	static async createContact(data: ContactFormData): Promise<ContactWithId> {
		try {
			const contact = await prisma.contact.create({
				data: {
					name: data.name,
					email: data.email,
					subject: data.subject,
					message: data.message,
				},
			});

			return contact;
		} catch (error) {
			console.error("Error creating contact:", error);
			throw new Error("Failed to submit contact form");
		}
	}

	/**
	 * Get all contact submissions (for admin use)
	 */
	static async getAllContacts(): Promise<ContactWithId[]> {
		try {
			const contacts = await prisma.contact.findMany({
				orderBy: {
					createdAt: "desc",
				},
			});

			return contacts;
		} catch (error) {
			console.error("Error fetching contacts:", error);
			throw new Error("Failed to fetch contact submissions");
		}
	}

	/**
	 * Get contact submissions by status
	 */
	static async getContactsByStatus(
		status: ContactStatus
	): Promise<ContactWithId[]> {
		try {
			const contacts = await prisma.contact.findMany({
				where: {
					status,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return contacts;
		} catch (error) {
			console.error("Error fetching contacts by status:", error);
			throw new Error("Failed to fetch contact submissions");
		}
	}

	/**
	 * Update contact status
	 */
	static async updateContactStatus(
		id: string,
		status: ContactStatus
	): Promise<ContactWithId> {
		try {
			const contact = await prisma.contact.update({
				where: { id },
				data: { status },
			});

			return contact;
		} catch (error) {
			console.error("Error updating contact status:", error);
			throw new Error("Failed to update contact status");
		}
	}

	/**
	 * Get contact by ID
	 */
	static async getContactById(id: string): Promise<ContactWithId | null> {
		try {
			const contact = await prisma.contact.findUnique({
				where: { id },
			});

			return contact;
		} catch (error) {
			console.error("Error fetching contact by ID:", error);
			throw new Error("Failed to fetch contact");
		}
	}

	/**
	 * Get contact count by status
	 */
	static async getContactCountByStatus(): Promise<
		Record<ContactStatus, number>
	> {
		try {
			const counts = await prisma.contact.groupBy({
				by: ["status"],
				_count: {
					status: true,
				},
			});

			const result = {
				PENDING: 0,
				IN_PROGRESS: 0,
				RESPONDED: 0,
				CLOSED: 0,
			};

			counts.forEach((count) => {
				result[count.status] = count._count.status;
			});

			return result;
		} catch (error) {
			console.error("Error fetching contact counts:", error);
			throw new Error("Failed to fetch contact counts");
		}
	}
}
