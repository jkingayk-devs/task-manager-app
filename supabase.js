/* ===========================================
   TaskHub - Supabase Configuration
=========================================== */

/*
1. Create a free Supabase project.

2. Go to:
   Project Settings
   → API

3. Copy:

   Project URL
   Anon Public Key

4. Replace them below.
*/

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";

const SUPABASE_ANON_KEY =
"YOUR_SUPABASE_ANON_KEY";

/* =========================================== */

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ===========================================
   Global Variables
=========================================== */

let currentUser = null;
let userData = null;

/* ===========================================
   Auth Helpers
=========================================== */

async function getCurrentUser() {

    const { data } = await supabase.auth.getUser();

    currentUser = data.user;

    return currentUser;

}

async function signOutUser() {

    await supabase.auth.signOut();

    location.reload();

}

/* ===========================================
   Database Helpers
=========================================== */

async function getProfile(uid) {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();

    if (error) {

        console.error(error);

        return null;

    }

    userData = data;

    return data;

}

async function updateBalance(balance) {

    if (!currentUser) return;

    await supabase
        .from("users")
        .update({

            balance: balance

        })
        .eq("id", currentUser.id);

}

async function updateCoins(coins) {

    if (!currentUser) return;

    await supabase
        .from("users")
        .update({

            coins: coins

        })
        .eq("id", currentUser.id);

}

/* ===========================================
   Daily Bonus
=========================================== */

async function addCoins(amount) {

    if (!userData) return;

    let newCoins = userData.coins + amount;

    await updateCoins(newCoins);

    userData.coins = newCoins;

}

/* ===========================================
   Withdraw Request
=========================================== */

async function createWithdraw(amount, method) {

    if (!currentUser) return;

    await supabase
        .from("withdraws")
        .insert({

            userid: currentUser.id,

            amount: amount,

            method: method,

            status: "Pending"

        });

}

/* ===========================================
   Toast Helper
=========================================== */

function showToast(text){

    const toast = document.getElementById("toast");

    toast.innerText = text;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

await supabase

.from("transactions")

.insert({

user_id:user.id,

type:"daily_bonus",

amount:50,

description:"Daily Bonus"

});
