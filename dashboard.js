const savedBookings=()=>JSON.parse(localStorage.getItem('autorentBookings')||'[]');
const saveBookings=b=>localStorage.setItem('autorentBookings',JSON.stringify(b));
const path=location.pathname;
if(path.endsWith('client.html')){
 const section=document.querySelector('#bookings');
 const list=savedBookings();
 if(section&&list.length){const grid=section.querySelector('.grid');grid.innerHTML=list.map(b=>`<article class="car"><div class="car-top">🚗</div><div class="car-body"><h3>${b.car}</h3><div class="meta">${b.city} · ${b.ref}</div><div class="features"><span>${b.price} DH/j</span><span>${b.status}</span></div><button class="ghost" onclick="alert('Référence: ${b.ref}\nStatut: ${b.status}')">Voir le détail</button></div></article>`).join('')}
 document.querySelector('header .primary')?.addEventListener('click',()=>location.href='index.html#cars');
}
if(path.endsWith('loueur.html')){
 const section=document.querySelector('#bookings .chat');
 const list=savedBookings();
 if(section&&list.length){section.innerHTML=list.map((b,i)=>`<div class="bubble bot"><b>${b.ref}</b> — ${b.city} — ${b.car} — Client: ${b.name}<br><small>${b.email||'Email non renseigné'}</small><br><br><button class="primary" onclick="setStatus(${i},'Confirmée')">Confirmer</button> <button class="ghost" onclick="setStatus(${i},'Refusée')">Refuser</button> <span style="margin-left:10px">${b.status}</span></div>`).join('')}
 window.setStatus=(i,status)=>{const b=savedBookings();b[i].status=status;saveBookings(b);location.reload()};
 [...document.querySelectorAll('button')].filter(b=>b.textContent.includes('Ajouter')).forEach(btn=>btn.addEventListener('click',()=>{const name=prompt('Modèle du véhicule');if(!name)return;alert(name+' sera ajouté au parc dans la prochaine version connectée à la base de données.')}));
}
if(path.endsWith('admin.html')){
 const list=savedBookings();
 const cards=document.querySelectorAll('.stats b');
 if(cards.length>=3){cards[2].textContent=String(list.length)}
}