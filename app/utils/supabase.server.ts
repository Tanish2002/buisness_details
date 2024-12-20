import {
  UploadHandler,
} from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseUploadHandler = ({
  supabaseUrl,
  supabaseKey,
  bucket,
}: {
  supabaseUrl: string;
  supabaseKey: string;
  bucket: string;
}): UploadHandler => {
  const supabase = createClient(supabaseUrl, supabaseKey);

  return async ({ name, contentType, data, filename }) => {
    // Skip if not a file or no filename
    if (!filename) {
      const chunks = [];
      for await (const chunk of data) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString();
    }

    // Create a buffer from the incoming stream
    const chunks = [];
    for await (const chunk of data) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Generate unique filename using timestamp
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}-${filename}`;

    // Upload to Supabase
    const { error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFilename, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading to Supabase: ${error.message}`);
    }

    // Return the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFilename);

    return publicUrl;
  };
};
