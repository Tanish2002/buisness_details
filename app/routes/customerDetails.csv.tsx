import { asString, generateCsv, mkConfig } from "export-to-csv";
import { getAllCompanies } from "~/utils/company_details.server";

export async function loader() {
  const companies = await getAllCompanies();
  const finalJSON = companies.map((company) => {
    return {
      ...company,
      card_images: company.card_images.image_url
        ? company.card_images.image_url.join("\n")
        : null,
    };
  });
  const csvConfig = mkConfig({
    columnHeaders: [
      { key: "name", displayLabel: "Name" },
      { key: "email", displayLabel: "Email" },
      { key: "company_name", displayLabel: "Company Name" },
      { key: "address", displayLabel: "Address" },
      { key: "mobile_no", displayLabel: "Mobile No." },
      { key: "requirements", displayLabel: "Machine Requirements" },
      { key: "other_requirements", displayLabel: "Other Requirements" },
      { key: "remarks", displayLabel: "Remarks" },
      { key: "card_images", displayLabel: "Card Image URLs" },
    ],
  });
  const csv = generateCsv(csvConfig)(finalJSON);
  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  return new Response(csvBuffer, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
    },
  });
}
