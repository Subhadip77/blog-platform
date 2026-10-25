import { assertCanModify } from '../../src/common/utils/permissions';
import { ForbiddenError } from '../../src/common/errors/AppError';

describe('assertCanModify', () => {
  it('allows the owner', () => {
    expect(() => assertCanModify('u1', { id: 'u1', role: 'user' })).not.toThrow();
  });
  it('allows an admin on anyone\'s resource', () => {
    expect(() => assertCanModify('u1', { id: 'u2', role: 'admin' })).not.toThrow();
  });
  it('rejects a different regular user', () => {
    expect(() => assertCanModify('u1', { id: 'u2', role: 'user' })).toThrow(ForbiddenError);
  });
});