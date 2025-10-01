import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generatedUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const storeReceipt = mutation({
  args: {
    userId: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    size: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // save receipt metadata to the database
    await ctx.db.insert("receipts", {
      userId: args.userId,
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      size: args.size,
      mimeType: args.mimeType,
      status: "pending",
      // Initialize extracted data fields as null
      merchantName: undefined,
      merchantAddress: undefined,
      merchantContact: undefined,
      transactionDate: undefined,
      transactionAmount: undefined,
      currency: undefined,
      items: [],
    });
  },
});

// function to get all receipt for a user
export const getReceipts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Only reutrn receipts for the specified user
    return await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// funtion to get a single receipt by its id
export const getReceiptById = query({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);

    //verify user had access to this receipt
    if (receipt) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const userId = identity.subject;
      if (receipt.userId !== userId) {
        throw new Error("Not authorized to access this receipt");
      }
    }
    return receipt;
  },
});

// Get a URL to download a receipt file from storage
export const getReceiptDownloadUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  }
})