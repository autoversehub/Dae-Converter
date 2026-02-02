
import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  targetFormat: varchar("target_format", { length: 10 }).notNull(), // 'fbx' or 'obj'
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  message: text("message"), // Error message or status detail
  downloadUrl: text("download_url"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversionSchema = createInsertSchema(conversions).omit({ 
  id: true, 
  createdAt: true, 
  status: true, 
  downloadUrl: true,
  message: true
});

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;

export type CreateConversionRequest = {
  originalName: string;
  targetFormat: 'fbx' | 'obj';
};

export type ConversionResponse = Conversion;
