
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './FirebaseService';

// Collection references
const usersCollection = 'users';
const tripsCollection = 'trips';
const placesCollection = 'places';
const reviewsCollection = 'reviews';
const translationsCollection = 'translations';
const routesCollection = 'routes';

// User profile operations
export const createUserProfile = async (userId: string, userData: any) => {
  await setDoc(doc(db, usersCollection, userId), {
    ...userData,
    createdAt: new Date()
  });
};

export const getUserProfile = async (userId: string) => {
  const userDoc = await getDoc(doc(db, usersCollection, userId));
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateUserProfile = async (userId: string, data: any) => {
  await updateDoc(doc(db, usersCollection, userId), data);
};

// Trip operations
export const createTrip = async (userId: string, tripData: any) => {
  const tripRef = await addDoc(collection(db, tripsCollection), {
    userId,
    ...tripData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return tripRef.id;
};

export const getUserTrips = async (userId: string) => {
  const q = query(
    collection(db, tripsCollection), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const trips: any[] = [];
  querySnapshot.forEach((doc) => {
    trips.push({ id: doc.id, ...doc.data() });
  });
  return trips;
};

export const getTripById = async (tripId: string) => {
  const tripDoc = await getDoc(doc(db, tripsCollection, tripId));
  return tripDoc.exists() ? { id: tripDoc.id, ...tripDoc.data() } : null;
};

export const updateTrip = async (tripId: string, data: any) => {
  await updateDoc(doc(db, tripsCollection, tripId), {
    ...data,
    updatedAt: new Date()
  });
};

export const deleteTrip = async (tripId: string) => {
  await deleteDoc(doc(db, tripsCollection, tripId));
};

// Places/Destinations operations
export const saveFavoritePlace = async (userId: string, placeData: any) => {
  const placeRef = await addDoc(collection(db, placesCollection), {
    userId,
    ...placeData,
    createdAt: new Date()
  });
  return placeRef.id;
};

export const getUserFavoritePlaces = async (userId: string) => {
  const q = query(
    collection(db, placesCollection), 
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  const places: any[] = [];
  querySnapshot.forEach((doc) => {
    places.push({ id: doc.id, ...doc.data() });
  });
  return places;
};

export const deleteFavoritePlace = async (placeId: string) => {
  await deleteDoc(doc(db, placesCollection, placeId));
};

// Reviews operations
export const addPlaceReview = async (userId: string, placeId: string, reviewData: any) => {
  const reviewRef = await addDoc(collection(db, reviewsCollection), {
    userId,
    placeId,
    ...reviewData,
    createdAt: new Date()
  });
  return reviewRef.id;
};

export const getPlaceReviews = async (placeId: string) => {
  const q = query(
    collection(db, reviewsCollection), 
    where("placeId", "==", placeId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const reviews: any[] = [];
  querySnapshot.forEach((doc) => {
    reviews.push({ id: doc.id, ...doc.data() });
  });
  return reviews;
};

// Translation operations
export const saveTranslation = async (userId: string, translationData: any) => {
  const translationRef = await addDoc(collection(db, translationsCollection), {
    userId,
    ...translationData,
    createdAt: new Date()
  });
  return translationRef.id;
};

export const getUserTranslations = async (userId: string) => {
  const q = query(
    collection(db, translationsCollection), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const translations: any[] = [];
  querySnapshot.forEach((doc) => {
    translations.push({ id: doc.id, ...doc.data() });
  });
  return translations;
};

// Route operations
export const saveRoute = async (userId: string, routeData: any) => {
  const routeRef = await addDoc(collection(db, routesCollection), {
    userId,
    ...routeData,
    createdAt: new Date()
  });
  return routeRef.id;
};

export const getUserRoutes = async (userId: string) => {
  const q = query(
    collection(db, routesCollection), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const routes: any[] = [];
  querySnapshot.forEach((doc) => {
    routes.push({ id: doc.id, ...doc.data() });
  });
  return routes;
};
