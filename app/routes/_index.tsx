import {
  type MetaFunction,
  DataFunctionArgs,
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@vercel/remix";
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

export const meta: MetaFunction = () => {
  return [
    { title: "Balaji Customer Details" },
    { name: "description", content: "Customer Details Saver" },
  ];
};

export const validator = withZod(
  z
    .object({
      name: z.string().min(1, { message: "First name is required" }),
      email: z
        .string()
        .min(1, { message: "Email is required" })
        .email("Must be valid email"),
      company: z.string().min(1, { message: "Company is required" }),
      address: z.string().min(1, { message: "Address is required" }),
      mobile: z
        .string()
        .regex(/^\d+$/, "Mobile no. should have numbers")
        .length(10, { message: "Mobile no should be 10 digits" }),
      machine: z.optional(zfd.repeatableOfType(z.string())).optional(),
      others: zfd.text(z.string().optional()),
      cards: zfd.repeatableOfType(zfd.file()),
    })
    .refine(
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

export async function action({ request }: DataFunctionArgs) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 5_000_000_000,
  });

  const data = await validator.validate(
    await unstable_parseMultipartFormData(request, uploadHandler)
  );
  if (data.error) return json({ success: false, error: data.error });
  const result = await addCompany(
    {
      name: data.data.name,
      email: data.data.email,
      address: data.data.address,
      company_name: data.data.company,
      requirements: data.data.machine,
      other_requirements: data.data.others,
      mobile_no: data.data.mobile,
    },
    data.data.cards
  );
  console.log(`Added: ${JSON.stringify(result)}`);
  return json({ success: true, error: null });
}

export default function Index() {
  const data = useActionData<typeof action>();
  return (
    <>
      <Navbar />
      <div className="card">
        <ValidatedForm
          validator={validator}
          method="post"
          encType="multipart/form-data"
          resetAfterSubmit
          className="card-body"
        >
          <div className="form-control">
            <TextInput name="name" label="Name" placeholder="Enter Your Name" />

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

            <TextInput
              name="email"
              label="Email ID"
              placeholder="Enter Email ID"
            />

            <TextInput
              name="mobile"
              label="Mobile No."
              placeholder="Enter Mobile No."
            />

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
              {(data.error instanceof Error && (
                <span>Error! {data.error.message}</span>
              )) ||
                ("fieldErrors" in data.error && (
                  <span>{`Error! ${data.error.fieldErrors}`}</span>
                ))}
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
