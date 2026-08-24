(async function(){
  const loginBtn=document.getElementById('loginBtn');
  if(!loginBtn||!window.autorentDb)return;

  async function refreshAuthUI(){
    let user=null;
    try{
      user=await getAutoRentUser();
    }catch(e){
      console.warn('Unable to read auth session',e);
    }

    if(!user){
      loginBtn.textContent='Connexion';
      loginBtn.onclick=()=>showAuth('client','login');
      return;
    }

    // A valid Supabase session means the user is connected. Profile loading
    // is secondary and must never make the UI pretend the user logged out.
    loginBtn.textContent='Mon espace';
    loginBtn.onclick=()=>location.href='client.html';

    try{
      const profile=await getAutoRentProfile();
      if(profile?.role==='loueur'){
        loginBtn.onclick=()=>location.href='loueur.html';
      }
    }catch(e){
      console.warn('Profile unavailable; keeping authenticated client UI',e);
    }
  }

  await refreshAuthUI();
  window.autorentDb.auth.onAuthStateChange((_event,session)=>{
    if(session?.user){
      loginBtn.textContent='Mon espace';
    }
    setTimeout(refreshAuthUI,0);
  });
})();
