const accounts = {
    "li-zhenxinang": {
        password: "li-class1402",
        teacher: "LI ZHENXINANG"
    },
    "zhang-yan": {
        password: "zhang-class5430",
        teacher: "ZHANG YAN"
    },
    "wang-sen": {
        password: "wang-class1505",
        teacher: "WANG SEN"
    },
    "lu-youxia": {
        password: "lu-aboutchina",
        teacher: "LU YOUXIA"
    },
    "peng-tao": {
        password: "peng-culturalpe",
        teacher: "PENG TAO"
    },
    "he-dong": {
        password: "he-introai1505",
        teacher: "HE DONG"
    },
    superadmin: {
        password: "iamironman",
        role: "super"
    }
};

const authPage = document.getElementById("admin-auth");
const loginPanel = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("admin-login-form");
const loginButton = loginForm.querySelector("button[type='submit']");
const sessionStorageKey = "class2-schedule-admin";
const adminAuthScriptUrl = document.currentScript?.src;
let editorLoaded = false;

const setLoginError = (message) => {
    document.getElementById("login-error").textContent = message;
};

const showLogin = () => {
    authPage.hidden = false;
    loginPanel.hidden = false;
    adminPanel.hidden = true;
    document.body.dataset.admin = "false";
    delete document.body.dataset.adminTeacher;
    delete document.body.dataset.adminRole;
};

const showAdmin = (account) => {
    authPage.hidden = true;
    adminPanel.hidden = false;
    document.body.dataset.admin = "true";
    document.body.dataset.adminTeacher = account.teacher || "";
    document.body.dataset.adminRole = account.role || "teacher";
    document.getElementById("admin-role-label").textContent = account.teacher
        ? `${account.teacher} — edit own classes only`
        : "Super admin — edit every class";
    document.getElementById("reset-schedule").hidden = account.role !== "super";

    if (editorLoaded) {
        return;
    }
    editorLoaded = true;
    const editorUrl = new URL("./schedule.js", adminAuthScriptUrl || document.baseURI);
    import(editorUrl.href).catch((error) => {
        editorLoaded = false;
        document.getElementById("schedule-status").textContent = window.location.protocol === "file:"
            ? "This page is opened as a file, which blocks the schedule editor. Run start-local-server.ps1 " +
              "from this folder and open http://127.0.0.1:8765/admin.html, or use the deployed HTTPS site."
            : `Could not load the schedule editor from ${editorUrl.pathname}: ${error.message}. ` +
              "Make sure schedule.js is in the same folder, then refresh the page.";
    });
};

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setLoginError("");

    const formData = new FormData(loginForm);
    const username = String(formData.get("username") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const account = accounts[username];

    if (!account || account.password !== password) {
        setLoginError("Incorrect login ID or password.");
        return;
    }

    try {
        sessionStorage.setItem(sessionStorageKey, username);
        showAdmin(account);
        loginForm.reset();
    } catch (error) {
        sessionStorage.removeItem(sessionStorageKey);
        showLogin();
        setLoginError(`Could not keep your login active in this tab: ${error.message}`);
    }
});

document.getElementById("logout-admin").addEventListener("click", () => {
    sessionStorage.removeItem(sessionStorageKey);
    loginForm.reset();
    setLoginError("");
    showLogin();
});

const savedUsername = sessionStorage.getItem(sessionStorageKey);
const savedAccount = savedUsername && accounts[savedUsername];

if (savedAccount) {
    showAdmin(savedAccount);
} else {
    sessionStorage.removeItem(sessionStorageKey);
    showLogin();
}
