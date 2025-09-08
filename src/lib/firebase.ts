
'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'gasomateec',
  appId: '1:822722875784:web:3bd2ddf1d36cd8d3072a3d',
  storageBucket: 'gasomateec.firebasestorage.app',
  apiKey: 'AIzaSyCHfQRPipSrz-82Ywcq102SjNawtuT46N4',
  authDomain: 'gasomateec.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '822722875784',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
