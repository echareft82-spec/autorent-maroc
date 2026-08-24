const db=window.autorentDb;
const bookingGrid=document.getElementById('clientBookings');
const clientTitle=document.getElementById('clientTitle');
const statusLabel={pending:'En attente',confirmed:'Confirmée',cancelled:'Annulée',rejected:'Refusée',completed:'Terminée'};
let currentClientUser=null;

function showSessionProblem(){
  clientTitle.textContent='Session client requise';
  bookingGrid.innerHTML=`<div class="chat" style="grid-column:1/-1"><div class="bubble bot">Votre session n’est pas active sur cette page. Reconnectez-vous pour accéder à vos réservations.</div><button class="primary" id="reloginClient" style="margin-top:14px">Se reconnecter</button></div>`;
  const btn=document.getElementById('reloginClient');
  if(btn)btn.onclick=()=>location.assign(`${location.origin}/index.html?login=1`);
}

async function initClient(){
  try{
    const session=await getAutoRentSession();
    if(!session?.user){showSessionProblem();return;}
    currentClientUser=session.user;
    let profile=null;
    try{profile=await getAutoRentProfile();}catch(e){console.warn('Profile unavailable',e)}
    if(profile?.role==='loueur'){
      location.assign(`${location.origin}/loueur.html`);
      return;
    }
    clientTitle.textContent=`Bonjour${profile?.full_name?' '+profile.full_name:''}`;
    await loadClientBookings();
  }catch(e){
    console.error('Client session initialization failed',e);
    showSessionProblem();
  }
}

async function loadClientBookings(){
  const user=currentClientUser||await getAutoRentUser();
  if(!user){showSessionProblem();return;}
  const {data,error}=await db.from('bookings').select('*,vehicles(brand,model,city,price_per_day,image_url),agencies(name)').eq('client_id',user.id).order('created_at',{ascending:false});
  if(error){bookingGrid.innerHTML=`<p>${error.message}</p>`;return;}
  if(!data?.length){
    bookingGrid.innerHTML='<div class="chat" style="grid-column:1/-1"><div class="bubble bot">Vous n’avez encore aucune réservation. Lancez une recherche sur la marketplace pour trouver votre première voiture.</div></div>';
    return;
  }
  bookingGrid.innerHTML=data.map(b=>{
    const v=b.vehicles||{};
    const canCancel=['pending','confirmed'].includes(b.status);
    return `<article class="car"><div class="car-top">${v.image_url?`<img src="${v.image_url}" alt="${v.brand||''} ${v.model||''}" style="width:100%;height:100%;object-fit:cover">`:'🚗'}</div><div class="car-body"><h3>${v.brand||'Véhicule'} ${v.model||''}</h3><div class="meta">📍 ${v.city||'—'} · ${formatDate(b.starts_on)} → ${formatDate(b.ends_on)}</div><div class="features"><span>${statusLabel[b.status]||b.status}</span><span>${Number(b.total_price||0).toLocaleString('fr-FR')} DH total</span>${b.agencies?.name?`<span>${b.agencies.name}</span>`:''}</div>${canCancel?`<button class="ghost" onclick="cancelBooking('${b.id}')">Annuler la demande</button>`:''}</div></article>`;
  }).join('');
}

function formatDate(d){return d?new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'—'}

async function cancelBooking(id){
  if(!confirm('Annuler cette réservation ?'))return;
  const {error}=await db.from('bookings').update({status:'cancelled'}).eq('id',id);
  if(error)alert(error.message);else loadClientBookings();
}

document.getElementById('logoutClient').onclick=signOutAutoRent;
document.getElementById('newSearch').onclick=()=>location.assign(`${location.origin}/index.html`);
initClient();
