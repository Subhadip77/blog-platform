import slugify from 'slugify';
import { connectDB, disconnectDB } from '../config/db';
import { hashPassword } from '../common/utils/password';
import { UserModel } from '../modules/users/user.model';
import { PostModel } from '../modules/posts/post.model';
import { CommentModel } from '../modules/comments/comment.model';

const ADMIN = { name: 'Demo Admin', email: 'admin@demo.com', password: 'Admin@12345', role: 'admin' as const };
const USER = { name: 'Demo User', email: 'user@demo.com', password: 'User@12345', role: 'user' as const };

async function upsertUser(u: typeof ADMIN | typeof USER) {
  const existing = await UserModel.findOne({ email: u.email });
  if (existing) return existing;
  return UserModel.create({ name: u.name, email: u.email, role: u.role, passwordHash: await hashPassword(u.password) });
}

async function main() {
  if (process.env.SEED_DEMO !== 'true') {
    console.log('SEED_DEMO is not "true", skipping seed');
    return;
  }
  await connectDB();

  const admin = await upsertUser(ADMIN);
  const user = await upsertUser(USER);

  const titles = [
    'Welcome to the Blog Platform',
    'How refresh token rotation works',
    'Why soft delete beats hard delete',
    'Designing a service layer in Express',
  ];

  for (const [i, title] of titles.entries()) {
    const slug = slugify(title, { lower: true, strict: true });
    if (await PostModel.exists({ slug })) continue; // idempotent: safe to run on every start
    const post = await PostModel.create({
      title,
      slug,
      content: `${title}. This is demo content so you can try editing, deleting and commenting.\n\nSecond paragraph of sample text.`,
      author: i % 2 === 0 ? admin.id : user.id,
    });
    await CommentModel.create({ post: post.id, author: user.id, content: 'Nice post, thanks for sharing!' });
  }

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => disconnectDB());