const SUPABASE_URL='https://wtvbqxwuxksvxkjukiaz.supabase.co';
const SUPABASE_KEY='sb_publishable_EGdpYXvEJlUsH3hgWfTm5w_ef6sR9OS';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
window.autorentDb=sb;

window.signUpAutoRent=async function({email,password,full_name,role='client',city='',phone=''}){
  const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name,role,city,phone}}});
  if(error) throw error;
  return data;
};
window.signInAutoRent=async function(email,password){
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error) throw error;
  return data;
};
window.signOutAutoRent=async function(){await sb.auth.signOut();location.href='index.html'};
window.getAutoRentUser=async function(){const {data}=await sb.auth.getUser();return data.user};
window.getAutoRentProfile=async function(){const u=await window.getAutoRentUser();if(!u)return null;const {data}=await sb.from('profiles').select('*').eq('id',u.id).single();return data};
window.loadVehicles=async function(city){let q=sb.from('vehicles').select('*,agencies(name,verified)').eq('status','available').order('sponsored',{ascending:false}).order('price_per_day');if(city)q=q.eq('city',city);const {data,error}=await q;if(error)throw error;return data||[]};
window.createBooking=async function(vehicle,starts_on,ends_on,message=''){
  const u=await window.getAutoRentUser();
  if(!u)throw new Error('AUTH_REQUIRED');
  const days=Math.max(1,Math.ceil((new Date(ends_on)-new Date(starts_on))/86400000));
  const {data,error}=await sb.from('bookings').insert({client_id:u.id,agency_id:vehicle.agency_id,vehicle_id:vehicle.id,starts_on,ends_on,total_price:Number(vehicle.price_per_day)*days,client_message:message}).select().single();
  if(error)throw error;
  try{
    const {error:notifyError}=await sb.functions.invoke('notify-make-booking',{body:{booking_id:data.id}});
    if(notifyError)console.warn('Make notification failed',notifyError);
  }catch(e){console.warn('Make notification failed',e)}
  return data;
};