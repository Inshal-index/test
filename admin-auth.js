const authPage = document.getElementById("admin-auth");
const loginPanel = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("admin-login-form");
const loginButton = loginForm.querySelector("button[type='submit']");
const loginError = document.getElementById("login-error");
let firebase;
let firebaseReady = false;
let editorLoaded = false;

const setLoginError = (message) => {
    loginError.textContent = message;
};

const describeAuthError = (error) => {
    if (error?.code?.startsWith("auth/api-key-not-valid")) {
        return "Firebase rejected the API key. Update firebase.js with the current web app config from Firebase Console.";
    }
    return error.message;
};

const describeAdminProfileError = (error) => {
    if (!navigator.onLine ||
        ["unavailable", "deadline-exceeded", "network-request-failed"].includes(error?.code)) {
        return "Could not reach Firestore to load this account's admin role. Check your internet connection and try again.";
    }
    return describeAuthError(error);
};

const showLogin = () => {
    authPage.hidden = false;
    loginPanel.hidden = false;
    adminPanel.hidden = true;
    document.body.dataset.admin = "false";
    delete document.body.dataset.adminTeacher;
    delete document.body.dataset.adminRole;
};

const showAdmin = (profile) => {
    authPage.hidden = true;
    adminPanel.hidden = false;
    document.body.dataset.admin = "true";
    document.body.dataset.adminTeacher = profile.teacher || "";
    document.body.dataset.adminRole = profile.role;
    document.getElementById("admin-role-label").textContent = profile.teacher
        ? `${profile.teacher} — edit own classes only`
        : "Super admin — edit every class";
    document.getElementById("reset-schedule").hidden = profile.role !== "super";

    if (editorLoaded) {
        return;
    }
    editorLoaded = true;
    const editorUrl = new URL("./schedule.js", window.location.href);
    import(editorUrl.href).catch((error) => {
        editorLoaded = false;
        document.getElementById("schedule-status").textContent = window.location.protocol === "file:"
            ? "This page is opened as a file, which blocks the schedule editor. Run start-local-server.ps1 " +
              "from this folder and open http://127.0.0.1:8765/admin.html, or use the deployed HTTPS site."
            : `Could not load the schedule editor from ${editorUrl.pathname}: ${error.message}. ` +
              "Make sure schedule.js is in the same folder, then refresh the page.";
    });
};

const handleAuthenticatedUser = async (user) => {
    if (!user) {
        showLogin();
        return;
    }

    try {
        const profileSnapshot = await firebase.getDoc(
            firebase.doc(firebase.db, "admins", user.uid)
        );
        if (!profileSnapshot.exists()) {
            setLoginError(
                "This Firebase account has no admin role assigned. Ask the project owner to configure it."
            );
            await signOutAfterError();
            return;
        }

        const profile = profileSnapshot.data();
        const isSuperAdmin = profile.role === "super";
        const isTeacher = profile.role === "teacher" &&
            typeof profile.teacher === "string" &&
            profile.teacher.trim() !== "";
        if (!isSuperAdmin && !isTeacher) {
            throw new Error("The Firebase admin profile has an invalid role.");
        }

        setLoginError("");
        loginForm.reset();
        showAdmin(profile);
    } catch (error) {
        console.error("Could not load admin role:", error.message);
        setLoginError(`Could not load this account's admin role: ${describeAdminProfileError(error)}`);
        await signOutAfterError();
    }
};

const signOutAfterError = async () => {
    try {
        await firebase.signOut(firebase.auth);
    } catch (error) {
        setLoginError(`${loginError.textContent} Could not sign out: ${describeAuthError(error)}`);
    }
};

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoginError("");
    if (!firebaseReady || !firebase?.auth || !firebase.signInWithEmailAndPassword) {
        setLoginError("Firebase Authentication is still loading or unavailable. Refresh the page and try again.");
        return;
    }

    loginButton.disabled = true;

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
        await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
    } catch (error) {
        setLoginError(`Could not sign in: ${describeAuthError(error)}`);
        loginButton.disabled = false;
    }
});

document.getElementById("logout-admin").addEventListener("click", async () => {
    try {
        await firebase.signOut(firebase.auth);
        loginForm.reset();
        setLoginError("");
    } catch (error) {
        document.getElementById("schedule-status").textContent =
            `Could not log out of Firebase: ${describeAuthError(error)}`;
    }
});

loginButton.disabled = true;
import("./firebase.js").then((firebaseModule) => {
    firebase = firebaseModule;
    if (!firebase.auth || !firebase.signInWithEmailAndPassword || !firebase.onAuthStateChanged) {
        throw new Error("The Firebase Authentication module did not initialize correctly.");
    }
    firebaseReady = true;
    loginButton.disabled = false;
    firebase.onAuthStateChanged(firebase.auth, (user) => {
        handleAuthenticatedUser(user);
    });
}).catch((error) => {
    setLoginError(`Could not connect to Firebase Authentication: ${error.message}`);
});
