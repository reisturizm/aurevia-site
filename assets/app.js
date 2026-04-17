
const STORAGE_KEY="aurevia_users";
const SESSION_KEY="aurevia_session";
const REQUESTS_KEY="aurevia_balance_requests";
const ORDERS_KEY="aurevia_orders";
const PACKAGES_KEY="aurevia_packages";
const SETTINGS_KEY="aurevia_settings";
const CHATS_KEY="aurevia_chats";

const LAST_READ_KEY="aurevia_last_read";

function getLastRead(){ return read(LAST_READ_KEY,{}); }
function saveLastRead(v){ write(LAST_READ_KEY,v); }
function markChatRead(scopeKey){
  const lr=getLastRead(); lr[scopeKey]=Date.now(); saveLastRead(lr);
}
function getUnreadCountForAdmin(){
  const chats=getChats(); const lr=getLastRead(); const last=lr["admin_global"] || 0;
  return chats.filter(c=>c.senderRole==="user" && new Date(c.createdAt||0).getTime() > last).length;
}
function getUnreadCountForCustomer(email){
  const chats=getChats(); const lr=getLastRead(); const last=lr["customer:"+email] || 0;
  return chats.filter(c=>c.userEmail===email && c.senderRole==="admin" && new Date(c.createdAt||0).getTime() > last).length;
}
function updateUnreadBadges(){
  const s=getSession();
  const adminCount=getUnreadCountForAdmin();
  document.querySelectorAll("[data-admin-unread]").forEach(el=>{ el.textContent=adminCount; el.style.display=adminCount? "inline-flex":"none"; });
  if(s){
    const c=getUnreadCountForCustomer(s.email);
    document.querySelectorAll("[data-customer-unread]").forEach(el=>{ el.textContent=c; el.style.display=c? "inline-flex":"none"; });
  }
}
function updatePendingFileLabels(form){
  const pairs = [
    ["heroImageFile","heroImagePending"],["heroVideoFile","heroVideoPending"],
    ["pricingImageFile","pricingImagePending"],["pricingVideoFile","pricingVideoPending"],
    ["servicesImageFile","servicesImagePending"],["servicesVideoFile","servicesVideoPending"],["siteLogoFile","siteLogoPending"],["bgHomeFile","bgHomePending"],["bgServicesFile","bgServicesPending"],["bgPricingFile","bgPricingPending"],["bgAboutFile","bgAboutPending"],["bgContactFile","bgContactPending"],["bgLoginFile","bgLoginPending"],["bgRegisterFile","bgRegisterPending"],["bgAdminFile","bgAdminPending"],["bgCustomerFile","bgCustomerPending"]
  ];
  pairs.forEach(([fileField,labelId])=>{
    const input=form.elements.namedItem(fileField);
    const label=document.getElementById(labelId);
    if(input && label){
      const file=input.files && input.files[0];
      label.textContent = file ? `Seçildi: ${file.name} — Kaydet'e basınca uygulanır.` : "";
    }
  });
}


const defaults={
  packages:[
    {id:"starter",name:"Starter",price:50,description:"Başlangıç seviyesi plan",active:true},
    {id:"pro",name:"Pro",price:100,description:"En çok tercih edilen plan",active:true},
    {id:"enterprise",name:"Enterprise",price:180,description:"Kurumsal kullanım için",active:true}
  ],
  settings:{
    siteName:"Aurevia",
    siteLogo:"",
    bg_home:"",
    bg_services:"",
    bg_pricing:"",
    bg_about:"",
    bg_contact:"",
    bg_login:"",
    bg_register:"",
    bg_admin:"",
    bg_customer:"",
    siteFont:"Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    siteTextColor:"#f5efe2",
    siteAccent:"#d4af37",
    siteLogoSize:"42",
    sitePanelOpacity:"0.03",
    navItems: [
      {"label":"Hizmetler","href":"services.html"},
      {"label":"Fiyatlandırma","href":"pricing.html"},
      {"label":"Hakkımızda","href":"about.html"},
      {"label":"İletişim","href":"contact.html"}
    ],
    representativeName:"Yasin",
    contactEmail:"info@aurevia.com",
    heroChip:"Siyah & gold kurumsal tasarım",
    heroEyebrow:"Çok kanallı müşteri deneyimi yönetimi",
    heroTitle:"İşletmenizi Premium Görünüme Taşıyın",
    heroText:"Kurumsal ekipler için yorum takibi, geri bildirim yönetimi, performans ölçümü, çok şubeli raporlama ve ekip iş akışı sunan profesyonel bir arayüz yapısı.",
    heroImage:"",
    heroVideo:"",
    pricingTitle:"Canlı Görüşme",
    pricingText:"Paket kartları kurumsal görünümle hazırlandı. İçerik ve tutarları admin panelinden güncellenebilir.",
    pricingImage:"",
    pricingVideo:"",
    servicesTitle:"Kurumsal Hizmet Yapısı",
    servicesText:"Tek ekranda geri bildirim takibi, şube bazlı performans izleme, destek akışı ve raporlama için profesyonel modül yapısı.",
    servicesImage:"",
    servicesVideo:"",
    themeMode:"dark-gold"
  }
};

