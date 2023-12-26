import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const customerDetails = pgTable("customer_details", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company_name: text("company_name").notNull(),
  address: text("address").notNull(),
  mobile_no: text("mobile_no").notNull(),
  requirements: text("requirements").array().notNull(),
  other_requirements: text("other_requirements").notNull(),
  remarks: text("remarks").notNull(),
});

export const customerRelations = relations(customerDetails, ({ one }) => ({
  card_images: one(companyCardImages, {
    fields: [customerDetails.id],
    references: [companyCardImages.customer_id],
  }),
}));

export const companyCardImages = pgTable("company_card_images", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").references(() => customerDetails.id),
  image_url: text("image_url").array(),
});
