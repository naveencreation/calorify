const { withAndroidManifest } = require('@expo/config-plugins');

function modifyAndroidManifest(androidManifest) {
  const application = androidManifest.manifest?.application?.[0];
  if (!application) return androidManifest;

  const activities = application.activity;
  if (!Array.isArray(activities)) return androidManifest;

  const mainActivity = activities.find(
    (act) => act.$?.['android:name'] === '.MainActivity' || act.$?.['android:name']?.endsWith('.MainActivity')
  );

  if (!mainActivity) return androidManifest;

  if (!Array.isArray(mainActivity['intent-filter'])) {
    mainActivity['intent-filter'] = [];
  }

  const intentFilters = mainActivity['intent-filter'];

  // Check and add ACTION_SHOW_PERMISSIONS_RATIONALE
  const hasRationale = intentFilters.some((filter) =>
    filter.action?.some(
      (a) => a.$?.['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
    )
  );

  if (!hasRationale) {
    intentFilters.push({
      action: [
        {
          $: {
            'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
          },
        },
      ],
    });
  }

  // Check and add VIEW_PERMISSION_USAGE with HEALTH_PERMISSIONS category
  const hasUsage = intentFilters.some(
    (filter) =>
      filter.action?.some(
        (a) => a.$?.['android:name'] === 'android.intent.action.VIEW_PERMISSION_USAGE'
      ) &&
      filter.category?.some(
        (c) => c.$?.['android:name'] === 'android.intent.category.HEALTH_PERMISSIONS'
      )
  );

  if (!hasUsage) {
    intentFilters.push({
      action: [
        {
          $: {
            'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE',
          },
        },
      ],
      category: [
        {
          $: {
            'android:name': 'android.intent.category.HEALTH_PERMISSIONS',
          },
        },
      ],
    });
  }

  return androidManifest;
}

const withHealthConnectRationale = (config) => {
  return withAndroidManifest(config, (configWithManifest) => {
    configWithManifest.modResults = modifyAndroidManifest(configWithManifest.modResults);
    return configWithManifest;
  });
};

withHealthConnectRationale.modifyAndroidManifest = modifyAndroidManifest;

module.exports = withHealthConnectRationale;