function read(k,f){ return JSON.parse(localStorage.getItem(k) || JSON.stringify(f)); }
function write(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function getUsers(){ return read(STORAGE_KEY,[]); } function saveUsers(v){ write(STORAGE_KEY,v); }
function getRequests(){ return read(REQUESTS_KEY,[]); } function saveRequests(v){ write(REQUESTS_KEY,v); }
function getOrders(){ return read(ORDERS_KEY,[]); } function saveOrders(v){ write(ORDERS_KEY,v); }
function getPackages(){ return read(PACKAGES_KEY,defaults.packages); } function savePackages(v){ write(PACKAGES_KEY,v); }
function getSettings(){ return read(SETTINGS_KEY,defaults.settings); } function saveSettings(v){ write(SETTINGS_KEY,v); }
function getChats(){ return read(CHATS_KEY,[]); } function saveChats(v){ write(CHATS_KEY,v); }

function initSeed(){
  if(!localStorage.getItem(PACKAGES_KEY)) savePackages(defaults.packages);
  if(!localStorage.getItem(SETTINGS_KEY)) saveSettings(defaults.settings);
}
initSeed();

function setSession(user){ localStorage.setItem(SESSION_KEY, JSON.stringify({name:user.name,email:user.email,role:user.role,company:user.company||"",balance:Number(user.balance||0),isActive:user.isActive!==false})); }
function getSession(){ return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
function refreshSessionFromUsers(){ const s=getSession(); if(!s) return; const u=getUsers().find(x=>x.email===s.email); if(u) setSession(u); }
function logout(){ localStorage.removeItem(SESSION_KEY); window.location.href="login.html"; }
function requireAuth(role){
  refreshSessionFromUsers();
  const s=getSession();
  if(!s){ window.location.href="login.html"; return null; }
  if(role && s.role!==role){ window.location.href=s.role==="admin"?"admin.html":"customer.html"; return null; }
  return s;
}
function fmtMoney(v){ return "₺"+Number(v||0).toLocaleString("tr-TR"); }
function currentDateTR(){ return new Date().toLocaleDateString("tr-TR"); }
function showMessage(el,text,ok=true){ if(!el) return; el.className="msg "+(ok?"ok":"err"); el.textContent=text; }
function adminExists(){ return getUsers().some(u=>u.role==="admin"); }
function updateRoleOptions(){
  const roleSelect=document.querySelector('select[name="role"]');
  const adminInfo=document.querySelector("#adminRoleInfo");
  if(roleSelect) roleSelect.style.display="none";
  if(adminInfo) adminInfo.style.display="none";
}
function setMedia(elId,url,isVideo=false){
  const box=document.getElementById(elId); if(!box) return;
  if(!url){ box.innerHTML=""; return; }
  box.innerHTML = isVideo
    ? `<video autoplay muted loop playsinline controls src="${url}"></video>`
    : `<img src="${url}" alt="">`;
}
function syncGlobalText(){
  const st=getSettings();
  document.querySelectorAll("[data-site-name]").forEach(el=>el.textContent=st.siteName);
  document.querySelectorAll("[data-site-logo]").forEach(el=>{ el.innerHTML = st.siteLogo ? `<img class="logo-img" src="${st.siteLogo}" alt="">` : `<span class="mark">A</span>`; });
  document.querySelectorAll("[data-contact-email]").forEach(el=>el.textContent=st.contactEmail);

  document.querySelectorAll("[data-dynamic-nav]").forEach(nav=>{
    const items = Array.isArray(st.navItems) ? st.navItems : [];
    nav.innerHTML = items.map(item=>`<a href="${item.href || '#'}">${item.label || 'Menü'}</a>`).join("");
  });
  document.querySelectorAll("[data-representative]").forEach(el=>el.textContent=st.representativeName);

  document.documentElement.style.setProperty("--dynamic-font-family", st.siteFont || "Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif");
  document.documentElement.style.setProperty("--dynamic-text-color", st.siteTextColor || "#f5efe2");
  document.documentElement.style.setProperty("--dynamic-accent", st.siteAccent || "#d4af37");
  document.documentElement.style.setProperty("--dynamic-logo-size", ((st.siteLogoSize || "42") + "px"));
  document.documentElement.style.setProperty("--dynamic-panel-opacity", st.sitePanelOpacity || "0.03");

  const pageId = document.body.getAttribute("data-page-id") || "";
  const bgMap = {
    home: st.bg_home, services: st.bg_services, pricing: st.bg_pricing, about: st.bg_about, contact: st.bg_contact,
    login: st.bg_login, register: st.bg_register, admin: st.bg_admin, customer: st.bg_customer
  };
  const bg = bgMap[pageId] || "";
  if(bg){
    document.body.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.72), rgba(0,0,0,.82)), url("${bg}")`;
  }
  const heroChip=document.getElementById("heroChip"); if(heroChip) heroChip.textContent=st.heroChip;
  const heroEyebrow=document.getElementById("heroEyebrow"); if(heroEyebrow) heroEyebrow.textContent=st.heroEyebrow;
  const heroTitle=document.getElementById("heroTitle"); if(heroTitle) heroTitle.textContent=st.heroTitle;
  const heroText=document.getElementById("heroText"); if(heroText) heroText.textContent=st.heroText;
  const pricingTitle=document.getElementById("pricingTitle"); if(pricingTitle) pricingTitle.textContent=st.pricingTitle;
  const pricingText=document.getElementById("pricingText"); if(pricingText) pricingText.textContent=st.pricingText;
  const servicesTitle=document.getElementById("servicesTitle"); if(servicesTitle) servicesTitle.textContent=st.servicesTitle;
  const servicesText=document.getElementById("servicesText"); if(servicesText) servicesText.textContent=st.servicesText;
  setMedia("heroImageBox", st.heroImage, false);
  setMedia("heroVideoBox", st.heroVideo, true);
  setMedia("pricingImageBox", st.pricingImage, false);
  setMedia("pricingVideoBox", st.pricingVideo, true);
  setMedia("servicesImageBox", st.servicesImage, false);
  setMedia("servicesVideoBox", st.servicesVideo, true);
}
function bindTabs(selector){
  const root=document.querySelector(selector); if(!root) return;
  const scope = root.getAttribute("data-tab-scope");
  const btns=root.querySelectorAll("[data-tab-btn]");
  const contentClass = "." + scope + "-content";
  const secs=document.querySelectorAll(`${contentClass} [data-tab-section]`);
  const state=getTabState();
  const initial = state[scope] || btns[0]?.getAttribute("data-tab-btn");
  btns.forEach(btn=>btn.addEventListener("click",e=>{
    e.preventDefault();
    setActiveTab(scope, btn.getAttribute("data-tab-btn"));
  }));
  if(initial){
    btns.forEach(x=>x.classList.toggle("active", x.getAttribute("data-tab-btn")===initial));
    secs.forEach(sec=>sec.classList.toggle("active", sec.getAttribute("data-tab-section")===initial));
  }
}

function renderPricingCards(){
  const mount=document.getElementById("pricingMount"); if(!mount) return;
  const pkgs=getPackages().filter(p=>p.active!==false);
  if(!pkgs.length){ mount.innerHTML='<div class="notice">Aktif paket bulunmuyor.</div>'; return; }
  mount.innerHTML="";
  pkgs.forEach((p,i)=>{
    const cls = i===1 ? "price popular" : "price";
    const tag = i===1 ? "En Popüler" : p.name;
    mount.innerHTML += `<div class="${cls}">
      <span class="pill">${tag}</span>
      <h3>${p.name}</h3>
      <strong>${fmtMoney(p.price)}</strong>
      <div class="muted">/ birim</div>
      <p class="muted">${p.description}</p>
      <a class="btn ${i===1?'btn-gold':'btn-dark'}" href="register.html" style="margin-top:18px">Başla</a>
    </div>`;
  });
}

function renderAdminSummary(){
  const users=getUsers();
  const customerCount=users.filter(u=>u.role==="customer").length;
  const adminCount=users.filter(u=>u.role==="admin").length;
  const totalBalance=users.filter(u=>u.role==="customer").reduce((a,b)=>a+Number(b.balance||0),0);
  const pendingRequests=getRequests().filter(r=>r.status==="pending").length;
  const map={adminCustomerCount:customerCount,adminAdminCount:adminCount,adminTotalBalance:fmtMoney(totalBalance),adminPendingRequests:pendingRequests};
  Object.entries(map).forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.textContent=val; });
}

function renderUsersAdmin(){
  const mount=document.getElementById("usersList"); if(!mount) return;
  const users=getUsers(); const session=getSession(); mount.innerHTML="";
  users.forEach(user=>{
    const passiveText=user.isActive===false?"Pasif":"Aktif";
    const passiveBadge=user.isActive===false?"off":"ok";
    const toggleLabel=user.isActive===false?"Aktif Et":"Pasif Et";
    const row=document.createElement("div"); row.className="item-row";
    row.innerHTML=`
      <div>
        <strong>${user.name}</strong>
        <div class="small">${user.email} • ${user.role==="admin"?"Admin":"Müşteri"} • ${user.company||"-"} • ${user.phone||"-"}</div>
        <div class="small">Bakiye: ${fmtMoney(user.balance||0)} • <span class="badge ${passiveBadge}">${passiveText}</span></div>
      </div>
      <div class="item-actions">
        ${user.role==="customer"?`<button class="small-btn green" data-add="${user.email}">+ Bakiye</button><button class="small-btn red" data-sub="${user.email}">- Bakiye</button>`:""}
        ${(user.email!==session.email && user.role!=="admin")?`<button class="small-btn gold" data-toggle="${user.email}">${toggleLabel}</button><button class="small-btn red" data-delete="${user.email}">Sil</button>`:""}
      </div>`;
    mount.appendChild(row);
  });
  mount.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-add"); const n=Number(prompt("Eklenecek bakiye tutarı"));
    if(!n||n<=0) return; const users=getUsers(); const u=users.find(x=>x.email===email); if(!u) return;
    u.balance=Number(u.balance||0)+n; saveUsers(users); refreshSessionFromUsers(); renderUsersAdmin(); renderAdminSummary(); renderCustomerBalance();
  }));
  mount.querySelectorAll("[data-sub]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-sub"); const n=Number(prompt("Düşülecek bakiye tutarı"));
    if(!n||n<=0) return; const users=getUsers(); const u=users.find(x=>x.email===email); if(!u) return;
    u.balance=Math.max(0,Number(u.balance||0)-n); saveUsers(users); refreshSessionFromUsers(); renderUsersAdmin(); renderAdminSummary(); renderCustomerBalance();
  }));
  mount.querySelectorAll("[data-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-toggle"); const users=getUsers(); const u=users.find(x=>x.email===email); if(!u) return;
    u.isActive=u.isActive===false?true:false; saveUsers(users); renderUsersAdmin();
  }));
  mount.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-delete");
    if(!confirm("Bu kullanıcı tamamen silinsin mi?")) return;
    saveUsers(getUsers().filter(u=>u.email!==email));
    saveRequests(getRequests().filter(r=>r.userEmail!==email));
    const s=getSession();
    const customerName = (getUsers().find(u=>u.email===email)?.company) || "";
    if(customerName) saveOrders(getOrders().filter(o=>o.customer!==customerName));
    saveChats(getChats().filter(c=>c.userEmail!==email));
    renderUsersAdmin(); renderAdminSummary(); renderBalanceRequests(); renderOrdersAdmin(); renderAdminChats();
  }));
}

function renderBalanceRequests(){
  const mount=document.getElementById("requestList"); if(!mount) return;
  const requests=getRequests(); const rep=getSettings().representativeName; mount.innerHTML="";
  if(!requests.length){ mount.innerHTML='<div class="status-note">Henüz bakiye talebi yok.</div>'; return; }
  requests.slice().reverse().forEach(req=>{
    const row=document.createElement("div"); row.className="item-row";
    row.innerHTML=`
      <div>
        <strong>${req.userName}</strong>
        <div class="small">${req.userEmail} • ${req.phone||"-"} • ${fmtMoney(req.amount)} • Temsilci: ${req.representative||rep}</div>
        <div class="small">Durum: ${req.status==="pending"?"Bekliyor":req.status==="approved"?"Onaylandı":"Reddedildi"}</div>
      </div>
      <div class="item-actions">
        ${req.status==="pending"?`<button class="small-btn green" data-approve="${req.id}">Onayla</button><button class="small-btn red" data-reject="${req.id}">Reddet</button>`:""}
      </div>`;
    mount.appendChild(row);
  });
  mount.querySelectorAll("[data-approve]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-approve"); const requests=getRequests(); const req=requests.find(r=>r.id===id);
    if(!req||req.status!=="pending") return; req.status="approved"; saveRequests(requests);
    const users=getUsers(); const u=users.find(x=>x.email===req.userEmail); if(u){ u.balance=Number(u.balance||0)+Number(req.amount||0); saveUsers(users); }
    refreshSessionFromUsers(); renderBalanceRequests(); renderUsersAdmin(); renderAdminSummary(); renderCustomerBalance(); renderCustomerRequests();
  }));
  mount.querySelectorAll("[data-reject]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-reject"); const requests=getRequests(); const req=requests.find(r=>r.id===id);
    if(!req||req.status!=="pending") return; req.status="rejected"; saveRequests(requests); renderBalanceRequests(); renderCustomerRequests(); renderAdminSummary();
  }));
}

function renderOrdersAdmin(){
  const tbody=document.getElementById("ordersTableBody"); if(!tbody) return;
  const orders=getOrders(); tbody.innerHTML="";
  if(!orders.length){ tbody.innerHTML='<tr><td colspan="7">Henüz sipariş yok.</td></tr>'; return; }
  orders.slice().reverse().forEach(order=>{
    const badge=order.status==="Tamamlandı"?"ok":order.status==="Beklemede"?"warn":"off";
    tbody.innerHTML+=`<tr>
      <td>${order.customer}</td><td>${order.packageName}</td><td>${fmtMoney(order.amount)}</td>
      <td><span class="badge ${badge}">${order.status}</span></td><td>${order.stage||"Hazırlanıyor"}</td><td>${order.date}</td>
      <td>
        <button class="small-btn gold" onclick="setOrderStatus('${order.id}','Beklemede')">Beklemede</button>
        <button class="small-btn green" onclick="setOrderStatus('${order.id}','Tamamlandı')">Tamamla</button>
        <button class="small-btn red" onclick="setOrderStatus('${order.id}','İptal')">İptal</button>
        <button class="small-btn gold" onclick="setOrderStage('${order.id}')">Aşama</button>
      </td></tr>`;
  });
}
window.setOrderStatus=function(id,status){
  const orders=getOrders(); const o=orders.find(x=>x.id===id); if(!o) return;
  o.status=status; saveOrders(orders); renderOrdersAdmin(); renderCustomerOrders();
}
window.setOrderStage=function(id){
  const orders=getOrders(); const o=orders.find(x=>x.id===id); if(!o) return;
  const stage=prompt("Son durum / aşama bilgisi", o.stage || "Hazırlanıyor");
  if(stage===null) return;
  o.stage=stage;
  o.timeline = o.timeline || ["Sipariş alındı"];
  o.timeline.push(stage);
  saveOrders(orders); renderOrdersAdmin(); renderCustomerOrders(); renderCustomerOrderTracking();
}

function fillOrderFormOptions(){
  const customerSelect=document.querySelector('#adminOrderForm select[name="customer"]');
  const packageSelect=document.querySelector('#adminOrderForm select[name="packageName"]');
  if(customerSelect){
    const customers=getUsers().filter(u=>u.role==="customer" && u.isActive!==false);
    customerSelect.innerHTML=customers.length ? customers.map(u=>`<option value="${u.company||u.name}" data-email="${u.email}">${u.company||u.name}</option>`).join("") : '<option value="">Müşteri yok</option>';
  }
  if(packageSelect){
    const pkgs=getPackages().filter(p=>p.active!==false);
    packageSelect.innerHTML=pkgs.length ? pkgs.map(p=>`<option value="${p.id}" data-price="${p.price}">${p.name} - ${fmtMoney(p.price)}</option>`).join("") : '<option value="">Paket yok</option>';
  }
}
function bindAdminOrderForm(){
  const form=document.getElementById("adminOrderForm"); if(!form) return;
  fillOrderFormOptions();
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const customer=form.customer.value; const packageId=form.packageName.value;
    const customerEmail = form.customer.selectedOptions[0]?.dataset.email || "";
    const pkg=getPackages().find(p=>p.id===packageId); if(!customer||!pkg) return;
    const orders=getOrders();
    orders.push({id:"ord_"+Date.now(),customer,customerEmail,packageId:pkg.id,packageName:pkg.name,amount:Number(pkg.price||0),status:"Beklemede",stage:"Sipariş alındı",timeline:["Sipariş alındı"],date:currentDateTR()});
    saveOrders(orders); form.reset(); fillOrderFormOptions(); renderOrdersAdmin(); renderCustomerOrders(); renderCustomerOrderTracking();
  });
}

function renderPackagesAdmin(){
  const mount=document.getElementById("packagesList"); if(!mount) return;
  const items=getPackages(); mount.innerHTML="";
  items.forEach(pkg=>{
    const row=document.createElement("div"); row.className="item-row";
    row.innerHTML=`
      <div>
        <strong>${pkg.name}</strong>
        <div class="small">${fmtMoney(pkg.price)} • ${pkg.description}</div>
        <div class="small"><span class="badge ${pkg.active===false?"off":"ok"}">${pkg.active===false?"Pasif":"Aktif"}</span></div>
      </div>
      <div class="item-actions">
        <button class="small-btn gold" data-edit="${pkg.id}">Düzenle</button>
        <button class="small-btn ${pkg.active===false?"green":"red"}" data-toggle-pkg="${pkg.id}">${pkg.active===false?"Aktif Et":"Pasif Et"}</button>
        <button class="small-btn red" data-delete-pkg="${pkg.id}">Sil</button>
      </div>`;
    mount.appendChild(row);
  });
  mount.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-edit"); const pkgs=getPackages(); const pkg=pkgs.find(x=>x.id===id); if(!pkg) return;
    const name=prompt("Paket adı",pkg.name); if(!name) return;
    const price=Number(prompt("Paket fiyatı",pkg.price)); const desc=prompt("Açıklama",pkg.description);
    pkg.name=name; pkg.price=price||pkg.price; pkg.description=desc||pkg.description; savePackages(pkgs);
    renderPackagesAdminEnhanced(); fillOrderFormOptions(); renderPricingCards();
  }));
  mount.querySelectorAll("[data-toggle-pkg]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-toggle-pkg"); const pkgs=getPackages(); const pkg=pkgs.find(x=>x.id===id); if(!pkg) return;
    pkg.active=pkg.active===false?true:false; savePackages(pkgs); renderPackagesAdminEnhanced(); fillOrderFormOptions(); renderPricingCards();
  }));
  mount.querySelectorAll("[data-delete-pkg]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-delete-pkg"); if(!confirm("Bu paket silinsin mi?")) return;
    savePackages(getPackages().filter(p=>p.id!==id));
    renderPackagesAdminEnhanced(); fillOrderFormOptions(); renderPricingCards();
  }));
}
function bindPackageCreateForm(){
  const form=document.getElementById("packageCreateForm"); if(!form || form.dataset.bound==="1") return;
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const fd=new FormData(form); const data=Object.fromEntries(fd.entries());
    let mediaImage = data.mediaImageUrl || "";
    let mediaVideo = data.mediaVideoUrl || "";
    const imgInput = form.querySelector('[name="mediaImageFile"]');
    const vidInput = form.querySelector('[name="mediaVideoFile"]');
    if(imgInput && imgInput.files && imgInput.files[0]){
      mediaImage = await fileToDataUrlSafe(imgInput.files[0], "pkgCreateImageUploadInfo");
      imgInput.value="";
    }
    if(vidInput && vidInput.files && vidInput.files[0]){
      try{
        mediaVideo = await fileToDataUrlSafe(vidInput.files[0], "pkgCreateVideoUploadInfo");
        vidInput.value="";
      }catch(err){
        console.error(err);
        alert("Paket videosu yüklenemedi. Dosya büyük olabilir.");
      }
    }
    const pkgs=getPackages(); pkgs.push({
      id:"pkg_"+Date.now(),
      name:data.name,
      price:Number(data.price||0),
      description:data.description,
      reviewTitle:data.reviewTitle || "",
      reviewText:data.reviewText || "",
      mediaImage,
      mediaVideo,
      active:true
    });
    savePackages(pkgs); form.reset(); renderPackagesAdminEnhanced(); fillOrderFormOptions?.(); renderPricingCards?.(); renderPackageShowcaseCards?.();
    alert("Paket eklendi.");
  });
  form.dataset.bound="1";
}


function formatMb(bytes){
  return (bytes / (1024*1024)).toFixed(2) + " MB";
}
function setProgress(labelId, percent, loaded, total, done=false){
  const label=document.getElementById(labelId);
  const bar=document.getElementById(labelId + "Bar");
  if(label){
    label.textContent = done
      ? `Yüklendi: ${formatMb(total)}`
      : `Yükleniyor: ${formatMb(loaded)} / ${formatMb(total)} (%${percent})`;
  }
  if(bar && bar.firstElementChild){
    bar.firstElementChild.style.width = percent + "%";
  }
}
function clearProgress(labelId){
  const label=document.getElementById(labelId);
  const bar=document.getElementById(labelId + "Bar");
  if(label) label.textContent = "";
  if(bar && bar.firstElementChild) bar.firstElementChild.style.width = "0%";
}
function fileToDataUrl(file, progressLabelId){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onprogress=(e)=>{
      if(e.lengthComputable && progressLabelId){
        const percent=Math.round((e.loaded/e.total)*100);
        setProgress(progressLabelId, percent, e.loaded, e.total, false);
      }
    };
    reader.onload=()=>{
      if(progressLabelId) setProgress(progressLabelId, 100, file.size, file.size, true);
      resolve(reader.result);
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}
async function applyUploadedMediaToSettings(form, current){
  const map = [
    ["heroImageFile","heroImage"],["heroVideoFile","heroVideo"],
    ["pricingImageFile","pricingImage"],["pricingVideoFile","pricingVideo"],
    ["servicesImageFile","servicesImage"],["servicesVideoFile","servicesVideo"],
  ];
  for(const [fileField, targetField] of map){
    const input = form[fileField];
    if(input && input.files && input.files[0]){
      current[targetField] = await fileToDataUrl(input.files[0]);
    }
  }
  return current;
}


function fillSettingsForm(){
  const form=document.getElementById("settingsForm"); if(!form) return;
  const st=getSettings();
  Object.keys(st).forEach(k=>{
    const el=form.querySelector(`[name="${k}"]`);
    if(el) el.value = st[k] || "";
  });
  ["heroImageFile","heroVideoFile","pricingImageFile","pricingVideoFile","servicesImageFile","servicesVideoFile","siteLogoFile","bgHomeFile","bgServicesFile","bgPricingFile","bgAboutFile","bgContactFile","bgLoginFile","bgRegisterFile","bgAdminFile","bgCustomerFile"].forEach(name=>{
    const input=form.querySelector(`[name="${name}"]`);
    if(input){
      if(!input.dataset.bound){
        input.addEventListener("change", ()=>updatePendingFileLabels(form));
        input.dataset.bound="1";
      }
    }
  });
  updatePendingFileLabels(form);
}
function bindSettingsForm(){
  const form=document.getElementById("settingsForm"); if(!form) return;
  form.addEventListener("submit", e=>e.preventDefault());
}
window.saveSettingsFields = async function(fieldsCsv, feedbackId){
  const form=document.getElementById("settingsForm");
  if(!form){
    alert("Kaydedilemedi.");
    return;
  }
  const fields = fieldsCsv.split(",").map(s=>s.trim()).filter(Boolean);
  let next = {...getSettings()};
  try{
    fields.forEach(field=>{
      const el=form.querySelector(`[name="${field}"]`);
      if(el) next[field] = el.value;
    });

    const fileMap = {
      heroImage:["heroImageFile","heroImagePending"], heroVideo:["heroVideoFile","heroVideoPending"],
      pricingImage:["pricingImageFile","pricingImagePending"], pricingVideo:["pricingVideoFile","pricingVideoPending"],
      servicesImage:["servicesImageFile","servicesImagePending"], servicesVideo:["servicesVideoFile","servicesVideoPending"],
      siteLogo:["siteLogoFile","siteLogoPending"],
      bg_home:["bgHomeFile","bgHomePending"],
      bg_services:["bgServicesFile","bgServicesPending"],
      bg_pricing:["bgPricingFile","bgPricingPending"],
      bg_about:["bgAboutFile","bgAboutPending"],
      bg_contact:["bgContactFile","bgContactPending"],
      bg_login:["bgLoginFile","bgLoginPending"],
      bg_register:["bgRegisterFile","bgRegisterPending"],
      bg_admin:["bgAdminFile","bgAdminPending"],
      bg_customer:["bgCustomerFile","bgCustomerPending"]
    };

    for(const field of fields){
      const pair = fileMap[field];
      if(!pair) continue;
      const [fileField, progressId] = pair;
      const input = form.querySelector(`[name="${fileField}"]`);
      if(input && input.files && input.files[0]){
        next[field] = await fileToDataUrl(input.files[0], progressId);
        input.value = "";
      }
    }

    saveSettings(next);

    try { fillSettingsForm(); } catch(e) { console.warn("fillSettingsForm warning", e); }
    try { syncGlobalText(); } catch(e) { console.warn("syncGlobalText warning", e); }
    try { renderPricingCards(); } catch(e) { console.warn("renderPricingCards warning", e); }

    const msg=document.getElementById("settingsMsg");
    if(msg) showMessage(msg, "Kaydedildi.");

    if(feedbackId){
      const fb=document.getElementById(feedbackId);
      if(fb){
        fb.textContent="Bu bölüm kaydedildi.";
        fb.classList.add("show");
        setTimeout(()=>fb.classList.remove("show"), 1800);
      }
    }

    alert("Kaydedildi.");
  }catch(err){
    console.error("saveSettingsFields error:", err);
    const msg=document.getElementById("settingsMsg");
    if(msg) showMessage(msg, "Kaydedilemedi.", false);
    alert("Kaydedilemedi.");
  }
}
function renderAdminAccounts(){
  const mount=document.getElementById("adminAccountsList"); if(!mount) return;
  const admins=getUsers().filter(u=>u.role==="admin");
  mount.innerHTML = admins.map(a=>`<div class="item-row">
    <div><strong>${a.name}</strong><div class="small">${a.email}</div></div>
    <div class="item-actions">
      <button class="small-btn gold" data-edit-admin="${a.email}">Bilgileri Değiştir</button>
      <button class="small-btn ${a.isActive===false?'green':'red'}" data-toggle-admin="${a.email}">${a.isActive===false?'Aktif Et':'Pasif Et'}</button>
    </div>
  </div>`).join("") || '<div class="status-note">Admin bulunmuyor.</div>';

  mount.querySelectorAll("[data-edit-admin]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-edit-admin");
    const users=getUsers(); const u=users.find(x=>x.email===email); if(!u) return;
    const oldEmail=u.email;
    const name=prompt("Admin adı", u.name); if(!name) return;
    const newEmail=prompt("Admin e-posta", u.email); if(!newEmail) return;
    if(newEmail !== oldEmail && users.some(x=>x.email.toLowerCase()===newEmail.toLowerCase())){ alert("Bu e-posta zaten kullanımda."); return; }
    const newPass=prompt("Yeni şifre (boş bırakırsan değişmez)", "");
    u.name=name; u.email=newEmail; if(newPass) u.password=newPass;
    saveUsers(users);
    const s=getSession(); if(s && s.email===oldEmail){ setSession(u); }
    refreshSessionFromUsers(); renderAdminAccounts(); renderUsersAdmin();
  }));
  mount.querySelectorAll("[data-toggle-admin]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-toggle-admin");
    const users=getUsers(); const u=users.find(x=>x.email===email); if(!u) return;
    u.isActive = u.isActive===false ? true : false;
    saveUsers(users); refreshSessionFromUsers(); renderAdminAccounts();
  }));
}
function bindAddAdminForm(){
  const form=document.getElementById("addAdminForm"); if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const users=getUsers(); const msg=document.getElementById("addAdminMsg");
    if(users.find(u=>u.email.toLowerCase()===data.email.toLowerCase())){ showMessage(msg,"Bu e-posta zaten kullanımda.", false); return; }
    users.push({name:data.name,email:data.email,phone:data.phone||"",company:data.company||"",password:data.password,role:"admin",balance:0,isActive:true});
    saveUsers(users); form.reset(); showMessage(msg,"Yeni admin eklendi."); renderAdminAccounts(); renderUsersAdmin();
  });
}


function fillOwnAdminForm(){
  const form=document.getElementById("ownAdminForm"); if(!form) return;
  const s=getSession(); if(!s) return;
  const users=getUsers(); const me=users.find(u=>u.email===s.email);
  if(!me) return;
  form.currentEmail.value = me.email || "";
  form.currentName.value = me.name || "";
}
function bindOwnAdminForm(){
  const form=document.getElementById("ownAdminForm"); if(!form || form.dataset.bound==="1") return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const s=getSession(); if(!s) return;
    const users=getUsers(); const me=users.find(u=>u.email===s.email);
    const msg=document.getElementById("ownAdminMsg");
    if(!me){ if(msg) showMessage(msg,"Admin bilgisi bulunamadı.", false); return; }
    const newEmail=form.currentEmail.value.trim();
    const newName=form.currentName.value.trim();
    const newPass=form.currentPassword.value.trim();
    if(newEmail !== me.email && users.some(u=>u.email.toLowerCase()===newEmail.toLowerCase())){
      if(msg) showMessage(msg,"Bu e-posta zaten kullanılıyor.", false);
      alert("Kaydedilemedi.");
      return;
    }
    me.email = newEmail;
    me.name = newName || me.name;
    if(newPass) me.password = newPass;
    saveUsers(users);
    setSession(me);
    if(msg) showMessage(msg,"Admin giriş bilgileri güncellendi.");
    alert("Kaydedildi.");
  });
  form.dataset.bound="1";
}

document.addEventListener("DOMContentLoaded",()=>{
  syncGlobalText(); renderPricingCards(); updateRoleOptions(); updateUnreadBadges();

  const reg=document.querySelector("#registerForm");
  if(reg){
    reg.addEventListener("submit",e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(reg).entries()); const msg=document.querySelector("#registerMsg"); const users=getUsers();
      if(users.find(u=>u.email.toLowerCase()===data.email.toLowerCase())){ showMessage(msg,"Bu e-posta ile kayıtlı bir hesap zaten var.",false); return; }
      let role = "customer";
      const newUser={name:data.name,email:data.email,phone:data.phone,company:"",password:data.password,role,balance:0,isActive:true};
      users.push(newUser); saveUsers(users); setSession(newUser); showMessage(msg,"Hesabınız oluşturuldu. Yönlendiriliyorsunuz...");
      setTimeout(()=>{ window.location.href="customer.html"; },700);
    });
  }

  const login=document.querySelector("#loginForm");
  if(login){
    login.addEventListener("submit",e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(login).entries()); const msg=document.querySelector("#loginMsg");
      const user=getUsers().find(u=>u.email.toLowerCase()===data.email.toLowerCase() && u.password===data.password);
      if(!user){ showMessage(msg,"E-posta veya şifre hatalı ya da bu hesap henüz oluşturulmamış.",false); return; }
      if(user.isActive===false){ showMessage(msg,"Bu hesap pasif durumda. Yönetici ile iletişime geç.",false); return; }
      setSession(user); showMessage(msg,"Giriş başarılı. Panel açılıyor...");
      setTimeout(()=>{ window.location.href=user.role==="admin"?"admin.html":"customer.html"; },500);
    });
  }

  document.querySelectorAll("[data-session-name]").forEach(el=>{ const s=getSession(); if(s) el.textContent=s.name; });
  document.querySelectorAll("[data-session-email]").forEach(el=>{ const s=getSession(); if(s) el.textContent=s.email; });
  document.querySelectorAll("[data-session-company]").forEach(el=>{ const s=getSession(); if(s) el.textContent=s.company||"Kurumsal Hesap"; });
  document.querySelectorAll("[data-logout]").forEach(el=>el.addEventListener("click",e=>{ e.preventDefault(); logout(); }));

  if(document.querySelector("[data-require-admin]")){
    bindTabs(".sidebar .menu");
    if(!supabaseClient){
      requireAuth("admin");
      renderAdminSummary(); renderUsersAdmin(); renderBalanceRequests();
    }
    renderOrdersAdmin(); bindAdminOrderForm();
    renderPackagesAdminEnhanced(); bindPackageCreateForm(); bindPackageShowcaseForm(); fillSettingsForm(); bindSettingsForm(); bindAdminChatForm(); renderAdminChats(); renderAdminAccounts(); bindAddAdminForm(); fillOwnAdminForm(); bindOwnAdminForm(); renderProfileRequestsAdmin(); renderPackageShowcaseCards();
  }
  if(document.querySelector("[data-require-customer]")){
    bindTabs(".sidebar .menu");
    if(!supabaseClient){
      requireAuth("customer");
      renderCustomerBalance(); renderCustomerRequests(); bindCustomerBalanceForm(); updateBalanceWhatsappButton();
    }
    renderCustomerOrders(); renderCustomerOrderTracking(); bindPackagePurchase(); bindCustomerChatForm(); renderCustomerChat(); bindProfileRequestForm(); renderPackageShowcaseCards(); renderActivePackages();
  }
});


const PROFILE_REQ_KEY="aurevia_profile_requests";

const TAB_STATE_KEY="aurevia_active_tabs";
function getTabState(){ return read(TAB_STATE_KEY, {}); }
function saveTabState(v){ write(TAB_STATE_KEY, v); }

function forceOpenMessagesTab(scope){
  const map = {
    "customer": {buttons: '.customer-tabs-content, .menu', target: 'messages'},
    "admin": {buttons: '.admin-tabs-content, .menu', target: 'messages'}
  };
  const btns = document.querySelectorAll(`[data-tab-btn="messages"]`);
  const secs = document.querySelectorAll(`[data-tab-section]`);
  btns.forEach(b=>b.classList.toggle("active", b.getAttribute("data-tab-btn")==="messages"));
  secs.forEach(s=>{
    if(s.getAttribute("data-tab-section")==="messages") s.classList.add("active");
    else s.classList.remove("active");
  });
}

function setActiveTab(scope, target){
  const buttons = document.querySelectorAll(`.${scope} [data-tab-btn]`);
  const sections = document.querySelectorAll(`.${scope}-content [data-tab-section]`);
  buttons.forEach(x=>x.classList.toggle("active", x.getAttribute("data-tab-btn")===target));
  sections.forEach(sec=>sec.classList.toggle("active", sec.getAttribute("data-tab-section")===target));
  const state=getTabState(); state[scope]=target; saveTabState(state);
}


function getProfileRequests(){ return read(PROFILE_REQ_KEY,[]); }
function saveProfileRequests(v){ write(PROFILE_REQ_KEY,v); }

function fileToDataUrlSafe(file, progressId){
  return new Promise((resolve,reject)=>{
    try{
      const reader=new FileReader();
      reader.onprogress=(e)=>{
        if(e.lengthComputable && progressId){
          const percent=Math.round((e.loaded/e.total)*100);
          const label=document.getElementById(progressId);
          const bar=document.getElementById(progressId+"Bar");
          if(label) label.textContent=`Yükleniyor: ${formatMb(e.loaded)} / ${formatMb(e.total)} (%${percent})`;
          if(bar && bar.firstElementChild) bar.firstElementChild.style.width=percent+"%";
        }
      };
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error("Dosya okunamadı"));
      reader.readAsDataURL(file);
    }catch(err){ reject(err); }
  });
}

function renderPackageShowcaseCards(){
  const mounts = document.querySelectorAll("[data-package-showcase]");
  if(!mounts.length) return;
  const pkgs = getPackages().filter(p=>p.active!==false);
  mounts.forEach(mount=>{
    mount.innerHTML = pkgs.length ? pkgs.map(p=>`
      <div class="price">
        <span class="pill">${p.name}</span>
        <h3>${p.name}</h3>
        <strong>${fmtMoney(p.price)}</strong>
        <p class="muted">${p.description||""}</p>
        ${(p.reviewTitle||p.reviewText||p.mediaImage||p.mediaVideo) ? `
        <div class="review-card-mini">
          ${p.reviewTitle ? `<strong>${p.reviewTitle}</strong>` : ``}
          ${p.reviewText ? `<div class="small" style="margin-top:6px">${p.reviewText}</div>` : ``}
          <div class="pkg-media">
            ${p.mediaImage ? `<img src="${p.mediaImage}" alt="">` : ``}
            ${p.mediaVideo ? `<video controls muted playsinline src="${p.mediaVideo}"></video>` : ``}
          </div>
        </div>` : ``}
      </div>`).join("") : '<div class="notice">Aktif paket yok.</div>';
  });
}


function renderPackagesAdminEnhanced(){
  const mount=document.getElementById("packagesList"); if(!mount) return;
  const items=getPackages(); mount.innerHTML="";
  items.forEach(pkg=>{
    const row=document.createElement("div"); row.className="item-row";
    row.innerHTML=`
      <div>
        <strong>${pkg.name}</strong>
        <div class="small">${fmtMoney(pkg.price)} • ${pkg.description||""}</div>
        <div class="small"><span class="badge ${pkg.active===false?"off":"ok"}">${pkg.active===false?"Pasif":"Aktif"}</span></div>
        ${(pkg.reviewTitle||pkg.reviewText||pkg.mediaImage||pkg.mediaVideo)?`<div class="small" style="margin-top:6px">Sunum eklendi</div>`:""}
      </div>
      <div class="item-actions">
        <button class="small-btn gold" data-edit="${pkg.id}">Düzenle</button>
        <button class="small-btn gold" data-showcase="${pkg.id}">Sunum</button>
        <button class="small-btn ${pkg.active===false?"green":"red"}" data-toggle-pkg="${pkg.id}">${pkg.active===false?"Aktif Et":"Pasif Et"}</button>
        <button class="small-btn red" data-delete-pkg="${pkg.id}">Sil</button>
      </div>`;
    mount.appendChild(row);
  });

  mount.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-edit"); const pkgs=getPackages(); const pkg=pkgs.find(x=>x.id===id); if(!pkg) return;
    const name=prompt("Paket adı",pkg.name); if(!name) return;
    const price=Number(prompt("Paket fiyatı",pkg.price)); const desc=prompt("Açıklama",pkg.description||"");
    pkg.name=name; pkg.price=price||pkg.price; pkg.description=desc;
    savePackages(pkgs); renderPackagesAdminEnhanced(); fillOrderFormOptions?.(); renderPricingCards?.(); renderPackageShowcaseCards();
  }));

  mount.querySelectorAll("[data-showcase]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-showcase");
    const input=document.getElementById("pkgShowcaseTarget");
    if(input) input.value=id;
    const form=document.getElementById("pkgShowcaseForm");
    const pkgs=getPackages(); const pkg=pkgs.find(x=>x.id===id); if(!pkg||!form) return;
    form.reviewTitle.value=pkg.reviewTitle||"";
    form.reviewText.value=pkg.reviewText||"";
    form.mediaImage.value=pkg.mediaImage||"";
    form.mediaVideo.value=pkg.mediaVideo||"";
    form.scrollIntoView({behavior:"smooth", block:"center"});
  }));

  mount.querySelectorAll("[data-toggle-pkg]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-toggle-pkg"); const pkgs=getPackages(); const pkg=pkgs.find(x=>x.id===id); if(!pkg) return;
    pkg.active=pkg.active===false?true:false; savePackages(pkgs); renderPackagesAdminEnhanced(); fillOrderFormOptions?.(); renderPricingCards?.(); renderPackageShowcaseCards();
  }));

  mount.querySelectorAll("[data-delete-pkg]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-delete-pkg"); if(!confirm("Bu paket silinsin mi?")) return;
    savePackages(getPackages().filter(p=>p.id!==id)); renderPackagesAdminEnhanced(); fillOrderFormOptions?.(); renderPricingCards?.(); renderPackageShowcaseCards();
  }));
}
async function bindPackageShowcaseForm(){
  const form=document.getElementById("pkgShowcaseForm"); if(!form || form.dataset.bound==="1") return;
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const id=document.getElementById("pkgShowcaseTarget")?.value;
    const pkgs=getPackages(); const pkg=pkgs.find(x=>x.id===id); if(!pkg){ alert("Önce bir paket seç."); return; }
    pkg.reviewTitle=form.reviewTitle.value.trim();
    pkg.reviewText=form.reviewText.value.trim();
    pkg.mediaImage=form.mediaImage.value.trim();
    pkg.mediaVideo=form.mediaVideo.value.trim();

    const imgFile=form.mediaImageFile.files && form.mediaImageFile.files[0];
    const vidFile=form.mediaVideoFile.files && form.mediaVideoFile.files[0];

    if(imgFile){
      pkg.mediaImage = await fileToDataUrlSafe(imgFile, "pkgImageUploadInfo");
      form.mediaImageFile.value="";
    }
    if(vidFile){
      try{
        pkg.mediaVideo = await fileToDataUrlSafe(vidFile, "pkgVideoUploadInfo");
        form.mediaVideoFile.value="";
      }catch(err){
        console.error(err);
        alert("Video yüklenemedi. Dosya büyük olabilir.");
      }
    }

    savePackages(pkgs);
    renderPackagesAdminEnhanced(); renderPricingCards?.(); renderPackageShowcaseCards();
    alert("Paket sunumu kaydedildi.");
  });
  form.dataset.bound="1";
}

function bindProfileRequestForm(){
  const form=document.getElementById("profileRequestForm"); if(!form || form.dataset.bound==="1") return;
  const s=getSession(); if(!s) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const reqs=getProfileRequests();
    reqs.push({
      id:"pr_"+Date.now(),
      userEmail:s.email,
      userName:s.name,
      newEmail:data.newEmail || "",
      newPhone:data.newPhone || "",
      newPassword:data.newPassword || "",
      status:"pending",
      date:currentDateTR()
    });
    saveProfileRequests(reqs);
    const msg=document.getElementById("profileRequestMsg");
    if(msg) showMessage(msg,"Profil güncelleme talebi tüm adminlere gönderildi.");
    form.reset();
    alert("Talep gönderildi.");
  });
  form.dataset.bound="1";
}

function renderProfileRequestsAdmin(){
  const mount=document.getElementById("profileRequestsList"); if(!mount) return;
  const reqs=getProfileRequests(); mount.innerHTML="";
  if(!reqs.length){ mount.innerHTML='<div class="status-note">Profil değişiklik talebi yok.</div>'; return; }
  reqs.slice().reverse().forEach(req=>{
    const row=document.createElement("div"); row.className="item-row";
    row.innerHTML=`
      <div>
        <strong>${req.userName}</strong>
        <div class="small">Hesap: ${req.userEmail}</div>
        <div class="small">Yeni e-posta: ${req.newEmail || "-"} • Yeni telefon: ${req.newPhone || "-"}</div>
        <div class="small">Durum: ${req.status}</div>
      </div>
      <div class="item-actions">
        ${req.status==="pending" ? `<button class="small-btn green" data-approve-profile="${req.id}">Onayla</button><button class="small-btn red" data-reject-profile="${req.id}">Reddet</button>` : ``}
      </div>`;
    mount.appendChild(row);
  });
  mount.querySelectorAll("[data-approve-profile]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-approve-profile");
    const reqs=getProfileRequests(); const req=reqs.find(r=>r.id===id); if(!req) return;
    const users=getUsers(); const user=users.find(u=>u.email===req.userEmail); if(!user) return;
    if(req.newEmail && req.newEmail !== user.email){
      if(users.some(u=>u.email.toLowerCase()===req.newEmail.toLowerCase() && u.email!==user.email)){
        alert("Yeni e-posta başka kullanıcıda var."); return;
      }
      user.email=req.newEmail;
    }
    user.phone=req.newPhone || user.phone || "";
    if(req.newPassword) user.password=req.newPassword;
    saveUsers(users);
    req.status="approved"; saveProfileRequests(reqs);
    renderProfileRequestsAdmin(); renderUsersAdmin?.(); alert("Talep onaylandı.");
  }));
  mount.querySelectorAll("[data-reject-profile]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.getAttribute("data-reject-profile");
    const reqs=getProfileRequests(); const req=reqs.find(r=>r.id===id); if(!req) return;
    req.status="rejected"; saveProfileRequests(reqs); renderProfileRequestsAdmin(); alert("Talep reddedildi.");
  }));
}


/* v26 customer/admin recovery patch */

function renderCustomerBalance(){
  const s=getSession();
  if(!s) return;
  const users=getUsers();
  const me=users.find(u=>u.email===s.email) || {};
  const balance = Number(me.balance || 0);
  const a=document.getElementById("customerBalance");
  const b=document.getElementById("customerBalanceMini");
  if(a) a.textContent = fmtMoney(balance);
  if(b) b.textContent = fmtMoney(balance);
}

function renderCustomerRequests(){
  const mount=document.getElementById("customerRequests");
  const s=getSession();
  if(!mount || !s) return;
  const items=getRequests().filter(r=>r.userEmail===s.email).slice().reverse();
  if(!items.length){
    mount.innerHTML='<div class="status-note">Henüz gönderilmiş bakiye talebin yok.</div>';
    return;
  }
  mount.innerHTML = items.map(req=>`
    <div class="item-row">
      <div>
        <strong>${fmtMoney(req.amount)}</strong>
        <div class="small">Temsilci: ${req.representative || getSettings().representativeName}</div>
        <div class="small">Telefon: ${req.phone || "-"}</div>
      </div>
      <div class="badge ${req.status==="approved"?"ok":req.status==="rejected"?"off":"warn"}">
        ${req.status==="approved"?"Onaylandı":req.status==="rejected"?"Reddedildi":"Bekliyor"}
      </div>
    </div>
  `).join("");
}


function updateBalanceWhatsappButton(){
  const btn=document.getElementById("balanceWhatsappBtn");
  const s=getSession();
  if(!btn || !s) return;
  const displayName=(s.name || s.company || "Kullanıcı").trim();
  const text=`Merhaba, ben ${displayName}. Bakiye yüklemek istiyorum.`;
  btn.href=`https://wa.me/4915124302375?text=${encodeURIComponent(text)}`;
}

function bindCustomerBalanceForm(){
  const form=document.getElementById("balanceRequestForm");
  if(!form || form.dataset.bound==="1") return;
  const rep=form.querySelector('[name="representative"]');
  if(rep && !rep.value) rep.value = getSettings().representativeName || "Yasin";
  form.addEventListener("submit", e=>{
    if(supabaseClient){
      return;
    }
    e.preventDefault();
    const s=getSession();
    if(!s) return;
    const amount=Number(form.querySelector('[name="amount"]')?.value || 0);
    const representative=form.querySelector('[name="representative"]')?.value || getSettings().representativeName || "Yasin";
    const phone=form.querySelector('[name="phone"]')?.value || "";
    if(!amount || amount<=0){ alert("Geçerli tutar gir."); return; }
    const reqs=getRequests();
    reqs.push({
      id:"req_"+Date.now(),
      userEmail:s.email,
      userName:s.name,
      amount,
      representative,
      phone,
      status:"pending",
      createdAt:new Date().toISOString(),
      date:currentDateTR()
    });
    saveRequests(reqs);
    const msg=document.getElementById("balanceRequestMsg");
    if(msg) showMessage(msg, "Talep gönderildi.");
    form.reset();
    if(rep) rep.value = getSettings().representativeName || "Yasin";
    renderCustomerRequests();
    renderBalanceRequests?.();
    renderAdminSummary?.();
  });
  form.dataset.bound="1";
}

function renderCustomerOrders(){
  const tbody=document.getElementById("customerOrdersTableBody");
  const s=getSession();
  if(!tbody || !s) return;
  if(typeof supabaseClient !== "undefined" && supabaseClient) return;
  const key = s.company || s.name;
  const orders=getOrders().filter(o=>o.customerEmail===s.email || o.customer===key).slice().reverse();
  if(!orders.length){
    tbody.innerHTML='<tr><td colspan="5">Henüz siparişin yok.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(order=>`
    <tr>
      <td>${order.packageName}</td>
      <td>${fmtMoney(order.amount)}</td>
      <td><span class="badge ${order.status==="Tamamlandı"?"ok":order.status==="Beklemede"?"warn":"off"}">${order.status}</span></td>
      <td>${order.stage || "-"}</td>
      <td>${order.date || "-"}</td>
    </tr>
  `).join("");
}

function renderCustomerOrderTracking(){
  const mount=document.getElementById("orderTracking");
  const s=getSession();
  if(!mount || !s) return;
  if(typeof supabaseClient !== "undefined" && supabaseClient) return;
  const key = s.company || s.name;
  const orders=getOrders().filter(o=>o.customerEmail===s.email || o.customer===key);
  if(!orders.length){
    mount.innerHTML='<div class="status-note">Takip edilecek sipariş yok.</div>';
    return;
  }
  const latest = orders[orders.length-1];
  const timeline = latest.timeline || [latest.stage || "Sipariş alındı"];
  mount.innerHTML = `
    <div class="preview-box">
      <strong>${latest.packageName}</strong>
      <div class="small">Son durum: ${latest.stage || "-"}</div>
      <div class="timeline">
        ${timeline.map((t,i)=>`<div class="timeline-item ${i===timeline.length-1?'active':''}">${t}</div>`).join("")}
      </div>
    </div>
  `;
}

function bindPackagePurchase(){
  if(typeof supabaseClient !== "undefined" && supabaseClient) return;
  const form=document.getElementById("packageBuyForm");
  if(!form || form.dataset.bound==="1") return;
  const select=form.querySelector('select[name="packageId"]');
  const refill=()=>{
    const pkgs=getPackages().filter(p=>p.active!==false);
    if(select){
      select.innerHTML = pkgs.length
        ? pkgs.map(p=>`<option value="${p.id}">${p.name} - ${fmtMoney(p.price)}</option>`).join("")
        : '<option value="">Paket yok</option>';
    }
  };
  refill();
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const s=getSession();
    if(!s) return;
    const users=getUsers();
    const me=users.find(u=>u.email===s.email);
    if(!me){ alert("Kullanıcı bulunamadı."); return; }
    const pkg=getPackages().find(p=>p.id===select?.value);
    if(!pkg){ alert("Paket seç."); return; }
    if(Number(me.balance||0) < Number(pkg.price||0)){
      const msg=document.getElementById("buyPkgMsg");
      if(msg) showMessage(msg, "Yetersiz bakiye.", false);
      return;
    }
    me.balance = Number(me.balance||0) - Number(pkg.price||0);
    saveUsers(users);
    setSession(me);
    const orders=getOrders();
    orders.push({
      id:"ord_"+Date.now(),
      customer: me.company || me.name,
      customerEmail: me.email,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: Number(pkg.price||0),
      status:"Beklemede",
      stage:"Sipariş alındı",
      timeline:["Sipariş alındı"],
      date: currentDateTR()
    });
    saveOrders(orders);
    const msg=document.getElementById("buyPkgMsg");
    if(msg) showMessage(msg, "Paket satın alındı.");
    renderCustomerBalance();
    renderCustomerOrders();
    renderCustomerOrderTracking();
    renderOrdersAdmin?.();
  });
  form.dataset.bound="1";
}

function renderCustomerChat(){
  const s=getSession();
  const mount=document.getElementById("customerChatMessages");
  if(!s || !mount) return;
  if(typeof supabaseClient !== "undefined" && supabaseClient) return;
  const msgs=getChats().filter(c=>c.userEmail===s.email).slice().sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
  if(!msgs.length){
    mount.innerHTML='<div class="status-note">Henüz mesaj yok.</div>';
  }else{
    mount.innerHTML = msgs.map(m=>`
      <div class="chat-msg ${m.senderRole==='admin'?'admin':'user'}">
        <div class="chat-head">
          <strong>${m.senderRole==='admin' ? 'Admin Mesajı' : 'Senin Mesajın'}</strong>
          <span class="small">${m.date}</span>
        </div>
        <div>${m.text}</div>
      </div>
    `).join("");
    mount.scrollTop = mount.scrollHeight;
  }
}

function bindCustomerChatForm(){
  const form=document.getElementById("customerChatForm");
  if(!form || form.dataset.bound==="1") return;
  form.addEventListener("submit", function(e){
    if(supabaseClient){
      return;
    }
    e.preventDefault();
    const s=getSession();
    if(!s){ alert("Oturum bulunamadı."); return; }
    const textarea=form.querySelector('textarea[name="text"]');
    const text=(textarea?.value || "").trim();
    if(!text) return;
    const chats=getChats();
    chats.push({
      id:"msg_"+Date.now(),
      userEmail:s.email,
      senderRole:"user",
      senderName:s.name || "Kullanıcı",
      text:text,
      date:currentDateTR(),
      createdAt:new Date().toISOString()
    });
    saveChats(chats);
    if(textarea) textarea.value="";
    renderCustomerChat();
    renderAdminChats();
    updateUnreadBadges?.();
    const ok=document.getElementById("customerChatStatus");
    if(ok){ ok.textContent="Mesaj gönderildi."; ok.className="msg ok"; }
    const btn=document.querySelector('[data-tab-btn="messages"]');
    btn?.click();
  });
  form.dataset.bound="1";
}

function renderChatThread(email,isAdmin=false){
  const chatMount=document.getElementById(isAdmin ? "chatMessages" : "customerChatMessages");
  if(!chatMount) return;
  const msgs=getChats().filter(c=>c.userEmail===email).slice().sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
  if(!msgs.length){
    chatMount.innerHTML='<div class="status-note">Henüz mesaj yok.</div>';
    return;
  }
  chatMount.innerHTML = msgs.map(m=>`
    <div class="chat-msg ${m.senderRole==='admin'?'admin':'user'}">
      <div class="chat-head">
        <strong>${m.senderRole==='admin' ? 'Admin Mesajı' : 'Kullanıcı Mesajı'}</strong>
        <span class="small">${m.date}</span>
      </div>
      <div>${m.text}</div>
    </div>`).join("");
  chatMount.scrollTop = chatMount.scrollHeight;
}

function renderAdminChats(){
  const usersMount=document.getElementById("chatUsers");
  const chatMount=document.getElementById("chatMessages");
  const targetSelect=document.getElementById("adminChatTargetSelect");
  if(!usersMount || !chatMount) return;
  if(typeof supabaseClient !== "undefined" && supabaseClient) return;

  const users=getUsers().filter(u=>u.role==="customer");
  const chats=getChats();

  if(targetSelect){
    targetSelect.innerHTML = users.length
      ? users.map(u=>`<option value="${u.email}">${u.name} - ${u.email}</option>`).join("")
      : '<option value="">Kullanıcı yok</option>';
  }

  if(!users.length){
    usersMount.innerHTML='<div class="status-note">Henüz müşteri yok.</div>';
    chatMount.innerHTML='<div class="status-note">Mesaj geçmişi burada görünecek.</div>';
    return;
  }

  usersMount.innerHTML = users.map(u=>{
    const userChats=chats.filter(c=>c.userEmail===u.email);
    const unread=userChats.filter(c=>c.senderRole==="user").length;
    const lastMsg=[...userChats].reverse()[0];
    return `<div class="item-row">
      <div>
        <strong>${u.name}</strong>
        <div class="small">${u.email}</div>
        <div class="small">${lastMsg ? lastMsg.text.slice(0,40) : 'Mesaj yok'}</div>
      </div>
      <div class="item-actions">
        <button class="small-btn gold" data-open-chat="${u.email}">Aç ${unread?`<span class="notify-pill">${unread}</span>`:""}</button>
      </div>
    </div>`;
  }).join("");

  usersMount.querySelectorAll("[data-open-chat]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-open-chat");
    if(targetSelect) targetSelect.value=email;
    renderChatThread(email,true);
  }));

  const fallback = (targetSelect && targetSelect.value) ? targetSelect.value : users[0].email;
  if(targetSelect) targetSelect.value=fallback;
  renderChatThread(fallback,true);
}

function bindAdminChatForm(){
  const form=document.getElementById("adminChatForm");
  if(!form || form.dataset.bound==="1") return;

  form.addEventListener("submit", function(e){
    e.preventDefault();
    e.stopPropagation();

    const targetSelect=form.querySelector('select[name="targetSelect"]');
    const textArea=form.querySelector('textarea[name="text"]');

    const target=(targetSelect?.value || "").trim();
    const text=(textArea?.value || "").trim();

    if(!target){
      alert("Önce kullanıcı seç.");
      return;
    }
    if(!text){
      alert("Mesaj yaz.");
      return;
    }

    const s=getSession();
    if(!s){
      alert("Oturum bulunamadı.");
      return;
    }

    const chats=getChats();
    chats.push({
      id:"msg_"+Date.now(),
      userEmail:target,
      senderRole:"admin",
      senderName:s.name || "Admin",
      text:text,
      date:currentDateTR(),
      createdAt:new Date().toISOString()
    });
    saveChats(chats);

    if(textArea) textArea.value="";

    renderAdminChats();
    renderChatThread(target,true);
    updateUnreadBadges?.();

    const ok=document.getElementById("adminChatStatus");
    if(ok){
      ok.textContent="Mesaj gönderildi.";
      ok.className="msg ok";
    }
    alert("Mesaj gönderildi.");
  });

  form.dataset.bound="1";
}


/* v28 admin chat hard fix */
function getAdminChatUsers(){
  const users = getUsers().filter(u=>u.role==="customer").map(u=>({email:u.email,name:u.name||u.company||u.email}));
  const chats = getChats();
  const seen = new Set(users.map(u=>u.email));
  chats.forEach(c=>{
    if(c.userEmail && !seen.has(c.userEmail)){
      users.push({email:c.userEmail,name:c.senderRole==="user" ? (c.senderName||c.userEmail) : c.userEmail});
      seen.add(c.userEmail);
    }
  });
  return users;
}

function renderAdminChats(){
  const usersMount=document.getElementById("chatUsers");
  const chatMount=document.getElementById("chatMessages");
  const targetSelect=document.getElementById("adminChatTargetSelect");
  if(!usersMount || !chatMount) return;
  if(typeof supabaseClient !== "undefined" && supabaseClient) return;

  const users=getAdminChatUsers();
  const chats=getChats();

  if(targetSelect){
    targetSelect.innerHTML = users.length
      ? users.map(u=>`<option value="${u.email}">${u.name} - ${u.email}</option>`).join("")
      : '<option value="">Kullanıcı yok</option>';
  }

  if(!users.length){
    usersMount.innerHTML='<div class="status-note">Henüz müşteri veya mesaj yok.</div>';
    chatMount.innerHTML='<div class="status-note">Mesaj geçmişi burada görünecek.</div>';
    return;
  }

  usersMount.innerHTML = users.map(u=>{
    const userChats=chats.filter(c=>c.userEmail===u.email);
    const unread=userChats.filter(c=>c.senderRole==="user").length;
    const lastMsg=[...userChats].reverse()[0];
    return `<div class="item-row">
      <div>
        <strong>${u.name}</strong>
        <div class="small">${u.email}</div>
        <div class="small">${lastMsg ? lastMsg.text.slice(0,40) : 'Mesaj yok'}</div>
      </div>
      <div class="item-actions">
        <button class="small-btn gold" data-open-chat="${u.email}">Aç ${unread?`<span class="notify-pill">${unread}</span>`:""}</button>
      </div>
    </div>`;
  }).join("");

  usersMount.querySelectorAll("[data-open-chat]").forEach(btn=>btn.addEventListener("click",()=>{
    const email=btn.getAttribute("data-open-chat");
    if(targetSelect) targetSelect.value=email;
    renderChatThread(email,true);
    const ok=document.getElementById("adminChatStatus");
    if(ok){ ok.textContent="Sohbet açıldı."; ok.className="msg ok"; }
  }));

  const fallback = (targetSelect && targetSelect.value) ? targetSelect.value : users[0].email;
  if(targetSelect) targetSelect.value=fallback;
  renderChatThread(fallback,true);
}

function bindCustomerChatForm(){
  const form=document.getElementById("customerChatForm");
  if(!form) return;
  form.onsubmit = function(e){
    e.preventDefault();
    const s=getSession();
    if(!s){ alert("Oturum bulunamadı."); return false; }
    const textarea=form.querySelector('textarea[name="text"]');
    const text=(textarea?.value || "").trim();
    if(!text) return false;
    const chats=getChats();
    chats.push({
      id:"msg_"+Date.now(),
      userEmail:s.email,
      senderRole:"user",
      senderName:s.name || "Kullanıcı",
      text:text,
      date:currentDateTR(),
      createdAt:new Date().toISOString()
    });
    saveChats(chats);
    if(textarea) textarea.value="";
    renderCustomerChat();
    const ok=document.getElementById("customerChatStatus");
    if(ok){ ok.textContent="Mesaj gönderildi."; ok.className="msg ok"; }
    const msgBtn=document.querySelector('[data-tab-btn="messages"]');
    if(msgBtn) msgBtn.click();
    return false;
  };
}

function bindAdminChatForm(){
  const form=document.getElementById("adminChatForm");
  if(!form) return;
  form.onsubmit = function(e){
    e.preventDefault();
    const targetSelect=form.querySelector('select[name="targetSelect"]');
    const textArea=form.querySelector('textarea[name="text"]');
    const target=(targetSelect?.value || "").trim();
    const text=(textArea?.value || "").trim();
    if(!target){ alert("Önce kullanıcı seç."); return false; }
    if(!text){ alert("Mesaj yaz."); return false; }
    const s=getSession();
    if(!s){ alert("Oturum bulunamadı."); return false; }
    const chats=getChats();
    chats.push({
      id:"msg_"+Date.now(),
      userEmail:target,
      senderRole:"admin",
      senderName:s.name || "Admin",
      text:text,
      date:currentDateTR(),
      createdAt:new Date().toISOString()
    });
    saveChats(chats);
    if(textArea) textArea.value="";
    renderAdminChats();
    renderChatThread(target,true);
    const ok=document.getElementById("adminChatStatus");
    if(ok){ ok.textContent="Mesaj gönderildi."; ok.className="msg ok"; }
    return false;
  };
}


/* ===== v29 FINAL CHAT OVERRIDES ===== */
window.getAdminChatUsers = function(){
  const users = [];
  const seen = new Set();
  try{
    getUsers().forEach(u=>{
      if(u.role === "customer" && u.email && !seen.has(u.email)){
        users.push({email:u.email, name:u.name || u.company || u.email});
        seen.add(u.email);
      }
    });
  }catch(e){}
  try{
    getChats().forEach(c=>{
      if(c.userEmail && !seen.has(c.userEmail)){
        users.push({email:c.userEmail, name:c.senderRole === "user" ? (c.senderName || c.userEmail) : c.userEmail});
        seen.add(c.userEmail);
      }
    });
  }catch(e){}
  return users;
};

window.renderChatThread = function(email, isAdmin=false){
  const mount = document.getElementById(isAdmin ? "chatMessages" : "customerChatMessages");
  if(!mount) return;
  let msgs = [];
  try{
    msgs = getChats().filter(c => c.userEmail === email).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
  }catch(e){}
  if(!msgs.length){
    mount.innerHTML = '<div class="status-note">Henüz mesaj yok.</div>';
    return;
  }
  mount.innerHTML = msgs.map(m => `
    <div class="chat-msg ${m.senderRole === 'admin' ? 'admin' : 'user'}">
      <div class="chat-head">
        <strong>${isAdmin ? (m.senderRole === 'admin' ? 'Senin Mesajın' : 'Kullanıcı Mesajı') : (m.senderRole === 'admin' ? 'Admin Mesajı' : 'Senin Mesajın')}</strong>
        <span class="small">${m.date || ''}</span>
      </div>
      <div>${m.text || ''}</div>
    </div>
  `).join("");
  mount.scrollTop = mount.scrollHeight;
};

window.renderCustomerChat = function(){
  const s = getSession && getSession();
  const mount = document.getElementById("customerChatMessages");
  if(!s || !mount) return;
  window.renderChatThread(s.email, false);
};

window.renderAdminChats = function(){
  const usersMount = document.getElementById("chatUsers");
  const chatMount = document.getElementById("chatMessages");
  const targetSelect = document.getElementById("adminChatTargetSelect");
  if(!usersMount || !chatMount) return;

  const users = window.getAdminChatUsers();
  let chats = [];
  try{ chats = getChats(); }catch(e){}

  if(targetSelect){
    targetSelect.innerHTML = users.length
      ? users.map(u => `<option value="${u.email}">${u.name} - ${u.email}</option>`).join("")
      : '<option value="">Kullanıcı yok</option>';
  }

  if(!users.length){
    usersMount.innerHTML = '<div class="status-note">Henüz müşteri veya mesaj yok.</div>';
    chatMount.innerHTML = '<div class="status-note">Mesaj geçmişi burada görünecek.</div>';
    return;
  }

  usersMount.innerHTML = users.map(u=>{
    const userChats = chats.filter(c => c.userEmail === u.email);
    const lastMsg = userChats.length ? userChats[userChats.length-1] : null;
    return `
      <div class="item-row">
        <div>
          <strong>${u.name}</strong>
          <div class="small">${u.email}</div>
          <div class="small">${lastMsg ? (lastMsg.text || '').slice(0,40) : 'Mesaj yok'}</div>
        </div>
        <div class="item-actions">
          <button class="small-btn gold" data-open-chat="${u.email}">Aç</button>
        </div>
      </div>
    `;
  }).join("");

  usersMount.querySelectorAll("[data-open-chat]").forEach(btn=>{
    btn.onclick = function(){
      const email = btn.getAttribute("data-open-chat");
      if(targetSelect) targetSelect.value = email;
      window.renderChatThread(email, true);
      const ok = document.getElementById("adminChatStatus");
      if(ok){ ok.textContent = "Sohbet açıldı."; ok.className = "msg ok"; }
    };
  });

  const activeEmail = (targetSelect && targetSelect.value) ? targetSelect.value : users[0].email;
  if(targetSelect) targetSelect.value = activeEmail;
  window.renderChatThread(activeEmail, true);
};

window.bindCustomerChatForm = function(){
  const form = document.getElementById("customerChatForm");
  if(!form) return;
  form.onsubmit = function(e){
    e.preventDefault();
    const s = getSession && getSession();
    if(!s){ alert("Oturum bulunamadı."); return false; }
    const ta = form.querySelector('textarea[name="text"]');
    const text = (ta && ta.value || "").trim();
    if(!text) return false;

    const chats = getChats();
    chats.push({
      id: "msg_" + Date.now(),
      userEmail: s.email,
      senderRole: "user",
      senderName: s.name || "Kullanıcı",
      text: text,
      date: currentDateTR(),
      createdAt: new Date().toISOString()
    });
    saveChats(chats);

    if(ta) ta.value = "";
    window.renderCustomerChat();

    const ok = document.getElementById("customerChatStatus");
    if(ok){ ok.textContent = "Mesaj gönderildi."; ok.className = "msg ok"; }

    const btn = document.querySelector('[data-tab-btn="messages"]');
    if(btn) btn.click();
    return false;
  };
};

window.bindAdminChatForm = function(){
  const form = document.getElementById("adminChatForm");
  if(!form) return;
  form.onsubmit = function(e){
    e.preventDefault();
    const targetSelect = document.getElementById("adminChatTargetSelect");
    const ta = form.querySelector('textarea[name="text"]');
    const target = (targetSelect && targetSelect.value || "").trim();
    const text = (ta && ta.value || "").trim();

    if(!target){ alert("Önce kullanıcı seç."); return false; }
    if(!text){ alert("Mesaj yaz."); return false; }

    const s = getSession && getSession();
    if(!s){ alert("Oturum bulunamadı."); return false; }

    const chats = getChats();
    chats.push({
      id: "msg_" + Date.now(),
      userEmail: target,
      senderRole: "admin",
      senderName: s.name || "Admin",
      text: text,
      date: currentDateTR(),
      createdAt: new Date().toISOString()
    });
    saveChats(chats);

    if(ta) ta.value = "";
    window.renderAdminChats();

    const ok = document.getElementById("adminChatStatus");
    if(ok){ ok.textContent = "Mesaj gönderildi."; ok.className = "msg ok"; }

    return false;
  };
};

window.initFinalChatFix = function(){
  try{ window.bindCustomerChatForm(); }catch(e){ console.error(e); }
  try{ window.bindAdminChatForm(); }catch(e){ console.error(e); }
  try{ window.renderCustomerChat(); }catch(e){ console.error(e); }
  try{ window.renderAdminChats(); }catch(e){ console.error(e); }

  document.querySelectorAll('[data-tab-btn="messages"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      try{ window.renderCustomerChat(); }catch(e){}
      try{ window.renderAdminChats(); }catch(e){}
    });
  });
};

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    try{ window.initFinalChatFix(); }catch(e){ console.error(e); }
  }, 50);
});
/* ===== end v29 ===== */


/* ===== v30 PROFILE REQUEST FIX ===== */
window.bindProfileRequestForm = function(){
  const form = document.getElementById("profileRequestForm");
  if(!form) return;
  form.onsubmit = function(e){
    e.preventDefault();
    const s = getSession && getSession();
    if(!s){ alert("Oturum bulunamadı."); return false; }

    const newEmail = (form.querySelector('[name="newEmail"]')?.value || "").trim();
    const newPhone = (form.querySelector('[name="newPhone"]')?.value || "").trim();
    const newPassword = (form.querySelector('[name="newPassword"]')?.value || "").trim();

    if(!newEmail && !newPhone && !newPassword){
      alert("En az bir alan doldur.");
      return false;
    }

    const reqs = getProfileRequests ? getProfileRequests() : [];
    reqs.push({
      id: "pr_" + Date.now(),
      userEmail: s.email,
      userName: s.name || "Kullanıcı",
      newEmail: newEmail,
      newPhone: newPhone,
      newPassword: newPassword,
      status: "pending",
      date: currentDateTR(),
      createdAt: new Date().toISOString()
    });

    saveProfileRequests(reqs);

    const msg = document.getElementById("profileRequestMsg");
    if(msg){
      msg.textContent = "Profil talebi gönderildi.";
      msg.className = "msg ok";
    }

    form.reset();
    alert("Profil talebi gönderildi.");
    return false;
  };
};

window.renderProfileRequestsAdmin = function(){
  const mount = document.getElementById("profileRequestsList");
  if(!mount) return;

  const reqs = (getProfileRequests ? getProfileRequests() : []).slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

  if(!reqs.length){
    mount.innerHTML = '<div class="status-note">Profil değişiklik talebi yok.</div>';
    return;
  }

  mount.innerHTML = reqs.map(req => `
    <div class="item-row">
      <div>
        <strong>${req.userName}</strong>
        <div class="small">Hesap: ${req.userEmail}</div>
        <div class="small">Yeni e-posta: ${req.newEmail || "-"} • Yeni telefon: ${req.newPhone || "-"}</div>
        <div class="small">Şifre değişimi: ${req.newPassword ? "Var" : "Yok"} • Durum: ${req.status}</div>
      </div>
      <div class="item-actions">
        ${req.status === "pending" ? `
          <button class="small-btn green" data-approve-profile="${req.id}">Onayla</button>
          <button class="small-btn red" data-reject-profile="${req.id}">Reddet</button>
        ` : ``}
      </div>
    </div>
  `).join("");

  mount.querySelectorAll("[data-approve-profile]").forEach(btn=>{
    btn.onclick = function(){
      const id = btn.getAttribute("data-approve-profile");
      const reqs = getProfileRequests();
      const req = reqs.find(r=>r.id===id);
      if(!req) return;

      const users = getUsers();
      const user = users.find(u=>u.email===req.userEmail);
      if(!user){
        alert("Kullanıcı bulunamadı.");
        return;
      }

      if(req.newEmail && req.newEmail !== user.email){
        const exists = users.some(u=>u.email.toLowerCase()===req.newEmail.toLowerCase() && u.email!==user.email);
        if(exists){
          alert("Yeni e-posta başka hesapta kullanılıyor.");
          return;
        }
        user.email = req.newEmail;
      }

      if(req.newPhone) user.phone = req.newPhone;
      if(req.newPassword) user.password = req.newPassword;

      saveUsers(users);
      req.status = "approved";
      saveProfileRequests(reqs);

      renderProfileRequestsAdmin();
      try{ renderUsersAdmin(); }catch(e){}
      alert("Profil talebi onaylandı.");
    };
  });

  mount.querySelectorAll("[data-reject-profile]").forEach(btn=>{
    btn.onclick = function(){
      const id = btn.getAttribute("data-reject-profile");
      const reqs = getProfileRequests();
      const req = reqs.find(r=>r.id===id);
      if(!req) return;
      req.status = "rejected";
      saveProfileRequests(reqs);
      renderProfileRequestsAdmin();
      alert("Profil talebi reddedildi.");
    };
  });
};

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    try{ window.bindProfileRequestForm(); }catch(e){ console.error(e); }
    try{ window.renderProfileRequestsAdmin(); }catch(e){ console.error(e); }
    document.querySelectorAll('[data-tab-btn="profileReq"], [data-tab-btn="profileReqs"]').forEach(btn=>{
      btn.addEventListener("click", function(){
        try{ window.bindProfileRequestForm(); }catch(e){}
        try{ window.renderProfileRequestsAdmin(); }catch(e){}
      });
    });
  }, 60);
});
/* ===== end v30 ===== */


/* ===== v31 ACTIVE PACKAGES ===== */
window.renderActivePackages = function(){
  const mount = document.getElementById("activePackagesList");
  const s = getSession && getSession();
  if(!mount || !s) return;

  const key = s.company || s.name;
  const orders = (getOrders ? getOrders() : []).filter(o =>
    (o.customerEmail && o.customerEmail === s.email) || o.customer === key
  );

  const active = orders.filter(o => o.status !== "İptal");

  if(!active.length){
    mount.innerHTML = '<div class="status-note">Henüz aktif paketin yok.</div>';
    return;
  }

  mount.innerHTML = active.slice().reverse().map(pkg => `
    <div class="item-row">
      <div>
        <strong>${pkg.packageName}</strong>
        <div class="small">Tutar: ${fmtMoney(pkg.amount)}</div>
        <div class="small">Son durum: ${pkg.stage || "-"}</div>
        <div class="small">Tarih: ${pkg.date || "-"}</div>
      </div>
      <div>
        <span class="badge ${pkg.status==="Tamamlandı"?"ok":pkg.status==="Beklemede"?"warn":"off"}">${pkg.status}</span>
      </div>
    </div>
  `).join("");
};

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    try{ window.renderActivePackages(); }catch(e){ console.error(e); }
    document.querySelectorAll('[data-tab-btn="activePackages"]').forEach(btn=>{
      btn.addEventListener("click", function(){
        try{ window.renderActivePackages(); }catch(e){}
      });
    });
  }, 70);
});
/* ===== end v31 ===== */


/* ===== v32 TRUE UNREAD MESSAGE BADGES ===== */
window.ensureLastReadStorage = function(){
  if(!localStorage.getItem("aurevia_last_read")){
    localStorage.setItem("aurevia_last_read", JSON.stringify({}));
  }
};
window.getLastReadMap = function(){
  try{ return JSON.parse(localStorage.getItem("aurevia_last_read") || "{}"); }catch(e){ return {}; }
};
window.setLastReadMap = function(map){
  localStorage.setItem("aurevia_last_read", JSON.stringify(map || {}));
};
window.markCustomerMessagesRead = function(email){
  const map = window.getLastReadMap();
  map["customer:"+email] = Date.now();
  window.setLastReadMap(map);
};
window.markAdminMessagesRead = function(email){
  const map = window.getLastReadMap();
  map["admin:"+email] = Date.now();
  window.setLastReadMap(map);
};
window.getCustomerUnreadCount = function(email){
  const chats = getChats ? getChats() : [];
  const map = window.getLastReadMap();
  const last = map["customer:"+email] || 0;
  return chats.filter(c => c.userEmail===email && c.senderRole==="admin" && new Date(c.createdAt||0).getTime() > last).length;
};
window.getAdminUnreadCountForUser = function(email){
  const chats = getChats ? getChats() : [];
  const map = window.getLastReadMap();
  const last = map["admin:"+email] || 0;
  return chats.filter(c => c.userEmail===email && c.senderRole==="user" && new Date(c.createdAt||0).getTime() > last).length;
};
window.updateUnreadBadges = function(){
  const s = getSession && getSession();
  const customerBadge = document.querySelector("[data-customer-unread]");
  if(customerBadge && s){
    const count = window.getCustomerUnreadCount(s.email);
    customerBadge.textContent = count;
    customerBadge.style.display = count>0 ? "inline-flex" : "none";
  }
  const adminBadge = document.querySelector("[data-admin-unread]");
  if(adminBadge){
    const users = (window.getAdminChatUsers ? window.getAdminChatUsers() : []);
    let total = 0;
    users.forEach(u => total += window.getAdminUnreadCountForUser(u.email));
    adminBadge.textContent = total;
    adminBadge.style.display = total>0 ? "inline-flex" : "none";
  }
};

window.renderCustomerChat = (function(oldFn){
  return function(){
    if(oldFn) oldFn();
    const s = getSession && getSession();
    if(s){
      window.markCustomerMessagesRead(s.email);
      window.updateUnreadBadges();
    }
  };
})(window.renderCustomerChat);

window.renderChatThread = (function(oldFn){
  return function(email, isAdmin){
    if(oldFn) oldFn(email, isAdmin);
    if(isAdmin && email){
      window.markAdminMessagesRead(email);
      window.updateUnreadBadges();
    }
  };
})(window.renderChatThread);

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    try{ window.ensureLastReadStorage(); }catch(e){}
    try{ window.updateUnreadBadges(); }catch(e){}
    document.querySelectorAll('[data-tab-btn="messages"]').forEach(btn=>{
      btn.addEventListener("click", function(){
        try{
          const s = getSession && getSession();
          if(s && s.role==="customer"){
            window.markCustomerMessagesRead(s.email);
          }
          window.updateUnreadBadges();
        }catch(e){}
      });
    });
  }, 80);
});
/* ===== end v32 ===== */


/* ===== v35 SETTINGS SAVE + RESTORE FIX ===== */
const SETTINGS_BACKUP_KEY = "aurevia_settings_backups_v35";

window.getSettingsBackups = function(){
  try{ return JSON.parse(localStorage.getItem(SETTINGS_BACKUP_KEY) || "{}"); }catch(e){ return {}; }
};
window.setSettingsBackups = function(map){
  localStorage.setItem(SETTINGS_BACKUP_KEY, JSON.stringify(map || {}));
};
window.backupSettingsFields = function(fieldsKey, fields){
  const current = (typeof getSettings === "function" ? getSettings() : {});
  const backup = {};
  fields.forEach(f => { backup[f] = current[f]; });
  const all = window.getSettingsBackups();
  all[fieldsKey] = backup;
  window.setSettingsBackups(all);
};
window.restoreSettingsFields = function(fieldsKey){
  const all = window.getSettingsBackups();
  const backup = all[fieldsKey];
  if(!backup){
    alert("Geri dönecek eski ayar yok.");
    return;
  }
  const next = {...getSettings(), ...backup};
  saveSettings(next);
  try{ fillSettingsForm(); }catch(e){}
  try{ syncGlobalText(); }catch(e){}
  try{ renderPricingCards(); }catch(e){}
  try{ renderPackageShowcaseCards(); }catch(e){}
  const msg=document.getElementById("settingsMsg");
  if(msg) showMessage(msg, "Eski ayara dönüldü.");
  alert("Eski ayara dönüldü.");
};

window.saveSettingsFields = async function(fieldsCsv, feedbackId){
  const form=document.getElementById("settingsForm");
  if(!form){
    alert("Kaydedilemedi.");
    return;
  }

  const fields = fieldsCsv.split(",").map(s=>s.trim()).filter(Boolean);
  const backupKey = fields.join("|");

  try{
    window.backupSettingsFields(backupKey, fields);

    let next = {...getSettings()};
    fields.forEach(field=>{
      const el=form.querySelector(`[name="${field}"]`);
      if(el) next[field] = el.value;
    });

    const fileMap = {
      siteLogo:["siteLogoFile","siteLogoPending"],
      heroImage:["heroImageFile","heroImagePending"], heroVideo:["heroVideoFile","heroVideoPending"],
      pricingImage:["pricingImageFile","pricingImagePending"], pricingVideo:["pricingVideoFile","pricingVideoPending"],
      servicesImage:["servicesImageFile","servicesImagePending"], servicesVideo:["servicesVideoFile","servicesVideoPending"],
      bg_home:["bgHomeFile","bgHomePending"], bg_services:["bgServicesFile","bgServicesPending"],
      bg_pricing:["bgPricingFile","bgPricingPending"], bg_about:["bgAboutFile","bgAboutPending"],
      bg_contact:["bgContactFile","bgContactPending"], bg_login:["bgLoginFile","bgLoginPending"],
      bg_register:["bgRegisterFile","bgRegisterPending"], bg_admin:["bgAdminFile","bgAdminPending"],
      bg_customer:["bgCustomerFile","bgCustomerPending"]
    };

    for(const field of fields){
      const pair = fileMap[field];
      if(!pair) continue;
      const [fileField, progressId] = pair;
      const input = form.querySelector(`[name="${fileField}"]`);
      if(input && input.files && input.files[0]){
        if(typeof fileToDataUrlSafe === "function"){
          next[field] = await fileToDataUrlSafe(input.files[0], progressId);
        }else if(typeof fileToDataUrl === "function"){
          next[field] = await fileToDataUrl(input.files[0], progressId);
        }
        input.value = "";
      }
    }

    saveSettings(next);

    try{ fillSettingsForm(); }catch(e){ console.warn(e); }
    try{ syncGlobalText(); }catch(e){ console.warn(e); }
    try{ renderPricingCards(); }catch(e){ console.warn(e); }
    try{ renderPackageShowcaseCards(); }catch(e){ console.warn(e); }

    const msg=document.getElementById("settingsMsg");
    if(msg) showMessage(msg, "Kaydedildi.");

    if(feedbackId){
      const fb=document.getElementById(feedbackId);
      if(fb){
        fb.textContent="Bu bölüm kaydedildi.";
        fb.className="section-feedback show";
        setTimeout(()=>{ fb.className="section-feedback"; }, 1800);
      }
    }
    alert("Kaydedildi.");
  }catch(err){
    console.error("saveSettingsFields error:", err);
    const msg=document.getElementById("settingsMsg");
    if(msg) showMessage(msg, "Kaydedilemedi.", false);
    alert("Kaydedilemedi.");
  }
};

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    try{ fillSettingsForm(); }catch(e){}
    try{ syncGlobalText(); }catch(e){}
  }, 90);
});
/* ===== end v35 ===== */


/* ===== v36 NAV MANAGEMENT ===== */
window.renderNavManager = function(){
  const mount=document.getElementById("navItemsList");
  if(!mount) return;
  const st=getSettings();
  const items=Array.isArray(st.navItems) ? st.navItems : [];
  if(!items.length){
    mount.innerHTML='<div class="status-note">Menü öğesi yok.</div>';
    return;
  }
  mount.innerHTML = items.map((item, idx)=>`
    <div class="item-row">
      <div>
        <strong>${item.label || 'Menü'}</strong>
        <div class="small">${item.href || '#'}</div>
      </div>
      <div class="item-actions">
        <button class="small-btn gold" data-nav-edit="${idx}">Düzenle</button>
        <button class="small-btn red" data-nav-del="${idx}">Sil</button>
      </div>
    </div>
  `).join("");

  mount.querySelectorAll("[data-nav-edit]").forEach(btn=>{
    btn.onclick = function(){
      const idx=Number(btn.getAttribute("data-nav-edit"));
      const settings=getSettings();
      const items=Array.isArray(settings.navItems) ? settings.navItems : [];
      const current=items[idx];
      if(!current) return;
      const label=prompt("Menü adı", current.label || "");
      if(label===null) return;
      const href=prompt("Link / href", current.href || "#");
      if(href===null) return;
      items[idx] = {label, href};
      settings.navItems = items;
      saveSettings(settings);
      try{ syncGlobalText(); }catch(e){}
      window.renderNavManager();
      alert("Menü güncellendi.");
    };
  });

  mount.querySelectorAll("[data-nav-del]").forEach(btn=>{
    btn.onclick = function(){
      const idx=Number(btn.getAttribute("data-nav-del"));
      const settings=getSettings();
      let items=Array.isArray(settings.navItems) ? settings.navItems : [];
      items = items.filter((_, i)=>i!==idx);
      settings.navItems = items;
      saveSettings(settings);
      try{ syncGlobalText(); }catch(e){}
      window.renderNavManager();
      alert("Menü silindi.");
    };
  });
};

window.bindNavManager = function(){
  const form=document.getElementById("navAddForm");
  if(!form || form.dataset.bound==="1") return;
  form.onsubmit = function(e){
    e.preventDefault();
    const label=(form.querySelector('[name="navLabel"]')?.value || "").trim();
    const href=(form.querySelector('[name="navHref"]')?.value || "").trim();
    if(!label){ alert("Menü adı gir."); return false; }
    const settings=getSettings();
    const items=Array.isArray(settings.navItems) ? settings.navItems : [];
    items.push({label, href: href || "#"});
    settings.navItems = items;
    saveSettings(settings);
    form.reset();
    try{ syncGlobalText(); }catch(e){}
    window.renderNavManager();
    alert("Yeni menü eklendi.");
    return false;
  };
  form.dataset.bound="1";
};

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    try{ window.renderNavManager(); }catch(e){}
    try{ window.bindNavManager(); }catch(e){}
  }, 100);
});
/* ===== end v36 ===== */


/* ===== v37 SUPABASE REAL AUTH + BALANCE REQUESTS ===== */
const SUPABASE_URL = "https://mcibeizocwmdgjpgvbrc.supabase.co";
const SUPABASE_KEY = "sb_publishable_15totySpM2mRnqeR8GpCsg_f2qCtcRq";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

window.supabaseClient = supabaseClient;

async function sbGetUser(){
  if(!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getUser();
  return data?.user || null;
}

async function sbGetCurrentAuthUser(){
  return await sbGetUser();
}

async function sbGetProfileByUserId(userId){
  if(!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient.from("profiles").select("*").eq("id", userId).maybeSingle();
  if(error){ console.error(error); return null; }
  return data || null;
}

async function sbGetProfileByEmail(email){
  if(!supabaseClient || !email) return null;
  const { data, error } = await supabaseClient.from("profiles").select("*").eq("email", email).maybeSingle();
  if(error){ console.error(error); return null; }
  return data || null;
}

async function sbGetProfileCount(){
  if(!supabaseClient) return null;
  const { count, error } = await supabaseClient.from("profiles").select("id", { count: "exact", head: true });
  if(error){ console.error(error); return null; }
  return Number(count ?? 0);
}

async function sbEnsureLocalSession(){
  const user = await sbGetUser();
  if(!user) return null;
  const profile = await sbGetProfileByUserId(user.id);
  if(!profile) return null;
  const balance = Number(profile.balance || 0);
  const sessionUser = {
    name: profile.full_name || user.user_metadata?.full_name || user.email || "Kullanıcı",
    email: profile.email || user.email,
    role: normalizeAppRole(profile.role || "customer"),
    company: profile.full_name || "",
    balance: balance,
    isActive: true
  };
  setSession(sessionUser);
  return sessionUser;
}

logout = async function(){
  try{ if(supabaseClient) await supabaseClient.auth.signOut(); }catch(e){ console.error(e); }
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
};

refreshSessionFromUsers = async function(){
  try{ await sbEnsureLocalSession(); }catch(e){ console.error(e); }
};

requireAuth = function(role){
  const s=getSession();
  if(!s){ window.location.href="login.html"; return null; }
  if(role && s.role!==role){ window.location.href=s.role==="admin"?"admin.html":"customer.html"; return null; }
  sbEnsureLocalSession().then(updated=>{
    if(!updated){ window.location.href="login.html"; return; }
    if(role && updated.role!==role){ window.location.href=updated.role==="admin"?"admin.html":"customer.html"; return; }
    document.querySelectorAll("[data-session-name]").forEach(el=>el.textContent=updated.name);
    document.querySelectorAll("[data-session-email]").forEach(el=>el.textContent=updated.email);
    document.querySelectorAll("[data-session-company]").forEach(el=>el.textContent=updated.company||"Kurumsal Hesap");
  }).catch(err=>console.error(err));
  return s;
};




function normalizeAppRole(role){
  return role === "admin" ? "admin" : "customer";
}

async function sbRequireRole(requiredRole){
  if(!supabaseClient) return false;
  const pageId = document.body ? document.body.getAttribute("data-page-id") : "";
  const user = await sbGetUser();
  if(!user){
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
    return false;
  }
  const profile = await sbGetProfileByUserId(user.id);
  if(!profile){
    localStorage.removeItem(SESSION_KEY);
    alert("Profil bulunamadı. Lütfen tekrar giriş yapın.");
    window.location.href = "login.html";
    return false;
  }
  const balance = Number(profile.balance || 0);
  setSession({
    name: profile.full_name || user.user_metadata?.full_name || user.email || "Kullanıcı",
    email: profile.email || user.email,
    role: normalizeAppRole(profile.role || "customer"),
    company: profile.full_name || "",
    balance: balance,
    isActive: true
  });
  const actualRole = normalizeAppRole(profile.role || "customer");
  if(requiredRole && actualRole !== requiredRole){
    alert("Bu sayfaya erişim yetkin yok.");
    window.location.href = requiredRole === "admin" ? "customer.html" : "admin.html";
    return false;
  }
  return true;
}

async function sbGetApprovedBalance(userId, email){
  if(!supabaseClient) return 0;
  let q = supabaseClient.from("balance_requests").select("amount,status,user_id,email").eq("status", "approved");
  if(userId) q = q.eq("user_id", userId);
  else if(email) q = q.eq("email", email);
  const { data, error } = await q;
  if(error){ console.error(error); return 0; }
  return (data || []).reduce((sum, item)=>sum + Number(item.amount || 0), 0);
}

renderCustomerBalance = async function(){
  const s=getSession();
  const main=document.getElementById("customerBalance");
  const mini=document.getElementById("customerBalanceMini");
  if(!s || (!main && !mini)) return;
  const profile = await sbGetProfileByEmail(s.email);
  const balance = Number(profile?.balance || 0);
  const text = fmtMoney(balance);
  if(main) main.textContent = text;
  if(mini) mini.textContent = text;
  const current = getSession();
  if(current){ current.balance = balance; setSession(current); }
};

renderCustomerRequests = async function(){
  const mount=document.getElementById("customerRequests");
  const s=getSession();
  if(!mount || !s || !supabaseClient) return;
  const profile = await sbGetProfileByEmail(s.email);
  let q = supabaseClient.from("balance_requests").select("*").order("created_at", { ascending: false });
  if(profile?.id) q = q.eq("user_id", profile.id); else q = q.eq("email", s.email);
  const { data, error } = await q;
  if(error){ console.error(error); mount.innerHTML='<div class="status-note">Talepler yüklenemedi.</div>'; return; }
  if(!data || !data.length){ mount.innerHTML='<div class="status-note">Henüz gönderilmiş bakiye talebin yok.</div>'; return; }
  mount.innerHTML = data.map(req=>`
    <div class="item-row">
      <div>
        <strong>${fmtMoney(req.amount)}</strong>
        <div class="small">E-posta: ${req.email || '-'}</div>
        <div class="small">Not: ${req.note || '-'}</div>
      </div>
      <div class="badge ${req.status==="approved"?"ok":req.status==="rejected"?"off":"warn"}">
        ${req.status==="approved"?"Onaylandı":req.status==="rejected"?"Reddedildi":"Bekliyor"}
      </div>
    </div>
  `).join("");
};

bindCustomerBalanceForm = function(){
  const old=document.getElementById("balanceRequestForm");
  if(!old || old.dataset.supabaseBound==="1") return;
  const form=old.cloneNode(true);
  old.parentNode.replaceChild(form, old);
  form.dataset.supabaseBound="1";
  const rep=form.querySelector('[name="representative"]');
  if(rep && !rep.value) rep.value = getSettings().representativeName || "Yasin";
  form.addEventListener("submit", async function(e){
    e.preventDefault();
    const s=getSession();
    const msg=document.getElementById("balanceRequestMsg");
    if(!s || !supabaseClient){ showMessage(msg, "Sistem hazır değil.", false); return; }
    const amount=Number(form.querySelector('[name="amount"]')?.value || 0);
    const phone=form.querySelector('[name="phone"]')?.value || "";
    const representative=form.querySelector('[name="representative"]')?.value || getSettings().representativeName || "Yasin";
    if(!amount || amount<=0){ showMessage(msg, "Geçerli tutar girin.", false); return; }
    const profile = await sbGetProfileByEmail(s.email);
    if(!profile){ showMessage(msg, "Profil bulunamadı. Tekrar giriş yapın.", false); return; }
    const note = `Telefon: ${phone || '-'} | Temsilci: ${representative}`;
    const { error } = await supabaseClient.from("balance_requests").insert([{
      user_id: profile.id,
      full_name: profile.full_name || s.name,
      email: profile.email || s.email,
      amount: String(amount),
      note: note,
      status: "pending"
    }]);
    if(error){ console.error(error); showMessage(msg, "Talep gönderilemedi.", false); return; }
    showMessage(msg, "Talep gönderildi.");
    form.reset();
    if(rep) rep.value = getSettings().representativeName || "Yasin";
    updateBalanceWhatsappButton();
    renderCustomerRequests();
    renderAdminSummary();
    renderBalanceRequests();
  });
};

renderAdminSummary = async function(){
  if(!supabaseClient) return;
  const usersRes = await supabaseClient.from("profiles").select("id,role,email,full_name");
  const reqRes = await supabaseClient.from("balance_requests").select("amount,status");
  if(usersRes.error) console.error(usersRes.error);
  if(reqRes.error) console.error(reqRes.error);
  const users = usersRes.data || [];
  const requests = reqRes.data || [];
  const customerCount = users.filter(u=>u.role!=="admin").length;
  const adminCount = users.filter(u=>u.role==="admin").length;
  const totalBalance = requests.filter(r=>r.status==="approved").reduce((a,b)=>a+Number(b.amount||0),0);
  const pendingRequests = requests.filter(r=>r.status==="pending").length;
  const map={adminCustomerCount:customerCount,adminAdminCount:adminCount,adminTotalBalance:fmtMoney(totalBalance),adminPendingRequests:pendingRequests};
  Object.entries(map).forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.textContent=val; });
};

renderUsersAdmin = async function(){
  const mount=document.getElementById("usersList");
  if(!mount || !supabaseClient) return;
  const { data, error } = await supabaseClient.from("profiles").select("id,email,full_name,role").order("created_at", { ascending: false });
  if(error){ console.error(error); mount.innerHTML='<div class="status-note">Kullanıcılar yüklenemedi.</div>'; return; }
  if(!data || !data.length){ mount.innerHTML='<div class="status-note">Henüz kullanıcı yok.</div>'; return; }
  const balanceMap = {};
  const { data: approved } = await supabaseClient.from("balance_requests").select("user_id,amount,status").eq("status", "approved");
  (approved || []).forEach(item=>{ balanceMap[item.user_id] = (balanceMap[item.user_id] || 0) + Number(item.amount || 0); });
  mount.innerHTML = data.map(user=>`
    <div class="item-row">
      <div>
        <strong>${user.full_name || 'Kullanıcı'}</strong>
        <div class="small">${user.email} • ${user.role === 'admin' ? 'Admin' : 'Müşteri'}</div>
        <div class="small">Bakiye: ${fmtMoney(balanceMap[user.id] || 0)}</div>
      </div>
    </div>
  `).join("");
};

renderBalanceRequests = async function(){
  const mount=document.getElementById("requestList");
  if(!mount || !supabaseClient) return;
  const { data, error } = await supabaseClient.from("balance_requests").select("*").order("created_at", { ascending: false });
  if(error){ console.error(error); mount.innerHTML='<div class="status-note">Bakiye talepleri yüklenemedi.</div>'; return; }
  if(!data || !data.length){ mount.innerHTML='<div class="status-note">Henüz bakiye talebi yok.</div>'; return; }
  mount.innerHTML = data.map(req=>`
    <div class="item-row">
      <div>
        <strong>${req.full_name || 'Kullanıcı'}</strong>
        <div class="small">${req.email || '-'} • ${fmtMoney(req.amount)} • ${req.note || '-'}</div>
        <div class="small">Durum: ${req.status === 'pending' ? 'Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</div>
      </div>
      <div class="item-actions">
        ${req.status === 'pending' ? `<button class="small-btn green" data-sb-approve="${req.id}">Onayla</button><button class="small-btn red" data-sb-reject="${req.id}">Reddet</button>` : ''}
      </div>
    </div>
  `).join("");

  mount.querySelectorAll("[data-sb-approve]").forEach(btn=>btn.addEventListener("click", async ()=>{
    const id=btn.getAttribute("data-sb-approve");
    const { error } = await supabaseClient.from("balance_requests").update({ status: "approved" }).eq("id", id);
    if(error){ console.error(error); alert("Onaylanamadı."); return; }
    renderBalanceRequests(); renderAdminSummary(); renderUsersAdmin(); renderCustomerBalance(); renderCustomerRequests();
  }));
  mount.querySelectorAll("[data-sb-reject]").forEach(btn=>btn.addEventListener("click", async ()=>{
    const id=btn.getAttribute("data-sb-reject");
    const { error } = await supabaseClient.from("balance_requests").update({ status: "rejected" }).eq("id", id);
    if(error){ console.error(error); alert("Reddedilemedi."); return; }
    renderBalanceRequests(); renderAdminSummary(); renderCustomerRequests();
  }));
};

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(async function(){
    if(!supabaseClient) return;

    const reg=document.getElementById("registerForm");
    if(reg){
      const cloned=reg.cloneNode(true);
      reg.parentNode.replaceChild(cloned, reg);
      cloned.addEventListener("submit", async function(e){
        e.preventDefault();
        const msg=document.getElementById("registerMsg");
        const fd=Object.fromEntries(new FormData(cloned).entries());
        const profileCount = await sbGetProfileCount();
        const role = profileCount === 0 ? "admin" : "customer";
        const { data, error } = await supabaseClient.auth.signUp({
          email: String(fd.email || '').trim(),
          password: String(fd.password || ''),
          options: { data: { full_name: String(fd.name || '').trim() } }
        });
        if(error){ console.error(error); showMessage(msg, error.message || "Kayıt başarısız.", false); return; }
        const userId=data?.user?.id;
        if(userId){
          const payload = { id:userId, email:String(fd.email || '').trim(), full_name:String(fd.name || '').trim(), role:role };
          const { error: profileErr } = await supabaseClient.from("profiles").upsert([payload], { onConflict: "id" });
          if(profileErr){ console.error(profileErr); showMessage(msg, "Profil kaydı oluşmadı.", false); return; }
          setSession({ name:payload.full_name, email:payload.email, role:payload.role, company:payload.full_name, balance:0, isActive:true });
          showMessage(msg, role === "admin" ? "İlk hesap admin olarak oluşturuldu." : "Hesabınız oluşturuldu.");
          setTimeout(()=>{ window.location.href = role === "admin" ? "admin.html" : "customer.html"; }, 900);
        } else {
          showMessage(msg, "Kayıt tamamlandı. E-postanı kontrol etmen gerekebilir.", true);
        }
      });
    }

    const login=document.getElementById("loginForm");
    if(login){
      const cloned=login.cloneNode(true);
      login.parentNode.replaceChild(cloned, login);
      cloned.addEventListener("submit", async function(e){
        e.preventDefault();
        const msg=document.getElementById("loginMsg");
        const fd=Object.fromEntries(new FormData(cloned).entries());
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: String(fd.email || '').trim(),
          password: String(fd.password || '')
        });
        if(error){ console.error(error); showMessage(msg, error.message || "Giriş başarısız.", false); return; }
        const profile = await sbGetProfileByUserId(data?.user?.id);
        if(!profile){ showMessage(msg, "Profil bulunamadı.", false); return; }
        const balance = Number(profile.balance || 0);
        setSession({
          name: profile.full_name || data.user.email,
          email: profile.email || data.user.email,
          role: normalizeAppRole(profile.role || "customer"),
          company: profile.full_name || "",
          balance: balance,
          isActive: true
        });
        showMessage(msg, "Giriş başarılı. Panel açılıyor...");
        const appRole = normalizeAppRole(profile.role);
        setTimeout(()=>{ window.location.href = (appRole === "admin") ? "admin.html" : "customer.html"; }, 500);
      });
    }

    if(document.body && document.body.getAttribute("data-page-id") === "customer"){
      const ok = await sbRequireRole("customer");
      if(ok){
        await sbEnsureLocalSession();
        renderCustomerBalance();
        renderCustomerRequests();
        bindCustomerBalanceForm();
        updateBalanceWhatsappButton();
      }
    }
    if(document.body && document.body.getAttribute("data-page-id") === "admin"){
      const ok = await sbRequireRole("admin");
      if(ok){
        await sbEnsureLocalSession();
        renderAdminSummary();
        renderUsersAdmin();
        renderBalanceRequests();
      }
    }

    document.querySelectorAll("[data-session-name]").forEach(async el=>{
      const s=getSession(); if(s) el.textContent=s.name;
    });
    document.querySelectorAll("[data-session-email]").forEach(el=>{ const s=getSession(); if(s) el.textContent=s.email; });
    document.querySelectorAll("[data-session-company]").forEach(el=>{ const s=getSession(); if(s) el.textContent=s.company||"Kurumsal Hesap"; });
  }, 120);
});
/* ===== end v37 ===== */


// --- Supabase shared site settings sync ---
async function sbLoadSiteSettingsToLocal(){
  try{
    if(!supabaseClient) return false;
    const { data, error } = await supabaseClient
      .from("site_settings")
      .select("id,data,updated_at")
      .eq("id", 1)
      .maybeSingle();
    if(error){
      console.warn("site_settings load warning:", error);
      return false;
    }
    if(data && data.data && typeof data.data === "object"){
      const merged = { ...defaults.settings, ...data.data };
      saveSettings(merged);
      try{ fillSettingsForm(); }catch(e){}
      try{ syncGlobalText(); }catch(e){}
      try{ renderPricingCards(); }catch(e){}
      try{ renderPackageShowcaseCards(); }catch(e){}
      try{ updateBalanceWhatsappButton(); }catch(e){}
      return true;
    }
    return false;
  }catch(err){
    console.warn("site_settings load error:", err);
    return false;
  }
}

async function sbSaveSiteSettingsFromLocal(){
  try{
    if(!supabaseClient) return false;
    const payload = {
      id: 1,
      data: getSettings(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from("site_settings").upsert([payload], { onConflict: "id" });
    if(error){
      console.error("site_settings save error:", error);
      return false;
    }
    return true;
  }catch(err){
    console.error("site_settings save error:", err);
    return false;
  }
}

(function(){
  const originalSaveSettingsFields = window.saveSettingsFields;
  if(typeof originalSaveSettingsFields === "function"){
    window.saveSettingsFields = async function(fieldsCsv, feedbackId){
      await originalSaveSettingsFields(fieldsCsv, feedbackId);
      const ok = await sbSaveSiteSettingsFromLocal();
      if(ok){
        const msg=document.getElementById("settingsMsg");
        if(msg) showMessage(msg, "Ayarlar herkese açık şekilde kaydedildi.");
      }
    };
  }

  const originalRestoreSettingsFields = window.restoreSettingsFields;
  if(typeof originalRestoreSettingsFields === "function"){
    window.restoreSettingsFields = async function(fieldsKey){
      await originalRestoreSettingsFields(fieldsKey);
      await sbSaveSiteSettingsFromLocal();
    };
  }
})();

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(async function(){
    const loaded = await sbLoadSiteSettingsToLocal();
    if(!loaded){
      // İlk kurulumda local ayarları Supabase'e gönder
      await sbSaveSiteSettingsFromLocal();
    }
  }, 250);
});


// --- Supabase shared packages sync ---
async function sbLoadPackagesToLocal(){
  try{
    if(!supabaseClient) return false;
    const { data, error } = await supabaseClient
      .from("site_settings")
      .select("id,data,updated_at")
      .eq("id", 1)
      .maybeSingle();
    if(error){
      console.warn("packages load warning:", error);
      return false;
    }
    const remotePackages = data?.data?.packages;
    if(Array.isArray(remotePackages)){
      savePackages(remotePackages);
      try{ renderPackagesAdminEnhanced(); }catch(e){}
      try{ fillOrderFormOptions(); }catch(e){}
      try{ renderPricingCards(); }catch(e){}
      try{ renderPackageShowcaseCards(); }catch(e){}
      try{ if(typeof sbBindPackagePurchase === 'function') sbBindPackagePurchase(); }catch(e){}
      return true;
    }
    return false;
  }catch(err){
    console.warn("packages load error:", err);
    return false;
  }
}

async function sbSavePackagesFromLocal(){
  try{
    if(!supabaseClient) return false;
    const { data: row, error: loadError } = await supabaseClient
      .from("site_settings")
      .select("id,data")
      .eq("id", 1)
      .maybeSingle();
    if(loadError){
      console.error("packages preload error:", loadError);
      return false;
    }
    const payload = {
      id: 1,
      data: {
        ...(row?.data || {}),
        packages: getPackages()
      },
      updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from("site_settings").upsert([payload], { onConflict: "id" });
    if(error){
      console.error("packages save error:", error);
      return false;
    }
    return true;
  }catch(err){
    console.error("packages save error:", err);
    return false;
  }
}

(function(){
  const originalSavePackages = window.savePackages;
  if(typeof originalSavePackages === 'function'){
    window.savePackages = function(v){
      originalSavePackages(v);
      sbSavePackagesFromLocal();
    };
  }
})();

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(async function(){
    await sbLoadPackagesToLocal();
    try{ if(typeof sbBindPackagePurchase === 'function') sbBindPackagePurchase(); }catch(e){ console.warn(e); }
  }, 300);
});


/* ===== Supabase orders/messages purchase fix ===== */
async function sbGetCurrentProfile(){
  if(!supabaseClient) return null;
  const auth = await sbGetCurrentAuthUser();
  if(!auth || !auth.id) return null;
  let profile = await sbGetProfileByUserId(auth.id);
  if(profile) return profile;
  if(auth.email){
    profile = await sbGetProfileByEmail(auth.email);
    if(profile) return profile;
  }
  return null;
}

async function sbGetProfileBalance(profile){
  if(!profile) return 0;
  const { data, error } = await supabaseClient.from('profiles').select('balance').eq('id', profile.id).maybeSingle();
  if(error){ console.error(error); }
  return Number(data?.balance || profile.balance || 0);
}

async function sbRenderCustomerOrders(){
  const tbody=document.getElementById('customerOrdersTableBody');
  const mountFallback=document.getElementById('customerOrders');
  const s=getSession();
  if(!supabaseClient || !s) return;
  const profile = await sbGetCurrentProfile();
  if(!profile){
    if(tbody) tbody.innerHTML='<tr><td colspan="5">Kullanıcı bulunamadı.</td></tr>';
    if(mountFallback) mountFallback.innerHTML='<div class="status-note">Kullanıcı bulunamadı.</div>';
    return;
  }
  const { data, error } = await supabaseClient.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending:false });
  if(error){ console.error(error); if(tbody) tbody.innerHTML='<tr><td colspan="5">Siparişler yüklenemedi.</td></tr>'; return; }
  const orders = data || [];
  if(tbody){
    if(!orders.length){ tbody.innerHTML='<tr><td colspan="5">Henüz sipariş yok.</td></tr>'; }
    else {
      tbody.innerHTML = orders.map(order=>`<tr><td>${order.package_name || '-'}</td><td>${fmtMoney(order.amount || 0)}</td><td><span class="badge ${order.status==="completed"?"ok":order.status==="pending"?"warn":"off"}">${order.status === 'completed' ? 'Tamamlandı' : order.status === 'pending' ? 'Beklemede' : order.status === 'rejected' ? 'Reddedildi' : (order.status || '-')}</span></td><td>${order.stage || '-'}</td><td>${order.date || '-'}</td></tr>`).join('');
    }
  }
}

async function sbRenderCustomerOrderTracking(){
  const mount=document.getElementById('orderTracking');
  const s=getSession();
  if(!mount || !s || !supabaseClient) return;
  const profile = await sbGetCurrentProfile();
  if(!profile){ mount.innerHTML='<div class="status-note">Kullanıcı bulunamadı.</div>'; return; }
  const { data, error } = await supabaseClient.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending:true });
  if(error){ console.error(error); mount.innerHTML='<div class="status-note">Sipariş takibi yüklenemedi.</div>'; return; }
  const orders = data || [];
  if(!orders.length){ mount.innerHTML='<div class="status-note">Takip edilecek sipariş yok.</div>'; return; }
  const latest = orders[orders.length-1];
  const timeline = Array.isArray(latest.timeline) ? latest.timeline : [latest.stage || 'Sipariş alındı'];
  mount.innerHTML = `<div class="preview-box"><strong>${latest.package_name || '-'}</strong><div class="small">Son durum: ${latest.stage || '-'}</div><div class="timeline">${timeline.map((t,i)=>`<div class="timeline-item ${i===timeline.length-1?'active':''}">${t}</div>`).join('')}</div></div>`;
}

async function sbBindPackagePurchase(){
  const oldForm=document.getElementById('packageBuyForm');
  if(!oldForm || !supabaseClient) return;
  const form=oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(form, oldForm);
  const select=form.querySelector('select[name="packageId"]');
  const refill=()=>{
    const pkgs=getPackages().filter(p=>p.active!==false);
    if(select){
      select.innerHTML = pkgs.length ? pkgs.map(p=>`<option value="${p.id}">${p.name} - ${fmtMoney(p.price)}</option>`).join('') : '<option value="">Paket yok</option>';
    }
  };
  refill();
  form.onsubmit = async function(e){
    e.preventDefault();
    const msg=document.getElementById('buyPkgMsg');
    const profile = await sbGetCurrentProfile();
    if(!profile){ if(msg) showMessage(msg, 'Kullanıcı bulunamadı.', false); else alert('Kullanıcı bulunamadı.'); return false; }
    const pkg=getPackages().find(p=>p.id===select?.value);
    if(!pkg){ if(msg) showMessage(msg, 'Paket seç.', false); else alert('Paket seç.'); return false; }
    const currentBalance = await sbGetProfileBalance(profile);
    if(currentBalance < Number(pkg.price||0)){
      if(msg) showMessage(msg, 'Yetersiz bakiye.', false); else alert('Yetersiz bakiye.');
      return false;
    }
    const newBalance = currentBalance - Number(pkg.price||0);
    const { error: balErr } = await supabaseClient.from('profiles').update({ balance:newBalance }).eq('id', profile.id);
    if(balErr){ console.error(balErr); if(msg) showMessage(msg, 'Bakiye güncellenemedi.', false); return false; }
    const payload = {
      user_id: profile.id,
      customer: profile.full_name || profile.email,
      customer_email: profile.email,
      package_id: pkg.id,
      package_name: pkg.name,
      amount: Number(pkg.price||0),
      status: 'pending',
      stage: 'Sipariş alındı',
      timeline: ['Sipariş alındı'],
      date: currentDateTR()
    };
    const { error: orderErr } = await supabaseClient.from('orders').insert([payload]);
    if(orderErr){ console.error(orderErr); if(msg) showMessage(msg, 'Sipariş kaydı oluşturulamadı. SQL dosyasını çalıştır.', false); return false; }
    const s = getSession() || {};
    setSession({ ...s, balance:newBalance, email: profile.email, name: profile.full_name || profile.email, role: normalizeAppRole(profile.role || 'customer'), isActive:true });
    if(msg) showMessage(msg, 'Paket satın alındı.');
    await renderCustomerBalance();
    await sbRenderCustomerOrders();
    await sbRenderCustomerOrderTracking();
    await sbRenderOrdersAdmin();
    return false;
  };
}

async function sbRenderOrdersAdmin(){
  const tbody=document.getElementById('ordersTableBody');
  if(!tbody || !supabaseClient) return;
  const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending:false });
  if(error){ console.error(error); tbody.innerHTML='<tr><td colspan="6">Siparişler yüklenemedi.</td></tr>'; return; }
  const orders = data || [];
  if(!orders.length){ tbody.innerHTML='<tr><td colspan="6">Henüz sipariş yok.</td></tr>'; return; }
  tbody.innerHTML = orders.map(order=>`<tr><td>${order.customer || '-'}</td><td>${order.package_name || '-'}</td><td>${fmtMoney(order.amount || 0)}</td><td><span class="badge ${order.status==="completed"?"ok":order.status==="pending"?"warn":"off"}">${order.status === 'completed' ? 'Tamamlandı' : order.status === 'pending' ? 'Beklemede' : order.status === 'rejected' ? 'Reddedildi' : (order.status || '-')}</span></td><td>${order.stage || '-'}</td><td><div class="item-actions"><button class="small-btn gold" data-order-complete="${order.id}">Tamamla</button><button class="small-btn red" data-order-reject="${order.id}">Reddet</button></div></td></tr>`).join('');
  tbody.querySelectorAll('[data-order-complete]').forEach(btn=>btn.onclick=async()=>{
    const id=btn.getAttribute('data-order-complete');
    const { error } = await supabaseClient.from('orders').update({ status:'completed', stage:'Tamamlandı', timeline:['Sipariş alındı','Tamamlandı'] }).eq('id', id);
    if(error){ console.error(error); alert('Sipariş güncellenemedi.'); return; }
    await sbRenderOrdersAdmin(); await sbRenderCustomerOrders(); await sbRenderCustomerOrderTracking();
  });
  tbody.querySelectorAll('[data-order-reject]').forEach(btn=>btn.onclick=async()=>{
    const id=btn.getAttribute('data-order-reject');
    const { data: order } = await supabaseClient.from('orders').select('*').eq('id', id).maybeSingle();
    if(order){
      const { data: profile } = await supabaseClient.from('profiles').select('balance').eq('id', order.user_id).maybeSingle();
      const refund = Number(profile?.balance || 0) + Number(order.amount || 0);
      await supabaseClient.from('profiles').update({ balance: refund }).eq('id', order.user_id);
    }
    const { error } = await supabaseClient.from('orders').update({ status:'rejected', stage:'Reddedildi', timeline:['Sipariş alındı','Reddedildi'] }).eq('id', id);
    if(error){ console.error(error); alert('Sipariş güncellenemedi.'); return; }
    await sbRenderOrdersAdmin(); await sbRenderCustomerOrders(); await sbRenderCustomerOrderTracking(); await renderUsersAdmin();
  });
}

async function sbFetchMessagesForEmail(email){
  const { data, error } = await supabaseClient.from('messages').select('*').eq('user_email', email).order('created_at', { ascending:true });
  if(error){ console.error(error); return []; }
  return data || [];
}

async function sbRenderCustomerChat(){
  const s=getSession();
  const mount=document.getElementById('customerChatMessages');
  if(!s || !mount || !supabaseClient) return;
  const msgs = await sbFetchMessagesForEmail(s.email);
  if(!msgs.length){ mount.innerHTML='<div class="status-note">Henüz mesaj yok.</div>'; return; }
  mount.innerHTML = msgs.map(m=>`<div class="chat-msg ${m.sender_role==='admin'?'admin':'user'}"><div class="chat-head"><strong>${m.sender_role==='admin' ? 'Admin Mesajı' : 'Senin Mesajın'}</strong><span class="small">${m.date || '-'}</span></div><div>${m.text || ''}</div></div>`).join('');
  mount.scrollTop = mount.scrollHeight;
}

async function sbRenderChatThread(email,isAdmin=false){
  const chatMount=document.getElementById(isAdmin ? 'chatMessages' : 'customerChatMessages');
  if(!chatMount || !supabaseClient) return;
  const msgs = await sbFetchMessagesForEmail(email);
  if(!msgs.length){ chatMount.innerHTML='<div class="status-note">Henüz mesaj yok.</div>'; return; }
  chatMount.innerHTML = msgs.map(m=>`<div class="chat-msg ${m.sender_role==='admin'?'admin':'user'}"><div class="chat-head"><strong>${m.sender_role==='admin' ? 'Admin Mesajı' : 'Kullanıcı Mesajı'}</strong><span class="small">${m.date || '-'}</span></div><div>${m.text || ''}</div></div>`).join('');
  chatMount.scrollTop = chatMount.scrollHeight;
}

async function sbRenderAdminChats(){
  const usersMount=document.getElementById('chatUsers');
  const chatMount=document.getElementById('chatMessages');
  const targetSelect=document.getElementById('adminChatTargetSelect');
  if(!usersMount || !chatMount || !supabaseClient) return;
  const { data: users, error:uErr } = await supabaseClient.from('profiles').select('email,full_name,role').neq('role','admin').order('created_at', { ascending:false });
  if(uErr){ console.error(uErr); usersMount.innerHTML='<div class="status-note">Kullanıcılar yüklenemedi.</div>'; return; }
  const { data: msgs } = await supabaseClient.from('messages').select('user_email,text,created_at').order('created_at', { ascending:false });
  const usersList = (users || []).map(u=>({email:u.email,name:u.full_name || u.email}));
  const seen = new Set(usersList.map(u=>u.email));
  (msgs || []).forEach(m=>{ if(m.user_email && !seen.has(m.user_email)){ usersList.push({email:m.user_email,name:m.user_email}); seen.add(m.user_email); } });
  if(targetSelect){ targetSelect.innerHTML = usersList.length ? usersList.map(u=>`<option value="${u.email}">${u.name} - ${u.email}</option>`).join('') : '<option value="">Kullanıcı yok</option>'; }
  if(!usersList.length){ usersMount.innerHTML='<div class="status-note">Henüz müşteri veya mesaj yok.</div>'; chatMount.innerHTML='<div class="status-note">Mesaj geçmişi burada görünecek.</div>'; return; }
  usersMount.innerHTML = usersList.map(u=>{ const last = (msgs || []).find(m=>m.user_email===u.email); return `<div class="item-row"><div><strong>${u.name}</strong><div class="small">${u.email}</div><div class="small">${last ? String(last.text || '').slice(0,40) : 'Mesaj yok'}</div></div><div class="item-actions"><button class="small-btn gold" data-open-chat="${u.email}">Aç</button></div></div>`; }).join('');
  usersMount.querySelectorAll('[data-open-chat]').forEach(btn=>btn.onclick=async()=>{ const email=btn.getAttribute('data-open-chat'); if(targetSelect) targetSelect.value=email; await sbRenderChatThread(email,true); });
  const fallback=(targetSelect && targetSelect.value) ? targetSelect.value : usersList[0].email;
  if(targetSelect) targetSelect.value=fallback;
  await sbRenderChatThread(fallback,true);
}

function sbBindCustomerChatForm(){
  const form=document.getElementById('customerChatForm');
  if(!form || !supabaseClient) return;
  form.onsubmit = async function(e){
    e.preventDefault();
    const s=getSession();
    if(!s){ alert('Oturum bulunamadı.'); return false; }
    const textarea=form.querySelector('textarea[name="text"]');
    const text=(textarea?.value || '').trim();
    if(!text) return false;
    const payload={ user_email:s.email, sender_role:'user', sender_name:s.name || 'Kullanıcı', text:text, date:currentDateTR() };
    const { error } = await supabaseClient.from('messages').insert([payload]);
    if(error){ console.error(error); alert('Mesaj gönderilemedi. SQL dosyasını çalıştır.'); return false; }
    if(textarea) textarea.value='';
    await sbRenderCustomerChat();
    await sbRenderAdminChats();
    const ok=document.getElementById('customerChatStatus');
    if(ok){ ok.textContent='Mesaj gönderildi.'; ok.className='msg ok'; }
    return false;
  };
}

function sbBindAdminChatForm(){
  const form=document.getElementById('adminChatForm');
  if(!form || !supabaseClient) return;
  form.onsubmit = async function(e){
    e.preventDefault();
    const targetSelect=form.querySelector('select[name="targetSelect"]');
    const textArea=form.querySelector('textarea[name="text"]');
    const target=(targetSelect?.value || '').trim();
    const text=(textArea?.value || '').trim();
    if(!target){ alert('Önce kullanıcı seç.'); return false; }
    if(!text){ alert('Mesaj yaz.'); return false; }
    const s=getSession();
    if(!s){ alert('Oturum bulunamadı.'); return false; }
    const payload={ user_email:target, sender_role:'admin', sender_name:s.name || 'Admin', text:text, date:currentDateTR() };
    const { error } = await supabaseClient.from('messages').insert([payload]);
    if(error){ console.error(error); alert('Mesaj gönderilemedi. SQL dosyasını çalıştır.'); return false; }
    if(textArea) textArea.value='';
    await sbRenderAdminChats();
    await sbRenderChatThread(target,true);
    const ok=document.getElementById('adminChatStatus');
    if(ok){ ok.textContent='Mesaj gönderildi.'; ok.className='msg ok'; }
    return false;
  };
}

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(async function(){
    if(!supabaseClient) return;
    if(document.body && document.body.getAttribute('data-page-id') === 'customer'){
      sbBindPackagePurchase();
      sbBindCustomerChatForm();
      await sbRenderCustomerOrders();
      await sbRenderCustomerOrderTracking();
      await sbRenderCustomerChat();
    }
    if(document.body && document.body.getAttribute('data-page-id') === 'admin'){
      sbBindAdminChatForm();
      await sbRenderOrdersAdmin();
      await sbRenderAdminChats();
    }
  }, 900);
});
/* ===== end orders/messages fix ===== */


/* ===== v40 BALANCE + PROFILE REQUESTS + PUBLIC SESSION FIX ===== */
async function sbRefreshPublicSession(){
  if(!supabaseClient) return null;
  try{
    const s = await sbEnsureLocalSession();
    document.querySelectorAll("[data-session-name]").forEach(el=>{ if(s) el.textContent=s.name; });
    document.querySelectorAll("[data-session-email]").forEach(el=>{ if(s) el.textContent=s.email; });
    document.querySelectorAll("[data-session-company]").forEach(el=>{ if(s) el.textContent=s.company||"Kurumsal Hesap"; });
    return s;
  }catch(e){ console.error(e); return null; }
}

async function sbDecoratePublicAuthLinks(){
  const s = await sbRefreshPublicSession();
  if(!s) return;
  const target = s.role === 'admin' ? 'admin.html' : 'customer.html';
  document.querySelectorAll('a[href="login.html"], a[href="register.html"]').forEach(a=>{
    if(a.hasAttribute('data-logout')) return;
    a.setAttribute('href', target);
    const txt = (a.textContent || '').trim();
    if(/giriş|başla|kayıt|hesabıma/i.test(txt)) a.textContent = s.role === 'admin' ? 'Admin Panelim' : 'Müşteri Panelim';
  });
}

renderBalanceRequests = async function(){
  const mount=document.getElementById("requestList");
  if(!mount || !supabaseClient) return;
  const { data, error } = await supabaseClient.from("balance_requests").select("*").order("created_at", { ascending: false });
  if(error){ console.error(error); mount.innerHTML='<div class="status-note">Bakiye talepleri yüklenemedi.</div>'; return; }
  if(!data || !data.length){ mount.innerHTML='<div class="status-note">Henüz bakiye talebi yok.</div>'; return; }
  mount.innerHTML = data.map(req=>`
    <div class="item-row">
      <div>
        <strong>${req.full_name || 'Kullanıcı'}</strong>
        <div class="small">${req.email || '-'} • ${fmtMoney(req.amount)} • ${req.note || '-'}</div>
        <div class="small">Durum: ${req.status === 'pending' ? 'Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</div>
      </div>
      <div class="item-actions">
        ${req.status === 'pending' ? `<button class="small-btn green" data-sb-approve="${req.id}">Onayla</button><button class="small-btn red" data-sb-reject="${req.id}">Reddet</button>` : ''}
      </div>
    </div>
  `).join("");

  mount.querySelectorAll("[data-sb-approve]").forEach(btn=>btn.addEventListener("click", async ()=>{
    const id=btn.getAttribute("data-sb-approve");
    const { data: req, error: reqErr } = await supabaseClient.from('balance_requests').select('*').eq('id', id).maybeSingle();
    if(reqErr || !req){ console.error(reqErr); alert('Talep bulunamadı.'); return; }
    if(req.status !== 'pending'){ renderBalanceRequests(); return; }
    const targetProfile = req.user_id
      ? await sbGetProfileByUserId(req.user_id)
      : await sbGetProfileByEmail(req.email);
    if(!targetProfile){ alert('Kullanıcı profili bulunamadı.'); return; }
    const newBalance = Number(targetProfile.balance || 0) + Number(req.amount || 0);
    const { error: balErr } = await supabaseClient.from('profiles').update({ balance:newBalance }).eq('id', targetProfile.id);
    if(balErr){ console.error(balErr); alert('Bakiye güncellenemedi.'); return; }
    const { error: upErr } = await supabaseClient.from('balance_requests').update({ status: 'approved' }).eq('id', id);
    if(upErr){ console.error(upErr); alert('Talep onaylanamadı.'); return; }
    try{ await sbRefreshPublicSession(); }catch(e){}
    renderBalanceRequests(); renderAdminSummary(); renderUsersAdmin(); renderCustomerBalance(); renderCustomerRequests();
  }));
  mount.querySelectorAll("[data-sb-reject]").forEach(btn=>btn.addEventListener("click", async ()=>{
    const id=btn.getAttribute("data-sb-reject");
    const { error } = await supabaseClient.from("balance_requests").update({ status: "rejected" }).eq("id", id);
    if(error){ console.error(error); alert("Reddedilemedi."); return; }
    renderBalanceRequests(); renderAdminSummary(); renderCustomerRequests();
  }));
};

window.bindProfileRequestForm = function(){
  const oldForm = document.getElementById('profileRequestForm');
  if(!oldForm || !supabaseClient) return;
  const form = oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(form, oldForm);
  form.dataset.supabaseBound = '1';
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const msg = document.getElementById('profileRequestMsg');
    const profile = await sbGetCurrentProfile();
    if(!profile){ if(msg) showMessage(msg, 'Profil bulunamadı. Tekrar giriş yapın.', false); return false; }
    const newEmail = (form.querySelector('[name="newEmail"]')?.value || '').trim();
    const newPhone = (form.querySelector('[name="newPhone"]')?.value || '').trim();
    const newPassword = (form.querySelector('[name="newPassword"]')?.value || '').trim();
    if(!newEmail && !newPhone && !newPassword){ if(msg) showMessage(msg, 'En az bir alan doldur.', false); return false; }
    const payload = {
      user_id: profile.id,
      user_email: profile.email,
      user_name: profile.full_name || profile.email,
      new_email: newEmail || null,
      new_phone: newPhone || null,
      new_password: newPassword || null,
      status: 'pending'
    };
    const { error } = await supabaseClient.from('profile_requests').insert([payload]);
    if(error){ console.error(error); if(msg) showMessage(msg, 'Talep gönderilemedi.', false); return false; }
    form.reset();
    if(msg) showMessage(msg, 'Profil talebi admine gönderildi.');
    return false;
  });
};

window.renderProfileRequestsAdmin = async function(){
  const mount = document.getElementById('profileRequestsList');
  if(!mount || !supabaseClient) return;
  const { data, error } = await supabaseClient.from('profile_requests').select('*').order('created_at', { ascending:false });
  if(error){ console.error(error); mount.innerHTML='<div class="status-note">Profil talepleri yüklenemedi.</div>'; return; }
  if(!data || !data.length){ mount.innerHTML='<div class="status-note">Profil değişiklik talebi yok.</div>'; return; }
  mount.innerHTML = data.map(req => `
    <div class="item-row">
      <div>
        <strong>${req.user_name || 'Kullanıcı'}</strong>
        <div class="small">Hesap: ${req.user_email || '-'}</div>
        <div class="small">Yeni e-posta: ${req.new_email || '-'} • Yeni telefon: ${req.new_phone || '-'}</div>
        <div class="small">Şifre değişimi: ${req.new_password ? 'Var' : 'Yok'} • Durum: ${req.status || 'pending'}</div>
      </div>
      <div class="item-actions">
        ${req.status === 'pending' ? `<button class="small-btn green" data-approve-profile="${req.id}">Onayla</button><button class="small-btn red" data-reject-profile="${req.id}">Reddet</button>` : ''}
      </div>
    </div>
  `).join('');

  mount.querySelectorAll('[data-approve-profile]').forEach(btn=>btn.addEventListener('click', async ()=>{
    const id = btn.getAttribute('data-approve-profile');
    const { data: req, error: reqErr } = await supabaseClient.from('profile_requests').select('*').eq('id', id).maybeSingle();
    if(reqErr || !req){ console.error(reqErr); alert('Talep bulunamadı.'); return; }
    const updates = {};
    if(req.new_email) updates.email = req.new_email;
    if(req.new_phone) updates.phone = req.new_phone;
    if(req.new_email || req.new_phone){
      const { error: profErr } = await supabaseClient.from('profiles').update(updates).eq('id', req.user_id);
      if(profErr){ console.error(profErr); alert('Profil güncellenemedi.'); return; }
    }
    const { error: upErr } = await supabaseClient.from('profile_requests').update({ status:'approved' }).eq('id', id);
    if(upErr){ console.error(upErr); alert('Talep güncellenemedi.'); return; }
    renderProfileRequestsAdmin();
  }));

  mount.querySelectorAll('[data-reject-profile]').forEach(btn=>btn.addEventListener('click', async ()=>{
    const id = btn.getAttribute('data-reject-profile');
    const { error } = await supabaseClient.from('profile_requests').update({ status:'rejected' }).eq('id', id);
    if(error){ console.error(error); alert('Talep reddedilemedi.'); return; }
    renderProfileRequestsAdmin();
  }));
};

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(async function(){
    try{ await sbRefreshPublicSession(); }catch(e){}
    try{ await sbDecoratePublicAuthLinks(); }catch(e){}
    try{ window.bindProfileRequestForm(); }catch(e){ console.error(e); }
    try{ window.renderProfileRequestsAdmin(); }catch(e){ console.error(e); }
  }, 120);
});
/* ===== end v40 ===== */
