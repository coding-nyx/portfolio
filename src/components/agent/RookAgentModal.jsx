import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { askRookAgent } from '../../services/rookClient';
import '../../styles/rook.css';

export default function RookAgentModal({ open, onOpenChange, returnFocusRef, onOpenResume }) {
  const panel = useRef(null), input = useRef(null), transcript = useRef(null), request = useRef(null), pending = useRef(false);
  const [query,setQuery] = useState('');
  const [messages,setMessages] = useState([{role:'assistant',content:'Hi, I’m **Rook**. Ask about Raj’s iOS work, native mobile apps and public projects. Use Contact to compose a message to Raj.'}]);
  const [busy,setBusy] = useState(false);
  const [mode,setMode] = useState(null);
  const [notice,setNotice] = useState('');
  const close = useCallback(()=>{
    request.current?.abort();
    onOpenChange(false);
    requestAnimationFrame(()=>{
      const visible = el => el?.checkVisibility() && getComputedStyle(el).visibility!=='hidden';
      const opener=returnFocusRef?.current;
      const fallback=[...document.querySelectorAll('[data-ask]')].find(visible);
      (visible(opener)?opener:fallback)?.focus({preventScroll:true});
    });
  },[onOpenChange,returnFocusRef]);
  useEffect(()=>{
    if(!open)return;
    input.current?.focus({preventScroll:true});
    const key=e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
      if(e.key!=='Tab')return;
      const focusable=[...panel.current.querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&el.checkVisibility());
      if(!focusable.length)return;
      e.preventDefault();const i=focusable.indexOf(document.activeElement);
      focusable[(i+(e.shiftKey?-1:1)+focusable.length)%focusable.length].focus();
    };
    document.addEventListener('keydown',key,true);
    return()=>document.removeEventListener('keydown',key,true);
  },[open,close]);
  useEffect(()=>{if(transcript.current)transcript.current.scrollTop=transcript.current.scrollHeight;},[messages]);
  useEffect(()=>()=>request.current?.abort(),[]);
  const send = async value => {
    const text=(value??query).trim();if(!text||pending.current)return;
    pending.current=true;request.current=new AbortController();
    setQuery('');setBusy(true);setNotice('');
    const next=[...messages,{role:'user',content:text}];setMessages(next);
    try {
      const answer=await askRookAgent({messages:next,signal:request.current.signal,onMode:setMode,onAction:a=>{if(a.type==='open_resume')onOpenResume?.();}});
      setMessages([...next,{role:'assistant',content:answer}]);
    } catch {setNotice('Response cancelled. You can ask again.');}
    finally{pending.current=false;setBusy(false);input.current?.focus({preventScroll:true});}
  };
  if(!open)return null;
  return <><div className="rook-scrim" onClick={close} /><div ref={panel} id="rook-popover" className="rook-popover" role="dialog" aria-modal="true" aria-labelledby="rook-title" aria-describedby="rook-sub"><div className="rook-header"><div><h2 id="rook-title">Rook</h2><p id="rook-sub">Answers about Raj</p></div><button className="rook-close" type="button" aria-label="Close Rook" onClick={close}>×</button></div>{mode&&<p className="rook-status" role="status" data-source={mode.source}>{mode.source==='deepseek'?`DeepSeek · ${mode.model}`:'Live answer unavailable. Showing saved portfolio information.'}</p>}{notice&&<p className="rook-status" role="status">{notice}</p>}<div ref={transcript} className="rook-transcript" role="log" aria-live="polite">{messages.map((m,i)=><div key={i} className={`rook-message ${m.role}`}>{m.role==='user'?m.content:<ReactMarkdown>{m.content}</ReactMarkdown>}</div>)}</div><div className="rook-chips" aria-label="Suggested questions"><button disabled={busy} onClick={()=>send('What does Raj work on?')}>What does Raj work on?</button><button disabled={busy} onClick={()=>send('Linux and embedded systems')}>Linux &amp; systems work</button><button disabled={busy} onClick={()=>send('Contact Raj')}>Contact Raj</button></div><form className="rook-input" onSubmit={e=>{e.preventDefault();send();}}><label className="sr-only" htmlFor="rook-q">Ask Rook a question</label><input ref={input} id="rook-q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ask about Raj" maxLength={2000} autoComplete="off" /><button type="submit" disabled={busy||!query.trim()} aria-label="Send to Rook">{busy?'…':'↑'}</button></form><p className="rook-privacy">Questions are processed by DeepSeek.</p></div></>;
}
