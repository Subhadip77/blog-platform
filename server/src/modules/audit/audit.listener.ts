import { activityBus } from '../../common/events/activity';
import { AuditLogModel } from './audit.model';

export function registerAuditListener() {
  activityBus.onActivity((e) => {
    // Fire and forget: a failed audit write must never break the user's request.
    AuditLogModel.create({
      action: e.action,
      actor: e.actorId,
      targetType: e.targetType,
      targetId: e.targetId,
      requestId: e.requestId,
      ip: e.ip,
      userAgent: e.userAgent,
      meta: e.meta,
    }).catch((err) => console.error('audit write failed', err)); // becomes pino later
  });
}