# Firebase Authentication and schedule setup

## Set up admin accounts

The admin page uses Firebase Authentication email/password sign-in. It does not create accounts from the website; a Firebase project owner must provision each account and its role.

1. In the [Firebase Console](https://console.firebase.google.com/), open project `schedule-23a60`.
2. In **Project settings > General > Your apps**, copy the current config for the web app and make sure the values in `firebase.js` match. The login will fail if the API key is invalid or belongs to another project.
3. Go to **Authentication > Sign-in method** and enable **Email/Password**.
4. Go to **Authentication > Users > Add user**. Create a user with the teacher's email and a unique password. Repeat for each teacher and the super admin.
5. Copy each user's **UID** from the Users list.
6. In **Firestore Database > Data**, create a collection named `admins`. For each account, create a document whose document ID is that user's UID:
   - Teacher: add string fields `role` = `teacher` and `teacher` = the exact schedule teacher name (for example, `ZHANG YAN`).
   - Super admin: add string field `role` = `super`.
7. Deploy the site and Firestore rules from this folder:

   ```powershell
   firebase login
   firebase deploy --only hosting,firestore:rules
   ```

Users sign in with their Firebase email address and password. The former browser login IDs are no longer credentials; use the corresponding teacher name when setting each Firestore profile. The `super` role can edit all classes and restore the default schedule.

The website only allows users with an `admins/{uid}` profile to open the editor. The rules prevent unauthenticated users and users without a profile from writing schedules or announcements. Teacher-specific edit restrictions are currently enforced by the editor UI; Firestore rules authorize writes for any provisioned admin profile, so do not treat teacher roles as a security boundary against a technically capable signed-in user.

## Shared schedule

The schedule and announcement are stored in Firestore documents `schedules/current` and `announcements/current`. Open the deployed Firebase Hosting HTTPS URL on each device; do not use a `file://` URL. For local testing on Windows, run `.\start-local-server.ps1` in PowerShell from this folder and open `http://127.0.0.1:8765/admin.html`; keep the PowerShell window open while using the site.

The first admin visit initializes missing schedule and announcement documents with the defaults. If existing browser-local schedule data exists, it is used to initialize a missing schedule document. If Firestore is not enabled or the deployed rules are out of date, the page reports the Firebase error below the schedule.

Review Firebase billing and usage limits. The schedule and announcements are readable by anyone, so do not store confidential information in them.
