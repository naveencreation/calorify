// Unit tests for withHealthConnectRationale config plugin
const withHealthConnectRationale = require('../../../plugins/withHealthConnectRationale');

describe('withHealthConnectRationale Config Plugin', () => {
  const createMockManifest = () => ({
    manifest: {
      $: {
        'xmlns:android': 'http://schemas.android.com/apk/res/android',
        package: 'com.calorify.app',
      },
      application: [
        {
          $: {
            'android:name': '.MainApplication',
          },
          activity: [
            {
              $: {
                'android:name': '.MainActivity',
                'android:exported': 'true',
              },
              'intent-filter': [
                {
                  action: [
                    {
                      $: {
                        'android:name': 'android.intent.action.MAIN',
                      },
                    },
                  ],
                  category: [
                    {
                      $: {
                        'android:name': 'android.intent.category.LAUNCHER',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  it('adds both required Health Connect intent filters to .MainActivity', () => {
    const manifest = createMockManifest();
    const result = withHealthConnectRationale.modifyAndroidManifest(manifest);

    const activity = result.manifest.application[0].activity.find(
      (a: { $: { 'android:name': string } }) => a.$['android:name'] === '.MainActivity'
    );
    expect(activity).toBeDefined();

    const filters = activity['intent-filter'];
    expect(filters.length).toBe(3); // 1 original + 2 health connect

    const hasRationale = filters.some((f: { action?: Array<{ $: { 'android:name': string } }> }) =>
      f.action?.some(
        (a) => a.$['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
      )
    );
    expect(hasRationale).toBe(true);

    const hasUsage = filters.some(
      (f: {
        action?: Array<{ $: { 'android:name': string } }>;
        category?: Array<{ $: { 'android:name': string } }>;
      }) =>
        f.action?.some(
          (a) => a.$['android:name'] === 'android.intent.action.VIEW_PERMISSION_USAGE'
        ) &&
        f.category?.some(
          (c) => c.$['android:name'] === 'android.intent.category.HEALTH_PERMISSIONS'
        )
    );
    expect(hasUsage).toBe(true);
  });

  it('is completely idempotent and does not duplicate intent filters on repeated runs', () => {
    const manifest = createMockManifest();
    const firstPass = withHealthConnectRationale.modifyAndroidManifest(manifest);
    const secondPass = withHealthConnectRationale.modifyAndroidManifest(firstPass);
    const thirdPass = withHealthConnectRationale.modifyAndroidManifest(secondPass);

    const activity = thirdPass.manifest.application[0].activity.find(
      (a: { $: { 'android:name': string } }) => a.$['android:name'] === '.MainActivity'
    );
    const filters = activity['intent-filter'];

    const rationaleMatches = filters.filter(
      (f: { action?: Array<{ $: { 'android:name': string } }> }) =>
        f.action?.some(
          (a) => a.$['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
        )
    );
    expect(rationaleMatches.length).toBe(1);

    const usageMatches = filters.filter(
      (f: {
        action?: Array<{ $: { 'android:name': string } }>;
        category?: Array<{ $: { 'android:name': string } }>;
      }) =>
        f.action?.some(
          (a) => a.$['android:name'] === 'android.intent.action.VIEW_PERMISSION_USAGE'
        ) &&
        f.category?.some(
          (c) => c.$['android:name'] === 'android.intent.category.HEALTH_PERMISSIONS'
        )
    );
    expect(usageMatches.length).toBe(1);
    expect(filters.length).toBe(3);
  });

  it('safely handles manifest with no .MainActivity without throwing', () => {
    const emptyManifest = {
      manifest: {
        application: [
          {
            activity: [],
          },
        ],
      },
    };
    expect(() =>
      withHealthConnectRationale.modifyAndroidManifest(emptyManifest)
    ).not.toThrow();
  });
});
