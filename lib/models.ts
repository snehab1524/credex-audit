// lib/models.ts
import mongoose, { Schema, model, models } from "mongoose";

// ---- Audit Model ----
const AuditItemSchema = new Schema({
  toolId: String,
  toolName: String,
  currentPlan: String,
  currentSpend: Number,
  recommendedAction: String,
  recommendedPlan: String,
  recommendedTool: String,
  monthlySavings: Number,
  annualSavings: Number,
  reason: String,
});

const AuditSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    items: [AuditItemSchema],
    totalMonthlySavings: Number,
    totalAnnualSavings: Number,
    totalCurrentSpend: Number,
    isHighSavings: Boolean,
    isAlreadyOptimal: Boolean,
    aiSummary: String,
    teamSize: Number,
    useCase: String,
    // Lead fields — kept private, not exposed on public URL
    email: String,
    companyName: String,
    role: String,
  },
  { timestamps: true }
);

// ---- Lead Model ----
const LeadSchema = new Schema(
  {
    auditId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    companyName: String,
    role: String,
    teamSize: Number,
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Audit = models.Audit || model("Audit", AuditSchema);
export const Lead = models.Lead || model("Lead", LeadSchema);
