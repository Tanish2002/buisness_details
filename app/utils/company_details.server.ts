import { companyCardImages, customerDetails } from "~/lib/schema";
import db from "./db.server";

export async function getAllCompanies() {
  const companies = await db.query.customerDetails.findMany({
    columns: {
      name: true,
      company_name: true,
      email: true,
      address: true,
      mobile_no: true,
      requirements: true,
      other_requirements: true,
      remarks: true,
      urgent: true,
    },
    with: {
      card_images: { columns: { image_url: true } },
    },
  });
  return companies;
}

export async function getAllCompaniesCSV() {
  const companies = await db.query.customerDetails.findMany({
    with: {
      card_images: true,
    },
  });
  return companies;
}
export async function addCompany(
  customerDetail: typeof customerDetails.$inferInsert,
  card_urls: string[] | undefined
) {
  const savedDetails = await db
    .insert(customerDetails)
    .values(customerDetail)
    .returning();

  if (card_urls && card_urls.length > 0) {
    const savedCards = await db
      .insert(companyCardImages)
      .values({ customer_id: savedDetails[0].id, image_url: card_urls })
      .returning();

    return {
      customer_details: savedDetails,
      card_details: savedCards,
    };
  }

  return {
    customer_details: savedDetails,
    card_details: [],
  };
}
