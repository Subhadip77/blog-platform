import { EventEmitter } from 'node:events';
import { getRequestContext } from '../context/requestContext';

export type ActivityAction =
  | 'user.registered'
  | 'user.login'
  | 'user.login_failed'
  | 'user.logout'
  | 'auth.token_reuse_detected'
  | 'post.created'
  | 'post.updated'
  | 'post.deleted'
  | 'comment.created'
  | 'comment.updated'
  | 'comment.deleted';

export interface ActivityEvent {
  action: ActivityAction;
  actorId?: string;
  targetType?: 'user' | 'post' | 'comment' | 'session';
  targetId?: string;
  meta?: Record<string, unknown>;
}

export interface ActivityRecord extends ActivityEvent {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

const bus = new EventEmitter();

export const activityBus = {
  // Services call this. The request context is attached automatically.
  emit(event: ActivityEvent) {
    const record: ActivityRecord = { ...event, ...getRequestContext() };
    bus.emit('activity', record);
  },
  onActivity(handler: (record: ActivityRecord) => void) {
    bus.on('activity', handler);
  },
};