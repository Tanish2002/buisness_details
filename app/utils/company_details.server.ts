import { companyCardImages, customerDetails } from "~/lib/schema";
import db from "./db.server";
import { cardUpload } from "./file_uploader";

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
  card_images: File[] | undefined
) {
  const savedDetails = await db
    .insert(customerDetails)
    .values(customerDetail)
    .returning();

  let card_url: string[] = [];
  if (card_images) {
    for (let card of card_images) {
      const url = await cardUpload(savedDetails[0].company_name!, card);
      card_url.push(url);
    }
  }
  const savedCards = await db
    .insert(companyCardImages)
    .values({ customer_id: savedDetails[0].id, image_url: card_url })
    .returning();
  return {
    customer_details: savedDetails,
    card_details: savedCards,
  };
}
