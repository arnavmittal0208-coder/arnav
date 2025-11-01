// src/ExchangeSkill.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const openMeet = () => {
  window.open('https://meet.google.com/new', '_blank');
};

const ExchangeSkill = () => {
  const [swaps, setSwaps] = useState([]);
  const [isProposing, setIsProposing] = useState(false);
  const [offer, setOffer] = useState('');
  const [want, setWant] = useState('');

  useEffect(()=>{
    const q = query(collection(db, 'swaps'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSwaps(arr);
    });
    return ()=>unsub();
  },[]);

  const propose = async (e) => {
    e.preventDefault();
    if(!offer || !want) return;
    try{
      await addDoc(collection(db, 'swaps'), {
        offers: offer,
        wants: want,
        proposer: 'You (demo)',
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setOffer(''); setWant(''); setIsProposing(false);
    }catch(err){console.error(err)}
  };

  const acceptProposal = async (swap) => {
    try {
      const ref = doc(db, 'swaps', swap.id);
      await updateDoc(ref, { 
        status: 'Approved', 
        approvedBy: 'You (demo)'
      });
      alert('Swap approved! You can start a video session.');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSwap = async (swapId) => {
    if(!window.confirm('Are you sure you want to delete this swap proposal?')) return;
    try {
      await deleteDoc(doc(db, 'swaps', swapId));
      // No need to update state, onSnapshot will handle it
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete. Try again.');
    }
  };

  return (
    <div className="page-container">
      <Link to="/" className="back-link">← Back</Link>
      <h1>Skill Exchange 🤝</h1>
      <p style={{color:'#555'}}>Propose swaps and accept proposals. Approved swaps allow a quick video session.</p>

      <button className="fab" title="Propose" onClick={()=>setIsProposing(true)}>+</button>

      {isProposing && (
        <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', zIndex:1000, padding:'16px'}}>
          <form onSubmit={propose} style={{background:'#fff', padding:20, borderRadius:8, width:'100%', maxWidth:400}}>
            <h3 style={{marginTop:0}}>Propose Swap</h3>
            <input 
              value={offer} 
              onChange={(e)=>setOffer(e.target.value)} 
              placeholder="I offer (e.g., Python)" 
              required 
              style={{width:'100%', padding:'10px 12px', margin:'8px 0', fontSize:'14px', borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}}
            />
            <input 
              value={want} 
              onChange={(e)=>setWant(e.target.value)} 
              placeholder="I want (e.g., UI/UX)" 
              required 
              style={{width:'100%', padding:'10px 12px', margin:'8px 0', fontSize:'14px', borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}}
            />
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button type="submit" style={{flex:1, padding:'12px', background:'#007bff', color:'#fff', border:'none', borderRadius:6, fontSize:'14px', fontWeight:600, cursor:'pointer'}}>Submit</button>
              <button type="button" onClick={()=>setIsProposing(false)} style={{flex:1, padding:'12px', background:'#dc3545', color:'#fff', border:'none', borderRadius:6, fontSize:'14px', fontWeight:600, cursor:'pointer'}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{marginTop:16}}>
        {swaps.length === 0 ? <p>No proposals yet. Create one!</p> :
          swaps.map(s => (
            <div key={s.id} className="swap-card">
              <div className="swap-header">
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>{s.proposer}</div>
                  <div style={{fontSize:13, color:'#555', marginTop:4}}>
                    Offers: <strong>{s.offers}</strong> — Wants: <strong>{s.wants}</strong>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:13, color: s.status === 'Pending' ? 'orange' : 'green', fontWeight:600}}>{s.status}</div>
                </div>
              </div>

              <div className="swap-actions">
                {s.status === 'Pending' ? (
                  <button 
                    onClick={()=>acceptProposal(s)} 
                    style={{background:'#28a745', color:'#fff'}}
                  >
                    Accept Swap
                  </button>
                ) : (
                  <button 
                    onClick={openMeet} 
                    style={{background:'#6f42c1', color:'#fff'}}
                  >
                    Start Video Session
                  </button>
                )}
                
                <button 
                  onClick={() => deleteSwap(s.id)}
                  className="delete-btn"
                  style={{background:'#dc3545', color:'#fff'}}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default ExchangeSkill;
