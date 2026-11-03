# Firebase schedule setup

## Temporary public editing mode

The admin page currently opens the editor without a login. Firestore rules also allow anyone to create or update `schedules/current` and `announcements/current`. Anyone who can reach the site can change the shared timetable and announcement; this is not secure and should only be used temporarily. Do not put private information in these documents.

The local changes do not affect Firebase Hosting or deployed Firestore rules until you deploy them. To publish this version, run from this folder:

```powershell
firebase login
firebase deploy --only hosting,firestore:rules
```

To keep editing local only, run `.\start-local-server.ps1` in PowerShell and open `http://127.0.0.1:8765/admin.html`. The local server does not publish rules to Firebase. With protected rules still deployed, edits may be rejected by Firestore.

## Shared schedule

The schedule and announcement are stored in Firestore documents `schedules/current` and `announcements/current`. The schedule is stored as a JSON string because Firestore does not support nested arrays. Open the deployed Firebase Hosting HTTPS URL on each device; do not use a `file://` URL. For local testing on Windows, keep the PowerShell server window open while using the site.

The first admin visit initializes missing schedule and announcement documents with the defaults. If existing browser-local schedule data exists, it is used to initialize a missing schedule document. If Firestore is not enabled or its rules do not allow writes, the page reports the Firebase error below the schedule.

Review Firebase billing and usage limits. The schedule and announcements are readable by anyone, and public writes allow anyone to change them.

## Restore authenticated editing

Before deploying this site publicly, restore Firebase Authentication and restrictive Firestore rules. Public schedule writes are a temporary workaround, not a safe production permission model.
