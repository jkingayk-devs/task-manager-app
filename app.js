/* ==========================================================
   TaskHub App.js
   Part 1
========================================================== */

// ---------- DOM ----------

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const authModal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");

const loginUser = document.getElementById("loginUser");
const registerUser = document.getElementById("registerUser");

const withdrawBtn = document.getElementById("withdrawBtn");
const withdrawModal = document.getElementById("withdrawModal");
const closeWithdraw = document.getElementById("closeWithdraw");
const submitWithdraw = document.getElementById("submitWithdraw");

const dailyBonus = document.getElementById("dailyBonus");

// ---------- Navigation ----------

function openPage(pageName){

    pages.forEach(page=>{

        page.classList.add("hidden");
        page.classList.remove("active");

    });

    document
        .getElementById(pageName)
        .classList.remove("hidden");

    document
        .getElementById(pageName)
        .classList.add("active");

}

navLinks.forEach(link=>{

    link.onclick=()=>{

        navLinks.forEach(n=>n.classList.remove("active"));

        link.classList.add("active");

        openPage(link.dataset.page);

    }

});

// ---------- Loader ----------

window.addEventListener("load",()=>{

    setTimeout(()=>{

        document.body.classList.add("loaded");

    },800);

});

// ---------- Modal ----------

loginBtn.onclick=()=>{

    authModal.style.display="flex";

}

closeModal.onclick=()=>{

    authModal.style.display="none";

}

window.onclick=(e)=>{

    if(e.target===authModal){

        authModal.style.display="none";

    }

    if(e.target===withdrawModal){

        withdrawModal.style.display="none";

    }

}

// ---------- Withdraw ----------

withdrawBtn.onclick=()=>{

    withdrawModal.style.display="flex";

}

closeWithdraw.onclick=()=>{

    withdrawModal.style.display="none";

}

// ---------- Register ----------

registerUser.onclick=async()=>{

    const username=document.getElementById("registerName").value;

    const email=document.getElementById("registerEmail").value;

    const password=document.getElementById("registerPassword").value;

    if(username===""||email===""||password===""){

        showToast("Complete all fields");

        return;

    }

    const {data,error}=await supabase.auth.signUp({

        email,

        password

    });

    if(error){

        showToast(error.message);

        return;

    }

    await supabase
    .from("users")
    .insert({

        id:data.user.id,

        username,

        email,

        balance:0,

        coins:0,

        referrals:0,

        completed_tasks:0

    });

    showToast("Registration Successful");

    authModal.style.display="none";

}

// ---------- Login ----------

loginUser.onclick=async()=>{

    const email=document.getElementById("loginEmail").value;

    const password=document.getElementById("loginPassword").value;

    const {error}=await supabase.auth.signInWithPassword({

        email,

        password

    });

    if(error){

        showToast(error.message);

        return;

    }

    location.reload();

}

// ---------- Logout ----------

logoutBtn.onclick=async()=>{

    await signOutUser();

}

// ---------- Session ----------

async function loadSession(){

    const user=await getCurrentUser();

    if(!user){

        return;

    }

    loginBtn.style.display="none";

    openPage("dashboard");

    const profile=await getProfile(user.id);

    if(!profile){

        return;

    }

    document.getElementById("balance").innerText=
    "£"+Number(profile.balance).toFixed(2);

    document.getElementById("walletBalance").innerText=
    "£"+Number(profile.balance).toFixed(2);

    document.getElementById("coins").innerText=
    profile.coins;

    document.getElementById("profileCoins").innerText=
    profile.coins;

    document.getElementById("profileBalance").innerText=
    "£"+Number(profile.balance).toFixed(2);

    document.getElementById("profileName").innerText=
    profile.username;

    document.getElementById("profileEmail").innerText=
    profile.email;

    document.getElementById("profileReferrals").innerText=
    profile.referrals;

    document.getElementById("completedTasks").innerText=
    profile.completed_tasks;

}
/* ==========================================================
   TaskHub App.js
   Part 2
   Tasks • Daily Bonus • Withdraw • Referral
========================================================== */

// ---------- Daily Bonus ----------

dailyBonus.onclick = async () => {

    if (!currentUser || !userData) {
        showToast("Please login first");
        return;
    }

    const reward = 50;

    userData.coins += reward;

    await supabase
        .from("users")
        .update({
            coins: userData.coins
        })
        .eq("id", currentUser.id);

    document.getElementById("coins").innerText = userData.coins;
    document.getElementById("profileCoins").innerText = userData.coins;

    showToast("Daily bonus claimed (+50 Coins)");

};

// ---------- Task Buttons ----------

document.querySelectorAll(".taskBtn").forEach((button) => {

    button.onclick = async () => {

        if (!currentUser || !userData) {
            showToast("Please login first");
            return;
        }

        userData.coins += 100;
        userData.completed_tasks += 1;

        await supabase
            .from("users")
            .update({
                coins: userData.coins,
                completed_tasks: userData.completed_tasks
            })
            .eq("id", currentUser.id);

        document.getElementById("coins").innerText = userData.coins;
        document.getElementById("profileCoins").innerText = userData.coins;
        document.getElementById("completedTasks").innerText = userData.completed_tasks;

        showToast("+100 Coins");

    };

});

