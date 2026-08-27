/**
 * custom lesson-progress routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/lesson-progresses/my-progress',
      handler: 'api::lesson-progress.lesson-progress.myProgress',
      config: {
        auth: {
          scope: ['api::lesson-progress.lesson-progress.find'],
        },
      },
    },
  ],
};