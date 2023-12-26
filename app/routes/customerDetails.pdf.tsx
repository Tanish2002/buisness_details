import { readFileSync } from "fs";
import { PDFDocument, PDFImage } from "pdf-lib";
import { getAllCompanies } from "~/utils/company_details.server";
export async function loader() {
  const companies = await getAllCompanies();
  const fileContents = readFileSync(`./public/buisness_details.pdf`);

  const pdfDoc = await PDFDocument.create();

  for (const company of companies) {
    const companyDoc = await PDFDocument.load(fileContents);
    const form = companyDoc.getForm();
    const setFormField = (fieldName: string, value: string) => {
      const field = form.getTextField(fieldName);
      field.setText(value);
    };
    setFormField("company", company.company_name);
    setFormField("name", company.name);
    setFormField("email", company.email);
    setFormField("address", company.address);
    setFormField("mobile", company.mobile_no);

    for (const requirement of company.requirements) {
      const checkbox = form.getCheckBox(requirement);
      checkbox.check();
    }
    const checkbox = form.getCheckBox("Other");
    checkbox.check();
    setFormField("Other Value", company.other_requirements);

    const [page] = await pdfDoc.copyPages(companyDoc, [0]);
    pdfDoc.addPage(page);

    if (
      company.card_images.image_url &&
      company.card_images.image_url.length !== 0
    ) {
      const cardPage = companyDoc.addPage();
      const xPosition = 0;
      let yPosition = cardPage.getSize().height - cardPage.getSize().height / 5;
      for (const image of company.card_images.image_url) {
        const res = await fetch(image).then((res) => res.arrayBuffer());
        const extension = getImageExtension(res);

        let pdf_image: PDFImage;
        if (extension === "jpeg") {
          pdf_image = await companyDoc.embedJpg(res);
        } else if (extension === "png") {
          pdf_image = await companyDoc.embedPng(res);
        }
        cardPage.drawImage(pdf_image!, {
          x: xPosition,
          y: yPosition,
          height: cardPage.getSize().height / 5,
          width: cardPage.getSize().width,
        });
        yPosition -= cardPage.getSize().height / 5;
      }
      const [page] = await pdfDoc.copyPages(companyDoc, [1]);
      pdfDoc.addPage(page);
    }
  }
  const pdf = await pdfDoc.save();
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
function getImageExtension(arrayBuffer: ArrayBuffer) {
  const uint8arr = new Uint8Array(arrayBuffer);

  const len = 4;
  if (uint8arr.length >= len) {
    let signatureArr = new Array(len);
    for (let i = 0; i < len; i++)
      signatureArr[i] = new Uint8Array(arrayBuffer)[i].toString(16);
    const signature = signatureArr.join("").toUpperCase();

    switch (signature) {
      case "89504E47":
        return "png";
      case "FFD8FFDB":
      case "FFD8FFE0":
        return "jpeg";
      default:
        return null;
    }
  }
  return null;
}
