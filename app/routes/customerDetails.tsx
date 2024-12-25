import { LoaderFunction } from "@remix-run/node";
import { Link, json, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { getAllCompanies } from "~/utils/company_details.server";

export const loader: LoaderFunction = async () => {
  try {
    const companies = await getAllCompanies();

    // Transform the data to match our interface
    const transformedCompanies = companies.map(company => ({
      company_name: company.company_name,
      contacts: company.contacts,
      address: company.address,
      requirements: company.requirements,
      other_requirements: company.other_requirements,
      remarks: company.remarks,
      urgent: company.urgent,
      card_images: company.card_images || { image_url: [] },
      createdAt: company.createdAt,
    }));

    return json(transformedCompanies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Response("Error loading companies", { status: 500 });
  }
};

const TableSection = ({ companies }: { companies: any[] }) => (
  <table className="table table-lg table-pin-rows table-pin-cols">
    <thead>
      <tr>
        <th></th>
        <td>Company Name</td>
        <td>Contacts</td>
        <td>Address</td>
        <td>Requirements</td>
        <td>Other Requirements</td>
        <td>Remarks</td>
        <td>Urgent</td>
        <td>Card Images</td>
      </tr>
    </thead>
    <tbody>
      {companies.map((company: any, idx: any) => (
        <tr key={idx}>
          <th>{idx + 1}</th>
          <td>{company.company_name}</td>
          <td>
            <div className="space-y-2">
              {company.contacts.map((contact: any, contactIdx: any) => (
                <div key={contactIdx} className="p-2 bg-base-200 rounded-lg">
                  <p><strong>Name:</strong> {contact.name}</p>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Mobile:</strong> {contact.mobile_no}</p>
                </div>
              ))}
            </div>
          </td>
          <td>{company.address}</td>
          <td>
            {company.requirements && company.requirements.join(", ")}
          </td>
          <td>{company.other_requirements}</td>
          <td>{company.remarks}</td>
          <td>{company.urgent ? "Yes" : "No"}</td>
          <td>
            {company.card_images && company.card_images.image_url &&
              company.card_images.image_url.map((url: any, imgIdx: any) => (
                <span key={imgIdx}>
                  <a
                    className="link link-success"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link {imgIdx + 1}
                  </a>
                  {imgIdx !== company.card_images.image_url.length - 1 && " "}
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
        <td>Contacts</td>
        <td>Address</td>
        <td>Requirements</td>
        <td>Other Requirements</td>
        <td>Remarks</td>
        <td>Urgent</td>
        <td>Card Images</td>
      </tr>
    </tfoot>
  </table>
);

const CustomerDetails = () => {
  const data = useLoaderData<typeof loader>();

  // Group companies by date
  const groupedCompanies = data.reduce((acc: Record<string, any[]>, company) => {
    const dateString = company.createdAt.split('T')[0];
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(company);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedCompanies).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="p-4 space-y-6">
        <div className="flex gap-4">
          <Link to="csv" className="btn border-accent" reloadDocument>
            Download CSV
          </Link>
          <Link to="pdf" className="btn border-accent" reloadDocument>
            Download PDF
          </Link>
        </div>

        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date} className="space-y-4">
              <h2 className="text-2xl font-bold bg-base-200 p-4 rounded-lg">
                {formatDate(date)}
              </h2>
              <div className="overflow-x-auto">
                <TableSection companies={groupedCompanies[date]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomerDetails;
