
import { db } from "./db";
import {
  conversions,
  type Conversion,
  type InsertConversion,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getConversions(): Promise<Conversion[]>;
  getConversion(id: number): Promise<Conversion | undefined>;
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  updateConversionStatus(id: number, status: string, message?: string, downloadUrl?: string): Promise<Conversion>;
}

export class DatabaseStorage implements IStorage {
  async getConversions(): Promise<Conversion[]> {
    return await db.select().from(conversions).orderBy(desc(conversions.createdAt));
  }

  async getConversion(id: number): Promise<Conversion | undefined> {
    const [conversion] = await db.select().from(conversions).where(eq(conversions.id, id));
    return conversion;
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const [conversion] = await db
      .insert(conversions)
      .values(insertConversion)
      .returning();
    return conversion;
  }

  async updateConversionStatus(id: number, status: string, message?: string, downloadUrl?: string): Promise<Conversion> {
    const [updated] = await db
      .update(conversions)
      .set({ 
        status, 
        message, 
        downloadUrl,
        // Update timestamp could be added here if we had an updatedAt column
      })
      .where(eq(conversions.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
