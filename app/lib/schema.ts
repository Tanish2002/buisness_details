import { integer, pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const customerDetails = pgTable("customer_details", {
  id: serial("id").primaryKey(),
  company_name: text("company_name").notNull(),
  address: text("address").notNull(),
  requirements: text("requirements").array().notNull(),
  other_requirements: text("other_requirements").notNull(),
  remarks: text("remarks").notNull(),
  urgent: boolean("urgent").notNull(),
  createdAt: timestamp("createdat").defaultNow().notNull(), // Added column
});

export const companyContacts = pgTable("company_contacts", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").references(() => customerDetails.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  mobile_no: text("mobile_no").notNull(),
});

export const companyCardImages = pgTable("company_card_images", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").references(() => customerDetails.id),
  image_url: text("image_url").array(),
});

// Relations for customerDetails
export const customerRelations = relations(customerDetails, ({ many, one }) => ({
  contacts: many(companyContacts),
  card_images: one(companyCardImages),
}));

// Add relations for companyContacts
export const contactsRelations = relations(companyContacts, ({ one }) => ({
  customer: one(customerDetails, {
    fields: [companyContacts.customer_id],
    references: [customerDetails.id],
  }),
}));

// Add relations for companyCardImages
export const cardImagesRelations = relations(companyCardImages, ({ one }) => ({
  customer: one(customerDetails, {
    fields: [companyCardImages.customer_id],
    references: [customerDetails.id],
  }),
}));
