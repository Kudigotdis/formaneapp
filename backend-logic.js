import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import firebaseConfig from './firebase-config.js';
import { generateHierarchyPath } from './path-utils.js';
import { WirogMediaCache } from './media-cache.js';

// ==========================================
// 1. FIREBASE INITIALIZATION (v10+ Modular)
// ==========================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ==========================================
// 2. ZERO-BUDGET CLOUD SYNC (P350 ONBOARDING)
// ==========================================
/**
 * Syncs new business onboarding data to Firestore and Firebase Storage.
 * Integrates with generateHierarchyPath and mediaCache for P350 Hierarchy.
 */
export async function syncBusinessOnboarding(businessData) {
  // Enforce Production Mode Rule: Auth must not be null
  if (!auth.currentUser) {
    throw new Error("Access Denied: User must be authenticated to sync business data.");
  }

  const userId = auth.currentUser.uid; 

  // TASK 2: P350 Hierarchy Integration
  // Generate a standardized path for the business logo
  const logoPath = generateHierarchyPath(
    businessData.category || 'misc',
    businessData.subCategory || 'general',
    businessData.name || 'unnamed-biz',
    'logo.png'
  );

  let logoUrl = null;

  // 1. Upload to Firebase Storage (Cloud Backup)
  if (businessData.logoFile instanceof Blob) {
    try {
      const storageRef = ref(storage, logoPath);
      await uploadBytes(storageRef, businessData.logoFile);
      logoUrl = await getDownloadURL(storageRef);
      console.log("☁️ Logo uploaded to Cloud Storage:", logoUrl);
    } catch (e) {
      console.error("Cloud Storage Upload Failed:", e);
    }

    // 2. Cache locally to IndexedDB for offline-first speed
    try {
      await WirogMediaCache.put(logoPath, businessData.logoFile);
      console.log("📍 Logo cached locally at:", logoPath);
    } catch (e) {
      console.warn("Local cache failed, falling back to cloud URL.");
    }
  }

  // Format payload for Firestore
  const payload = {
    ...businessData,
    logoPath: logoPath,    // The internal P350 hierarchy path
    logoUrl: logoUrl,      // The public cloud URL
    onboardedBy: userId,
    status: 'pending_approval', 
    timestamp: serverTimestamp()
  };

  // Remove the physical file blobs from payload before Firestore upload
  delete payload.logoFile;
  delete payload.bannerFile;

  try {
    const docRef = await addDoc(collection(db, 'businesses'), payload);
    console.log("✅ Business Onboarding Synced. Doc ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Cloud Sync Failed:", error);
    throw error;
  }
}

// Expose to window for legacy scripts (index.html, account.js)
window.syncBusinessOnboarding = syncBusinessOnboarding;

// ==========================================
// 3. ADMIN APPROVAL QUEUE (INDEXEDDB WRAPPER)
// ==========================================
export const ApprovalQueueDB = {
  dbName: 'wirog-admin-queue',
  dbVersion: 1,
  storeName: 'approvalQueue',
  dbInstance: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.dbInstance = request.result;
        resolve(this.dbInstance);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'localId', autoIncrement: true });
        }
      };
    });
  },

  async addPending(data) {
    if (!this.dbInstance) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.dbInstance.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      data.localCreatedAt = Date.now();
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllPending() {
    if (!this.dbInstance) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.dbInstance.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async removePending(localId) {
    if (!this.dbInstance) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.dbInstance.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(localId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// ==========================================
// 4. ROBUST ACCOUNT DELETION (HUSTLER LOGIC)
// ==========================================
export async function deleteAccount() {
  console.warn("Initiating robust account deletion...");

  localStorage.clear();
  sessionStorage.clear();

  if (window.UserState && typeof window.UserState.clear === 'function') {
    window.UserState.clear();
  }

  if (window.WirogDB && window.WirogDB.db) {
    window.WirogDB.db.close();
  }
  if (ApprovalQueueDB.dbInstance) {
    ApprovalQueueDB.dbInstance.close();
  }

  const databasesToWipe = ['wirog-supply-solutions', 'wirog-admin-queue', 'wirog-sync'];
  
  const deletePromises = databasesToWipe.map(dbName => {
    return new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve(); 
    });
  });

  await Promise.all(deletePromises);
  window.location.replace('/');
}

// ==========================================
// 5. ADMIN FIRESTORE UTILITIES
// ==========================================

/**
 * Fetches all businesses with 'pending_approval' status.
 */
export async function fetchPendingOnboarding() {
  const q = query(collection(db, 'businesses'), where('status', '==', 'pending_approval'));
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
}

/**
 * Approves a pending business onboarding.
 */
export async function approveOnboarding(docId) {
  const docRef = doc(db, 'businesses', docId);
  await updateDoc(docRef, {
    status: 'active',
    approvedAt: serverTimestamp(),
    approvedBy: auth.currentUser?.uid || 'system'
  });
  console.log(`✅ Business ${docId} approved and active!`);
  return true;
}

/**
 * Increments KPI metrics (views, interactions) for a business.
 */
export async function recordInteraction(bizId, type = 'views') {
  if (!bizId || bizId.startsWith('biz_sample')) return; // Skip for demo data
  
  const docRef = doc(db, 'businesses', bizId);
  await updateDoc(docRef, {
    [`kpi.${type}`]: increment(1)
  });
}

/**
 * Fetches a business by its owner's UID.
 */
export async function fetchUserBusiness(uid) {
  const q = query(collection(db, 'businesses'), where('ownerId', '==', uid));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  return null;
}

// Expose to window
window.fetchPendingOnboarding = fetchPendingOnboarding;
window.approveOnboarding = approveOnboarding;
window.recordInteraction = recordInteraction;
window.fetchUserBusiness = fetchUserBusiness;
