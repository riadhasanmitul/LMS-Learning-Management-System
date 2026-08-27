export default {
  routes: [
    {
      method: "GET",
      path: "/admin-dashboard/stats",
      handler: "admin-dashboard.stats",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/admin-dashboard/users",
      handler: "admin-dashboard.users",
      config: {
        auth: {},
      },
    },
    {
      method: "PUT",
      path: "/admin-dashboard/users/:documentId/role",
      handler: "admin-dashboard.assignRole",
      config: {
        auth: {},
      },
    },
    {
      method: "PUT",
      path: "/admin-dashboard/users/:documentId/block",
      handler: "admin-dashboard.blockUser",
      config: {
        auth: {},
      },
    },
    {
      method: "PUT",
      path: "/admin-dashboard/users/:documentId/unblock",
      handler: "admin-dashboard.unblockUser",
      config: {
        auth: {},
      },
    },
{
  method: "GET",
  path: "/current-user",
  handler: "admin-dashboard.me",
  config: {
    auth: {},
  },
},
  ],
};
