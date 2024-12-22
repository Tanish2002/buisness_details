import { companyCardImages, customerDetails, companyContacts } from "~/lib/schema";
import db from "./db.server";

export async function getAllCompanies() {
  const companies = await db.query.customerDetails.findMany({
    columns: {
      company_name: true,
      address: true,
      requirements: true,
      other_requirements: true,
      remarks: true,
      urgent: true,
    },
    with: {
      contacts: true,
      card_images: true,
    },
  });
  return companies;
}

export async function addCompany(
  customerDetail: Omit<typeof customerDetails.$inferInsert, 'contacts'>,
  contacts: Array<{
    name: string;
    email: string;
    mobile_no: string;
  }>,
  card_urls: string[] | undefined
) {
  const savedDetails = await db
    .insert(customerDetails)
    .values(customerDetail)
    .returning();

  const savedContacts = await db
    .insert(companyContacts)
    .values(
      contacts.map(contact => ({
        ...contact,
        customer_id: savedDetails[0].id
      }))
    )
    .returning();

  if (card_urls && card_urls.length > 0) {
    const savedCards = await db
      .insert(companyCardImages)
      .values({ customer_id: savedDetails[0].id, image_url: card_urls })
      .returning();

    return {
      customer_details: savedDetails,
      contacts: savedContacts,
      card_details: savedCards,
    };
  }

  return {
    customer_details: savedDetails,
    contacts: savedContacts,
    card_details: [],
  };
}
