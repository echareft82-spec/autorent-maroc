(async function(){
  const loginBtn=document.getElementById('loginBtn');
  if(!loginBtn||!window.autorentDb)return;

  async function refreshAuthUI(){
    try{
      const user=await getAutoRentUser();
      if(!user){
        loginBtn.textContent='Connexion';
        loginBtn.onclick=()=>showAuth('client','login');
        return;
      }
      const profile=await getAutoRentProfile();
      loginBtn.textContent='Mon espace';
      loginBtn.onclick=()=>{
        location.href=profile?.role==='loueur'?'loueur.html':'client.html';
      };
    }catch(e){
      console.warn('Auth UI refresh failed',e);
      loginBtn.textContent='Connexion';
      loginBtn.onclick=()=>showAuth('client','login');
    }
  }

  await refreshAuthUI();
  window.autorentDb.auth.onAuthStateChange(()=>{
    setTimeout(refreshAuthUI,0);
  });
})();
