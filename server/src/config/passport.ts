import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { env } from './env';
import { socialService, type SocialProfile, type SocialProvider } from '../modules/auth/social.service';

export const enabledProviders = new Set<SocialProvider>();

const callbackURL = (p: SocialProvider) => `${env.API_URL}/api/v1/auth/${p}/callback`;

type Done = (err: unknown, user?: Express.User | false) => void;

async function resolve(profile: SocialProfile, done: Done) {
  try {
    const user = await socialService.findOrCreate(profile);
    done(null, { id: user.id, role: user.role });
  } catch (err) {
    done(err);
  }
}

export function configurePassport() {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        { clientID: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, callbackURL: callbackURL('google') },
        (_at, _rt, profile, done) =>
          resolve(
            {
              provider: 'google',
              providerId: profile.id,
              email: profile.emails?.[0]?.value,
              emailVerified: profile._json.email_verified === true,
              name: profile.displayName,
            },
            done,
          ),
      ),
    );
    enabledProviders.add('google');
  }

  if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.FACEBOOK_APP_ID,
          clientSecret: env.FACEBOOK_APP_SECRET,
          callbackURL: callbackURL('facebook'),
          profileFields: ['id', 'displayName', 'emails'],
        },
        (_at, _rt, profile, done) =>
          resolve(
            {
              provider: 'facebook',
              providerId: profile.id,
              email: profile.emails?.[0]?.value,
              emailVerified: false, // we don't trust it enough to auto-link accounts
              name: profile.displayName,
            },
            done,
          ),
      ),
    );
    enabledProviders.add('facebook');
  }
}