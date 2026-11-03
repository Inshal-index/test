# Firebase and teacher logins

## Logins

The site uses a simple browser-based login, not Firebase Authentication. The login IDs and predefined passwords are in `admin-auth.js`:

| Login ID | Password | Access |
| --- | --- | --- |
| `li-zhenxinang` | `li-class1402` | Edit LI ZHENXINANG's classes |
| `zhang-yan` | `zhang-class5430` | Edit ZHANG YAN's classes |
| `wang-sen` | `wang-class1505` | Edit WANG SEN's classes |
| `lu-youxia` | `lu-aboutchina` | Edit LU YOUXIA's classes |
| `peng-tao` | `peng-culturalpe` | Edit PENG TAO's classes |
| `he-dong` | `he-introai1505` | Edit HE DONG's classes |
| `superadmin` | `iamironman` | Edit all classes and restore the default schedule |

These passwords and the teacher-role checks are embedded in public JavaScript. They are convenient UI restrictions, not secure authentication; anyone can inspect or bypass them.
After login, the current tab remembers the login ID in session storage, so refreshing the page keeps the editor open. Logging out or closing the tab ends that browser session.

## Shared schedule and notifications

The schedule and announcement are saved in Firestore documents `schedules/current` and `announcements/current`. Firestore listeners update open schedule pages when another device saves a change.

The rules in `firestore.rules` allow anyone to create or update these two documents without signing in. This is necessary for cross-device editing with the browser-only passwords, but it means anyone who can reach the project can bypass the login and edit the shared schedule or notification. The rules do not enforce teacher-specific permissions.

Because schedule writes are now public, do not store confidential information in Firestore. Review Firebase billing and usage limits to reduce the risk of unexpected costs or abuse.

The editor opens after a valid browser login without waiting for Firebase. When Firebase is unavailable, edits are saved only in the current browser and will not sync to other devices.

Before deploying, make sure the Firebase project `schedule-23a60` has a Firestore database. Then install the Firebase CLI, sign in, and deploy the site and rules from this folder:

```powershell
firebase deploy --only hosting,firestore:rules
```

The included `.firebaserc` selects project `schedule-23a60`. Open the deployed Firebase Hosting URL on each device; do not use a `file://` URL, which prevents browsers from loading the schedule's JavaScript modules. For local testing on Windows, run `.\start-local-server.ps1` in PowerShell from this folder and open `http://127.0.0.1:8765/admin.html`; keep the PowerShell window open while using the site. If Firestore is not enabled or the updated rules have not been deployed, the page will report the Firebase error below the schedule.

The first admin visit initializes missing schedule and announcement documents with the defaults. If existing browser-local schedule data exists, it is used to initialize a missing schedule document.

For secure logins and server-enforced teacher permissions, replace the browser-only login with a trusted backend or Firebase Authentication and matching Firestore rules.
