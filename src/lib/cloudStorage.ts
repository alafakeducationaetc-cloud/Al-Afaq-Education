import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from './firebase';
import {
  User,
  StudentProfile,
  TeacherProfile,
  Program,
  Subscription,
  ClassSession,
  AttendanceRecord,
  Activity,
  Lesson,
  NotificationItem,
  PlatformSettings,
} from '../types';

// Collection Names in Firestore
export const CLOUD_COLLECTIONS = {
  SETTINGS: 'platform_settings',
  ADMIN_PROFILE: 'admin_profile',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  PROGRAMS: 'programs',
  SUBSCRIPTIONS: 'subscriptions',
  CLASSES: 'classes',
  ATTENDANCE: 'attendance',
  ACTIVITIES: 'activities',
  LESSONS: 'lessons',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  CERTIFICATES: 'certificates',
};

// Generic save document to Cloud Firestore
export const saveCloudDoc = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    // Sanitize data: remove undefined values which Firestore rejects
    const cleanedData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, cleanedData, { merge: true });
  } catch (error) {
    console.warn(`[Firestore Cloud Storage] Error saving doc ${docId} in ${collectionName}:`, error);
  }
};

// Generic delete document from Cloud Firestore
export const deleteCloudDoc = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`[Firestore Cloud Storage] Error deleting doc ${docId} in ${collectionName}:`, error);
  }
};

// Generic fetch entire collection once
export const fetchCloudCollection = async <T>(
  collectionName: string
): Promise<T[]> => {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as T);
    });
    return items;
  } catch (error) {
    console.warn(`[Firestore Cloud Storage] Error fetching collection ${collectionName}:`, error);
    return [];
  }
};

// Real-time listener for any Firestore collection
export const subscribeToCloudCollection = <T>(
  collectionName: string,
  onUpdate: (data: T[]) => void
) => {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      snapshot => {
        const items: T[] = [];
        snapshot.forEach(docSnap => {
          items.push(docSnap.data() as T);
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      error => {
        console.warn(`[Firestore Listener Error] ${collectionName}:`, error);
      }
    );
  } catch (err) {
    console.warn(`[Firestore Subscribe Failed] ${collectionName}:`, err);
    return () => {};
  }
};

// Real-time listener for a single document
export const subscribeToCloudDoc = <T>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T) => void
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      docSnap => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as T);
        }
      },
      error => {
        console.warn(`[Firestore Doc Listener Error] ${collectionName}/${docId}:`, error);
      }
    );
  } catch (err) {
    console.warn(`[Firestore Doc Subscribe Failed] ${collectionName}/${docId}:`, err);
    return () => {};
  }
};