// ---------- Referral ----------

function generateReferral() {

    if (!currentUser) return;

    const link =
        window.location.origin +
        window.location.pathname +
        "?ref=" +
        currentUser.id;

    const input = document.getElementById("referralLink");

    if (input) {
        input.value = link;
    }

}

const copyBtn = document.getElementById("copyReferralBtn");

if (copyBtn) {

    copyBtn.onclick = async () => {

        const input = document.getElementById("referralLink");

        await navigator.clipboard.writeText(input.value);

        showToast("Referral link copied");

    };

}

generateReferral();

// ---------- Withdraw ----------

submitWithdraw.onclick = async () => {

    if (!currentUser || !userData) {
        showToast("Please login first");
        return;
    }

    const amount =
        Number(document.getElementById("withdrawAmount").value);

    const method =
        document.getElementById("withdrawMethod").value;

    const account =
        document.getElementById("withdrawAccount").value;

    if (!amount || amount <= 0) {

        showToast("Enter amount");

        return;

    }

    if (amount > Number(userData.balance)) {

        showToast("Insufficient balance");

        return;

    }

    if (account.trim() === "") {

        showToast("Enter payment account");

        return;

    }

    const { error } = await supabase
        .from("withdraws")
        .insert({

            userid: currentUser.id,

            amount: amount,

            method: method,

            account: account,

            status: "Pending"

        });

    if (error) {

        showToast(error.message);

        return;

    }

    showToast("Withdraw request submitted");

    withdrawModal.style.display = "none";

    document.getElementById("withdrawAmount").value = "";
    document.getElementById("withdrawAccount").value = "";

};

// ---------- Update Balance ----------

function refreshUI() {

    if (!userData) return;

    document.getElementById("balance").innerText =
        "£" + Number(userData.balance).toFixed(2);

    document.getElementById("walletBalance").innerText =
        "£" + Number(userData.balance).toFixed(2);

    document.getElementById("coins").innerText =
        userData.coins;

    document.getElementById("profileCoins").innerText =
        userData.coins;

}

refreshUI();
loadSession();
/* ==========================================================
   TaskHub App.js
   Part 3
   General Website Logic
========================================================== */

// ---------- Utility ----------

function $(id){
    return document.getElementById(id);
}

function setText(id,value){
    const el=$(id);
    if(el) el.innerText=value;
}

function setValue(id,value){
    const el=$(id);
    if(el) el.value=value;
}

// ---------- Update Dashboard ----------

function updateDashboard(){

    if(!userData) return;

    setText(
        "profileName",
        userData.username || "User"
    );

    setText(
        "profileEmail",
        userData.email || ""
    );

    setText(
        "coins",
        userData.coins || 0
    );

    setText(
        "profileCoins",
        userData.coins || 0
    );

    setText(
        "profileReferrals",
        userData.referrals || 0
    );

    setText(
        "completedTasks",
        userData.completed_tasks || 0
    );

    const balance =
        Number(userData.balance || 0).toFixed(2);

    setText("balance","£"+balance);
    setText("walletBalance","£"+balance);
    setText("profileBalance","£"+balance);

}

// ---------- Profile ----------

async function reloadProfile(){

    if(!currentUser) return;

    const profile =
    await getProfile(currentUser.id);

    if(!profile) return;

    userData = profile;

    updateDashboard();

}

// ---------- Demo Counters ----------

function animateCounter(id,target){

    const el=$(id);

    if(!el) return;

    let value=0;

    const speed=Math.max(
        1,
        Math.floor(target/60)
    );

    const timer=setInterval(()=>{

        value+=speed;

        if(value>=target){

            value=target;

            clearInterval(timer);

        }

        el.innerText=value;

    },20);

}

window.addEventListener("load",()=>{

    animateCounter("totalUsers",1532);

    animateCounter("totalTasks",48971);

});

// ---------- Login State ----------

async function checkLogin(){

    const user=await getCurrentUser();

    if(user){

        loginBtn.style.display="none";

        if(logoutBtn)
            logoutBtn.style.display="inline-block";

    }else{

        loginBtn.style.display="inline-block";

        if(logoutBtn)
            logoutBtn.style.display="none";

    }

}

checkLogin();

// ---------- Start Button ----------

const startBtn=$("startBtn");

if(startBtn){

    startBtn.onclick=()=>{

        if(currentUser){

            openPage("dashboard");

        }else{

            authModal.style.display="flex";

        }

    };

}

// ---------- Keyboard ----------

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        authModal.style.display="none";

        withdrawModal.style.display="none";

    }

});

// ---------- Footer Year ----------

const footer=document.querySelector("footer p");

if(footer){

    footer.innerHTML=
    "© "+new Date().getFullYear()+
    " TaskHub";

}

// ---------- Console ----------

console.log(
"TaskHub Loaded Successfully"
);

// ---------- Init ----------

reloadProfile();
