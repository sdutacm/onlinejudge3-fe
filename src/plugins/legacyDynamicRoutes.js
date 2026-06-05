function normalizeLegacyDynamicPath(path) {
  return typeof path === 'string' ? path.replace(/\/\$([^/]+)/g, '/:$1') : path;
}

function patchLegacyDynamicRoutes(routes) {
  routes.forEach(route => {
    route.path = normalizeLegacyDynamicPath(route.path);
    if (Array.isArray(route.routes)) {
      patchLegacyDynamicRoutes(route.routes);
    }
  });
}

module.exports = api => {
  api.modifyRoutes(routes => {
    patchLegacyDynamicRoutes(routes);
    return routes;
  });
};
