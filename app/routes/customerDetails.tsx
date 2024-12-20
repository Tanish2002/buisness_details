import { Link, json, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { getAllCompanies } from "~/utils/company_details.server";

export async function loader() {
  const companies = await getAllCompanies();
  const finalJSON = companies.map((company) => {
    return {
      ...company,
      card_images: company.card_images?.image_url
        ? company.card_images.image_url.join("\n")
        : null,
    };
  });
  return json(finalJSON);
}
const customerDetails = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar />
      <Link to="csv" className="btn border-accent" reloadDocument>
        Download CSV
      </Link>
      <Link to="pdf" className="btn border-accent" reloadDocument>
        Download PDF
      </Link>
      <div className="overflow-x-auto">
        <table className="table table-lg table-pin-rows table-pin-cols">
          <thead>
            <tr>
              <th></th>
              <td>Company Name</td>
              <td>Email</td>
              <td>Name</td>
              <td>Mobile No.</td>
              <td>Address</td>
              <td>Requirements</td>
              <td>Other Requirements</td>
              <td>Remarks</td>
              <td>Urgent</td>
              <td>Card Images</td>
            </tr>
          </thead>
          <tbody>
            {data.map((company, idx) => (
              <tr key={idx}>
                <th>{idx + 1}</th>
                <td>{company.company_name}</td>
                <td>{company.email}</td>
                <td>{company.name}</td>
                <td>{company.mobile_no}</td>
                <td>{company.address}</td>
                <td>
                  {company.requirements && company.requirements.join(", ")}
                </td>
                <td>{company.other_requirements}</td>
                <td>{company.remarks}</td>
                <td>{company.urgent}</td>
                <td>
                  {company.card_images &&
                    company.card_images.split("\n").map((url, idx) => (
                      <span key={idx}>
                        <a className="link link-success" href={url}>
                          Link {idx + 1}
                        </a>
                        {idx !== company.card_images!.split("\n").length - 1 &&
                          " "}
                      </span>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <td>Company Name</td>
              <td>Email</td>
              <td>Name</td>
              <td>Mobile No.</td>
              <td>Address</td>
              <td>Requirements</td>
              <td>Other Requirements</td>
              <td>Remarks</td>
              <td>Urgent</td>
              <td>Card Images</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default customerDetails;
