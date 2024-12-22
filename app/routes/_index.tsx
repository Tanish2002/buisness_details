import {
  type MetaFunction,
  json,
  unstable_parseMultipartFormData,
  ActionFunctionArgs,
} from "@remix-run/node";
import Navbar from "~/components/navbar";
import { z } from "zod";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { zfd } from "zod-form-data";
import { TextInput } from "~/components/text_input";
import { TextAreaInput } from "~/components/textarea_input";
import { CheckBoxInput } from "~/components/checkbox_input";
import { SubmitButton } from "~/components/submit_button";
import { addCompany } from "~/utils/company_details.server";
import { useActionData } from "@remix-run/react";
import FileInput from "~/components/file_input";
import validator from "validator";
import { createSupabaseUploadHandler } from "~/utils/supabase.server";
import { useState } from "react";
import { createDiskUploadHandler } from "~/utils/diskUpload.server";
import path from "path"

export const meta: MetaFunction = () => {
  return [
    { title: "Balaji Customer Details" },
    { name: "description", content: "Customer Details Saver" },
  ];
};
const formatValidationErrors = (error: any) => {
  if (error instanceof Error) {
    return error.message;
  }

  if ("fieldErrors" in error) {
    return Object.entries(error.fieldErrors)
      .map(([field, errors]) => {
        if (field.startsWith('contacts.')) {
          const [_, index, fieldName] = field.split('.');
          return `Contact ${parseInt(index) + 1} ${fieldName}: ${errors}`;
        }
        return `${field}: ${errors}`;
      })
      .join('\n');
  }

  return JSON.stringify(error);
};
const ContactFields = ({ index, onRemove }: { index: number; onRemove?: () => void }) => (
  <div className="border p-4 mb-4 relative">
    <h3 className="text-lg font-bold mb-4">Contact {index + 1}</h3>
    <TextInput
      name={`contacts.${index}.name`}
      label="Name"
      placeholder="Enter Name"
    />
    <TextInput
      name={`contacts.${index}.email`}
      label="Email"
      placeholder="Enter Email"
    />
    <TextInput
      name={`contacts.${index}.mobile`}
      label="Mobile No."
      placeholder="Enter Mobile No."
    />
    {index > 0 && (
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-error btn-sm absolute top-2 right-2"
      >
        Remove
      </button>
    )}
  </div>
);
export const zod_validator = withZod(
  z.object({
    contacts: z.array(z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email").optional(),
      mobile: z.string().refine(validator.isMobilePhone, { message: "Invalid mobile number" }),
    })).min(1, "At least one contact is required"),
    company: zfd.text(z.string().min(1, "Company name is required")),
    address: zfd.text(z.string().optional()),
    machine: z.optional(zfd.repeatableOfType(z.string())).optional(),
    others: zfd.text(z.string().optional()),
    remarks: zfd.text(z.string().optional()),
    cards: zfd.repeatableOfType(
      z.union([
        z.instanceof(File),
        z.string()
      ])
    ).optional(),
    urgent: zfd.checkbox({ trueValue: "urgent" }),
  }).refine(
    (schema) => {
      return (schema.machine === undefined || schema.machine.length === 0) &&
        (schema.others === undefined || schema.others === "")
        ? false
        : true;
    },
    {
      message: "Either Select a single machine or specify others",
      path: ["others", "machine"],
    }
  )
);

export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = createSupabaseUploadHandler({
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_API_KEY!,
    bucket: process.env.SUPABASE_BUCKET!,
  });

  const data = await zod_validator.validate(
    await unstable_parseMultipartFormData(request, uploadHandler)
  );
  if (data.error) return json({ success: false, error: data.error });

  // Extract contacts from form data
  const contacts = data.data.contacts.map(contact => ({
    name: contact.name,
    email: contact.email ?? "",
    mobile_no: contact.mobile,
  }));

  // Create company with contacts
  const result = await addCompany(
    {
      company_name: data.data.company ?? "",
      address: data.data.address ?? "",
      requirements: data.data.machine ?? [],
      other_requirements: data.data.others ?? "",
      remarks: data.data.remarks ?? "",
      urgent: data.data.urgent,
    },
    contacts,
    data.data.cards as string[] // URLs of uploaded files
  );

  console.log(`Added: ${JSON.stringify(result)}`);
  return json({ success: true, error: null });
}

export default function Index() {
  const [contacts, setContacts] = useState([{ id: 0 }]);

  const addContact = () => {
    setContacts([...contacts, { id: contacts.length }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };
  const data = useActionData<typeof action>();
  return (
    <>
      <Navbar />
      <div className="card">
        <ValidatedForm
          validator={zod_validator}
          method="post"
          encType="multipart/form-data"
          resetAfterSubmit
          className="card-body"
        >
          <div className="form-control">
            <TextInput
              name="company"
              label="Company Name"
              placeholder="Enter Company Name"
            />

            <TextAreaInput
              name="address"
              label="Address"
              placeholder="Enter Company Address"
            />

            {contacts.map((contact, index) => (
              <ContactFields
                key={contact.id}
                index={index}
                onRemove={index > 0 ? () => removeContact(index) : undefined}
              />
            ))}

            <button
              type="button"
              onClick={addContact}
              className="btn btn-secondary mb-4"
            >
              Add Another Contact
            </button>

            <fieldset>
              <legend className="text-2xl text-accent">
                Machine Required For:
              </legend>
              {machines.map((machine, idx) => (
                <CheckBoxInput
                  key={idx}
                  name="machine"
                  label={machine}
                  value={machine}
                />
              ))}
              <TextInput
                name="others"
                label="Others"
                placeholder="Please Specify Other"
              />
            </fieldset>
            <TextAreaInput
              name="remarks"
              label="Remarks"
              placeholder="Enter Remarks"
            />
            <CheckBoxInput name="urgent" label="Urgent" value="urgent" />
            <FileInput name="cards" label="Upload Card Images" />
          </div>
          {data && data.error && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <pre className="whitespace-pre-wrap">
                {formatValidationErrors(data.error)}
              </pre>
            </div>
          )}
          {data && data.success && (
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Details Saved!</span>
            </div>
          )}
          <SubmitButton />
        </ValidatedForm>
      </div>
    </>
  );
}

const machines: string[] = [
  "MasterBatches",
  "Filler Compound",
  "Cable Compounding",
  "Special Compound",
  "Sheet Line(PP/HDPE)",
  "Sheet Line(Eva/Poe)",
  "Recycling Extruder",
  "ABS/PET Compounding",
  "PP Vaccum Sheet Line",
  "UHMWPE Battery SZeperator Film Line",
  "Under Water Peltizer",
  "Spare for Twin Screw Extruder",
  "Biodegradable Compounding",
];
