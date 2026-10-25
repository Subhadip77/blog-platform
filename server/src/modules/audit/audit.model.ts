import { Schema, model, type InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' }, // empty for failed logins with an unknown email
    targetType: { type: String },
    targetId: { type: String },
    requestId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }, // audit rows are append-only
);

auditLogSchema.index({ createdAt: -1 }); // "latest activity" in the admin panel
auditLogSchema.index({ actor: 1, createdAt: -1 }); // "what did this user do"
auditLogSchema.index({ action: 1, createdAt: -1 }); // "all failed logins"

export type AuditLog = InferSchemaType<typeof auditLogSchema>;
export const AuditLogModel = model('AuditLog', auditLogSchema);