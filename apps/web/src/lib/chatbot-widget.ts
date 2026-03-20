/**
 * Generates the chatbot widget script to inject into published sites.
 * The widget shows a floating chat bubble that connects to our chatbot API.
 * Supports Hebrew RTL, custom theming, and lead capture.
 */
export const generateChatbotWidget = (siteId: string, opts?: {
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  greeting?: string
  locale?: 'en' | 'he'
}): string => {
  const color = opts?.primaryColor || '#7C3AED'
  const pos = opts?.position || 'bottom-right'
  const isRtl = opts?.locale === 'he'
  const greeting = opts?.greeting || (isRtl ? '\u05E9\u05DC\u05D5\u05DD! \u05D0\u05D9\u05DA \u05D0\u05E4\u05E9\u05E8 \u05DC\u05E2\u05D6\u05D5\u05E8?' : 'Hi! How can I help?')

  const posRight = pos === 'bottom-right'
  const posStyle = posRight ? 'right:24px' : 'left:24px'
  const dir = isRtl ? 'rtl' : 'ltr'

  const labels = {
    header: isRtl ? '\u05E6\u05F3\u05D0\u05D8 \u05E2\u05DD AI' : 'AI Chat',
    placeholder: isRtl ? '\u05DB\u05EA\u05D1\u05D5 \u05D4\u05D5\u05D3\u05E2\u05D4...' : 'Type a message...',
    send: isRtl ? '\u05E9\u05DC\u05D7' : 'Send',
    error: isRtl ? '\u05D0\u05D9\u05E8\u05E2\u05D4 \u05E9\u05D2\u05D9\u05D0\u05D4' : 'Something went wrong',
    connError: isRtl ? '\u05E9\u05D2\u05D9\u05D0\u05EA \u05D7\u05D9\u05D1\u05D5\u05E8' : 'Connection error',
    leaveDetails: isRtl ? '\u05D4\u05E9\u05D0\u05D9\u05E8\u05D5 \u05E4\u05E8\u05D8\u05D9\u05DD' : 'Leave your details',
    name: isRtl ? '\u05E9\u05DD' : 'Name',
    email: isRtl ? '\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC' : 'Email',
    phone: isRtl ? '\u05D8\u05DC\u05E4\u05D5\u05DF' : 'Phone',
    submit: isRtl ? '\u05E9\u05DC\u05D7' : 'Submit',
    thanks: isRtl ? '\u05EA\u05D5\u05D3\u05D4! \u05E0\u05D7\u05D6\u05D5\u05E8 \u05D0\u05DC\u05D9\u05DB\u05DD \u05D1\u05D4\u05E7\u05D3\u05DD.' : 'Thanks! We\'ll be in touch.',
  }

  return `<!-- UBuilder AI Chatbot Widget -->
<style>
  .ub-chat-btn{position:fixed;${posStyle};bottom:24px;width:56px;height:56px;border-radius:50%;background:${color};color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;justify-content:center;transition:transform 0.3s,box-shadow 0.3s;font-family:system-ui,-apple-system,sans-serif}
  .ub-chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,0.3)}
  .ub-chat-panel{position:fixed;${posStyle};bottom:90px;width:360px;max-height:520px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.15);z-index:9999;display:none;flex-direction:column;overflow:hidden;direction:${dir};font-family:system-ui,-apple-system,sans-serif}
  .ub-chat-panel.ub-open{display:flex}
  .ub-chat-header{background:${color};color:#fff;padding:16px;font-weight:600;font-size:15px;display:flex;justify-content:space-between;align-items:center}
  .ub-chat-close{cursor:pointer;font-size:20px;line-height:1;opacity:0.8;background:none;border:none;color:#fff;padding:0}
  .ub-chat-close:hover{opacity:1}
  .ub-chat-messages{flex:1;padding:16px;overflow-y:auto;max-height:300px;display:flex;flex-direction:column;gap:10px}
  .ub-chat-msg{padding:10px 14px;border-radius:12px;max-width:85%;font-size:14px;line-height:1.5;word-wrap:break-word}
  .ub-chat-msg.bot{background:#f3f4f6;color:#1f2937;align-self:flex-start;border-end-start-radius:4px}
  .ub-chat-msg.user{background:${color};color:#fff;align-self:flex-end;border-end-end-radius:4px}
  .ub-chat-msg.typing{opacity:0.7}
  .ub-chat-input{display:flex;padding:12px;border-top:1px solid #e5e7eb;gap:8px}
  .ub-chat-input input{flex:1;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;direction:${dir}}
  .ub-chat-input input:focus{border-color:${color};box-shadow:0 0 0 2px ${color}33}
  .ub-chat-input button{background:${color};color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:14px;font-weight:500;white-space:nowrap}
  .ub-chat-input button:hover{opacity:0.9}
  .ub-chat-lead{padding:12px 16px;border-top:1px solid #e5e7eb;background:#f9fafb}
  .ub-chat-lead summary{font-size:13px;color:#6b7280;cursor:pointer;user-select:none}
  .ub-chat-lead summary:hover{color:#374151}
  .ub-chat-lead-form{display:flex;flex-direction:column;gap:6px;margin-top:8px}
  .ub-chat-lead-form input{border:1px solid #d1d5db;border-radius:6px;padding:6px 10px;font-size:13px;outline:none;direction:${dir}}
  .ub-chat-lead-form input:focus{border-color:${color}}
  .ub-chat-lead-form button{background:${color};color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:500}
  .ub-chat-lead-form button:hover{opacity:0.9}
  .ub-chat-lead-thanks{font-size:13px;color:#10b981;padding:4px 0;font-weight:500}
  @media(max-width:420px){.ub-chat-panel{left:8px;right:8px;width:auto;bottom:80px}}
</style>
<div class="ub-chat-btn" id="ub-chat-toggle" aria-label="Chat">
  <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
</div>
<div class="ub-chat-panel" id="ub-chat-panel">
  <div class="ub-chat-header">
    <span>${labels.header}</span>
    <button class="ub-chat-close" id="ub-chat-close" aria-label="Close">&times;</button>
  </div>
  <div class="ub-chat-messages" id="ub-messages">
    <div class="ub-chat-msg bot">${greeting}</div>
  </div>
  <div class="ub-chat-lead" id="ub-lead-section">
    <details>
      <summary>${labels.leaveDetails}</summary>
      <div class="ub-chat-lead-form" id="ub-lead-form">
        <input id="ub-lead-name" placeholder="${labels.name}" type="text">
        <input id="ub-lead-email" placeholder="${labels.email}" type="email">
        <input id="ub-lead-phone" placeholder="${labels.phone}" type="tel">
        <button id="ub-lead-submit">${labels.submit}</button>
      </div>
    </details>
  </div>
  <div class="ub-chat-input">
    <input id="ub-input" placeholder="${labels.placeholder}" autocomplete="off">
    <button id="ub-send">${labels.send}</button>
  </div>
</div>
<script>
(function(){
  var panel=document.getElementById('ub-chat-panel');
  var toggle=document.getElementById('ub-chat-toggle');
  var closeBtn=document.getElementById('ub-chat-close');
  var input=document.getElementById('ub-input');
  var sendBtn=document.getElementById('ub-send');
  var msgs=document.getElementById('ub-messages');
  var leadSubmit=document.getElementById('ub-lead-submit');
  var siteId='${siteId}';
  var sessionId=null;
  var leadSent=false;

  toggle.addEventListener('click',function(){panel.classList.toggle('ub-open');if(panel.classList.contains('ub-open'))input.focus()});
  closeBtn.addEventListener('click',function(){panel.classList.remove('ub-open')});

  function addMsg(text,cls){
    var d=document.createElement('div');
    d.className='ub-chat-msg '+cls;
    d.textContent=text;
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
    return d;
  }

  function sendMessage(){
    var msg=input.value.trim();
    if(!msg)return;
    input.value='';
    addMsg(msg,'user');
    var typing=addMsg('...','bot typing');

    var payload={message:msg};
    if(sessionId)payload.sessionId=sessionId;
    if(!leadSent){
      var n=document.getElementById('ub-lead-name').value.trim();
      var e=document.getElementById('ub-lead-email').value.trim();
      var p=document.getElementById('ub-lead-phone').value.trim();
      if(n)payload.visitorName=n;
      if(e)payload.visitorEmail=e;
      if(p)payload.visitorPhone=p;
    }

    fetch('/api/chatbot/'+siteId,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    })
    .then(function(r){return r.json()})
    .then(function(d){
      if(d.sessionId)sessionId=d.sessionId;
      typing.classList.remove('typing');
      typing.textContent=d.response||'${labels.error}';
      msgs.scrollTop=msgs.scrollHeight;
    })
    .catch(function(){
      typing.classList.remove('typing');
      typing.textContent='${labels.connError}';
    });
  }

  sendBtn.addEventListener('click',sendMessage);
  input.addEventListener('keydown',function(e){if(e.key==='Enter')sendMessage()});

  leadSubmit.addEventListener('click',function(){
    var name=document.getElementById('ub-lead-name').value.trim();
    var email=document.getElementById('ub-lead-email').value.trim();
    var phone=document.getElementById('ub-lead-phone').value.trim();
    if(!name&&!email&&!phone)return;

    var leadPayload={message:'[Lead submitted contact details]',visitorName:name||undefined,visitorEmail:email||undefined,visitorPhone:phone||undefined};
    if(sessionId)leadPayload.sessionId=sessionId;
    fetch('/api/chatbot/'+siteId,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(leadPayload)
    }).then(function(r){return r.json()}).then(function(d){if(d.sessionId)sessionId=d.sessionId}).catch(function(){});

    var form=document.getElementById('ub-lead-form');
    form.innerHTML='<div class="ub-chat-lead-thanks">${labels.thanks}</div>';
    leadSent=true;
  });
})();
</script>
<!-- /UBuilder AI Chatbot Widget -->`
}
