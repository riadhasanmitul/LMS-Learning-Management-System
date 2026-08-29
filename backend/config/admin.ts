import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'default-admin-jwt-secret-cps-lms'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'default-api-token-salt-cps-lms'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'default-transfer-token-salt-cps-lms'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', 'default-encryption-key-cps-lms-32'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
