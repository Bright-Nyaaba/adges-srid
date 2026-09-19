// One-time database seeding: if a collection is empty, the first admin to load the site
// fills it with the default/placeholder content in src/data/defaults.js, so there's
// something real to edit instead of blank pages. Runs only for signed-in editors,
// because firestore.rules only lets admins write these collections.
import { addItem, isCollectionEmpty, getDocData, setDocMerge } from './db.js';
import {
  DEFAULT_LEADERS,
  DEFAULT_GALLERY,
  DEFAULT_RESOURCES,
  DEFAULT_PROJECTS,
  DEFAULT_STORE,
  DEFAULT_FACULTY,
  DEFAULT_TEXT,
  DEFAULT_SITE_SETTINGS
} from '../data/defaults.js';

async function seedCollectionIfEmpty(name, items) {
  try {
    if (await isCollectionEmpty(name)) {
      for (const item of items) {
        if (item.id) {
          await setDocMerge(`${name}/${item.id}`, item);
        } else {
          await addItem(name, item);
        }
      }
      console.info(`[seed] populated "${name}" with ${items.length} default item(s).`);
    }
  } catch (err) {
    console.warn(`[seed] could not seed "${name}" (likely a permissions issue — safe to ignore if you're not an editor)`, err);
  }
}

export async function seedIfNeeded() {
  await seedCollectionIfEmpty('leaders', DEFAULT_LEADERS);
  await seedCollectionIfEmpty('gallery', DEFAULT_GALLERY);
  await seedCollectionIfEmpty('resources', DEFAULT_RESOURCES);
  await seedCollectionIfEmpty('projects', DEFAULT_PROJECTS);
  await seedCollectionIfEmpty('store', DEFAULT_STORE);
  await seedCollectionIfEmpty('faculty', DEFAULT_FACULTY);
  try {
    const existing = await getDocData('site/content');
    if (!existing) {
      await setDocMerge('site/content', DEFAULT_TEXT);
      console.info('[seed] populated "site/content" with default text.');
    }
  } catch (err) {
    console.warn('[seed] could not seed "site/content"', err);
  }
  try {
    const existingSettings = await getDocData('site/settings');
    if (!existingSettings) {
      await setDocMerge('site/settings', DEFAULT_SITE_SETTINGS);
      console.info('[seed] populated "site/settings" with default site settings.');
    }
  } catch (err) {
    console.warn('[seed] could not seed "site/settings"', err);
  }
  try {
    const adminDoc = await getDocData('meta/admins');
    if (!adminDoc) {
      await setDocMerge('meta/admins', { emails: ['nyaababright93@gmail.com'] });
      console.info('[seed] initialized "meta/admins" allowlist with owner email.');
    }
  } catch (err) {
    console.warn('[seed] could not initialize "meta/admins"', err);
  }
}
