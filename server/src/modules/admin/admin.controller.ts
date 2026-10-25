import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/apiResponse';
import { adminService } from './admin.service';
import type { AdminListPostsQuery, AuditQuery, ListUsersQuery } from './admin.schema';

const actor = (req: Request) => req.user!;
const id = (req: Request) => req.params.id as string;

export const adminController = {
  async stats(_req: Request, res: Response) {
    sendSuccess(res, await adminService.stats());
  },
  async listUsers(req: Request, res: Response) {
    const { items, meta } = await adminService.listUsers(req.query as unknown as ListUsersQuery);
    sendSuccess(res, items, { meta });
  },
  async changeRole(req: Request, res: Response) {
    sendSuccess(res, await adminService.changeRole(actor(req), id(req), req.body.role));
  },
  async setStatus(req: Request, res: Response) {
    sendSuccess(res, await adminService.setStatus(actor(req), id(req), req.body.isActive));
  },
  async listPosts(req: Request, res: Response) {
    const { items, meta } = await adminService.listPosts(req.query as unknown as AdminListPostsQuery);
    sendSuccess(res, items, { meta });
  },
  async restorePost(req: Request, res: Response) {
    sendSuccess(res, await adminService.restorePost(actor(req), id(req)));
  },
  async listComments(req: Request, res: Response) {
    const { items, meta } = await adminService.listComments(
      req.query as unknown as { page: number; limit: number },
    );
    sendSuccess(res, items, { meta });
  },
  async listAuditLogs(req: Request, res: Response) {
    const { items, meta } = await adminService.listAuditLogs(req.query as unknown as AuditQuery);
    sendSuccess(res, items, { meta });
  },
};