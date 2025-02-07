"use server";

import { nanoid } from "nanoid";
import prisma from "@/db";

export async function shortenUrl(url: string) {
  try {
    const code = nanoid(10);
    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: url,
        code,
      },
    });
    return { success: true, code: shortUrl.code };
  } catch (error) {
    console.error("Error shortening URL:", error);
    return { success: false, error: "Failed to shorten URL" };
  }
}
