export default {
  routes: [
    {
      method: "GET",
      path: "/admin/users",
      handler: "api::admin.admin.users",
      config: {
        auth: {
          scope: [],
        },
      },
    },
  ],
};
