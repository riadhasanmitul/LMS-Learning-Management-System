/**
 * quiz router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::quiz.quiz", {
  config: {
    find: { auth: false },
    findOne: { auth: false },
    create: { auth: false },
    update: { auth: false },
    delete: { auth: false },
  },
});
