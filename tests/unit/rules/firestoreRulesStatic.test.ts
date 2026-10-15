import fs from 'fs';
import path from 'path';

describe('Firestore Security Rules Static Analysis', () => {
  const rulesPath = path.resolve(__dirname, '../../../firestore.rules');
  let rulesContent: string;

  beforeAll(() => {
    expect(fs.existsSync(rulesPath)).toBe(true);
    rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  });

  it('strictly forbids geminiKeyObfuscated or any API key fields', () => {
    expect(rulesContent).not.toContain('geminiKeyObfuscated');
    expect(rulesContent).not.toContain('apiKey');
    expect(rulesContent).not.toContain('geminiApiKey');
  });

  it('defines the isOwner security helper function', () => {
    expect(rulesContent).toMatch(/function\s+isOwner\s*\(\s*userId\s*\)/);
    expect(rulesContent).toContain('request.auth.uid == userId');
  });

  it('enforces isOwner(userId) on users root collection', () => {
    const userMatchRegex = /match\s+\/users\/\{userId\}\s*\{[\s\S]*?allow read:\s*if\s*isOwner\(userId\);/;
    expect(rulesContent).toMatch(userMatchRegex);
  });

  it('enforces isOwner(userId) on dailyLogs subcollection', () => {
    const dailyLogsMatchRegex = /match\s+\/dailyLogs\/\{date\}\s*\{[\s\S]*?allow read:\s*if\s*isOwner\(userId\);/;
    expect(rulesContent).toMatch(dailyLogsMatchRegex);
  });

  it('enforces isOwner(userId) on customFoods subcollection', () => {
    const customFoodsMatchRegex = /match\s+\/customFoods\/\{foodId\}\s*\{[\s\S]*?allow read:\s*if\s*isOwner\(userId\);/;
    expect(rulesContent).toMatch(customFoodsMatchRegex);
  });

  it('enforces isOwner(userId) on chatHistory subcollection', () => {
    const chatHistoryMatchRegex = /match\s+\/chatHistory\/\{messageId\}\s*\{[\s\S]*?isOwner\(userId\)/;
    expect(rulesContent).toMatch(chatHistoryMatchRegex);
  });

  it('allows updatedAt and syncVersion fields in isValidDailyLogDoc', () => {
    expect(rulesContent).toContain("'updatedAt'");
    expect(rulesContent).toContain("'syncVersion'");
  });

  it('contains default deny-all fallback', () => {
    expect(rulesContent).toMatch(/match\s+\/\{document=\*\*\}\s*\{\s*allow read,\s*write:\s*if\s*false;\s*\}/);
  });
});
