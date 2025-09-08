rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access only for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
