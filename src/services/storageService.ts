/**
 * StorageService — abstraction over localStorage.
 * All keys are namespaced under 'sdm_v1_' to avoid collision.
 * Future: swap implementation to IndexedDB or cloud without changing callers.
 */

const NAMESPACE = 'sdm_v1_';

export const StorageKeys = {
  TASKS: `${NAMESPACE}tasks`,
  SUBJECTS: `${NAMESPACE}subjects`,
  NOTIFICATIONS: `${NAMESPACE}notifications`,
  ACTIVITIES: `${NAMESPACE}activities`,
  FOCUS_SESSIONS: `${NAMESPACE}focus_sessions`,
  ANNOUNCEMENTS: `${NAMESPACE}announcements`,
  PREFERENCES: `${NAMESPACE}preferences`,
  STUDY_PREFS: `${NAMESPACE}study_preferences`,
  EXAMS: `${NAMESPACE}exams`,
  GOALS: `${NAMESPACE}goals`,
  NOTES: `${NAMESPACE}notes`,
  RESOURCES: `${NAMESPACE}resources`,
  REVISION_TOPICS: `${NAMESPACE}revision_topics`,
  DAILY_PLANS: `${NAMESPACE}daily_plans`,
  TIMETABLE: `${NAMESPACE}timetable`,
  THEME: `${NAMESPACE}theme`,
  INITIALIZED: `${NAMESPACE}initialized`,
  // Legacy keys to remove on first run
  LEGACY: [
    'studysync_tasks', 'studysync_tasks_v2', 'studysync_tasks_v3',
    'studysync_announcements', 'studysync_announcements_v2', 'studysync_announcements_v3',
    'studysync_notifications', 'studysync_notifications_v2', 'studysync_notifications_v3',
    'studysync_activities', 'studysync_activities_v2', 'studysync_activities_v3',
    'studysync_focus', 'studysync_focus_v2', 'studysync_focus_v3',
    'studysync_preferences_v3', 'studysync_theme', 'studysync_v3_initialized'
  ]
} as const;

class StorageService {
  /**
   * Get and parse a JSON value from storage. Returns fallback on any error.
   */
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Serialize and set a value in storage. Silently ignores quota errors.
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded or private mode — ignore
    }
  }

  /**
   * Remove a key from storage.
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  /**
   * Remove multiple keys.
   */
  removeMany(keys: readonly string[]): void {
    keys.forEach(k => this.remove(k));
  }

  /**
   * Clear all app data (all sdm_v1_ keys + legacy keys).
   */
  clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(NAMESPACE) || StorageKeys.LEGACY.includes(k as never))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  /**
   * Migrate legacy keys on first run.
   */
  migrateLegacy(): void {
    try {
      if (!localStorage.getItem(StorageKeys.INITIALIZED)) {
        this.removeMany(StorageKeys.LEGACY);
        // Migrate theme if present in old key
        const oldTheme = localStorage.getItem('studysync_theme');
        if (oldTheme && ['light', 'dark', 'system'].includes(oldTheme)) {
          this.set(StorageKeys.THEME, oldTheme);
        }
        localStorage.setItem(StorageKeys.INITIALIZED, 'true');
      }
    } catch {}
  }
}

export const storage = new StorageService();
