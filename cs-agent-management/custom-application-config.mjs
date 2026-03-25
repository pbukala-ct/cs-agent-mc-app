/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptions}
 */
const config = {
  name: 'CS Agent Management',
  entryPointUriPath: '${env:ENTRY_POINT_URI_PATH}',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    production: {
      // Connect provides CUSTOM_APPLICATION_ID and APPLICATION_URL automatically
      applicationId: '${env:CUSTOM_APPLICATION_ID}',
      url: '${env:APPLICATION_URL}',
    },
    development: {
      initialProjectKey: 'your-project-key',
    },
  },
  oAuthScopes: {
    // The MC proxy validates against the legacy scope alias "view_key_value_documents"
    // (the old name for view_custom_objects). Using the new name results in a 403
    // "insufficient_scope" even though they refer to the same CT resource.
    view: ['view_key_value_documents'],
    manage: ['manage_key_value_documents'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'CS Agents',
    labelAllLocales: [],
    permissions: [],
  },
  submenuLinks: [
    {
      uriPath: 'agents',
      defaultLabel: 'Agents',
      labelAllLocales: [],
      permissions: [],
    },
    {
      uriPath: 'audit',
      defaultLabel: 'Audit Log',
      labelAllLocales: [],
      permissions: [],
    },
  ],
};

export default config;
