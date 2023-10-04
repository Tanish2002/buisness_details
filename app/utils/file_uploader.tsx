import supabase from "./supabase";

export const cardUpload = async (company_name: string, file: File) => {
  const date = new Date();
  const upload = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .upload(`${company_name}/${date.getTime()}`, file, {
      upsert: false,
    });
  if (upload.error) {
    throw new Error(`Error While uploading the Image: ${upload.error.message}`);
  }
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET
    }/${company_name}/${date.getTime()}`;
};
