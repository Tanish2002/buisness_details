import { asString, generateCsv, mkConfig } from "export-to-csv";
import { getAllCompanies } from "~/utils/company_details.server";

export async function loader() {
  const companies = await getAllCompanies();
  const finalJSON = companies.map((company) => {
    return {
      company_name: company.company_name,
      contacts: company.contacts
        .map(c => `${c.name} (${c.email}, ${c.mobile_no})`)
        .join("; "),
      address: company.address,
      requirements: company.requirements.join(", "),
      other_requirements: company.other_requirements,
      remarks: company.remarks,
      urgent: company.urgent,
      card_images: company.card_images?.image_url
        ? company.card_images.image_url.join("\n")
        : null,
    };
  });

  const csvConfig = mkConfig({
    columnHeaders: [
      { key: "company_name", displayLabel: "Company Name" },
      { key: "contacts", displayLabel: "Contacts" },
      { key: "address", displayLabel: "Address" },
      { key: "requirements", displayLabel: "Machine Requirements" },
      { key: "other_requirements", displayLabel: "Other Requirements" },
      { key: "remarks", displayLabel: "Remarks" },
      { key: "urgent", displayLabel: "Urgent" },
      { key: "card_images", displayLabel: "Card Image URLs" },
    ],
  });

  const csv = generateCsv(csvConfig)(finalJSON);
  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  return new Response(csvBuffer, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="customer-details.csv"',
    },
  });
}
