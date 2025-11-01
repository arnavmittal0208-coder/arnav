// src/TaskMarketplace.js
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
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';

// Simple chat modal component
const ChatModal = ({ taskId, candidateName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    const chatRef = collection(db, 'tasks', taskId, 'chat');
    const q = query(chatRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, [taskId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addDoc(collection(db, 'tasks', taskId, 'chat'), {
      text: input,
      sender: candidateName,
      createdAt: serverTimestamp()
    });
    setInput('');
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'16px'}}>
      <div style={{background:'#fff', borderRadius:8, width:'100%', maxWidth:450, maxHeight:'min(500px, 80vh)', display:'flex', flexDirection:'column', boxShadow:'0 2px 16px #0002'}}>
        <div style={{padding:'12px 16px', borderBottom:'1px solid #eee', fontWeight:700, fontSize:'clamp(14px, 3vw, 16px)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>Chat with {candidateName}</span>
          <button onClick={onClose} style={{background:'none', border:'none', fontSize:24, cursor:'pointer', padding:'0 8px', lineHeight:1}}>×</button>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'12px 16px'}}>
          {messages.length === 0 && <div style={{color:'#888', fontSize:'clamp(13px, 2.5vw, 14px)'}}>No messages yet.</div>}
          {messages.map((msg, idx) => (
            <div key={idx} style={{marginBottom:10, textAlign:msg.sender===candidateName?'right':'left'}}>
              <div style={{display:'inline-block', background:msg.sender===candidateName?'#e0f7fa':'#f1f1f1', padding:'8px 12px', borderRadius:8, maxWidth:'80%', wordBreak:'break-word', fontSize:'clamp(13px, 2.5vw, 14px)'}}>
                <span style={{fontWeight:600}}>{msg.sender}: </span>{msg.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} style={{display:'flex', borderTop:'1px solid #eee', padding:'8px 12px', gap:8}}>
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            placeholder="Type a message..." 
            style={{
              flex:1, 
              padding:'10px 12px', 
              borderRadius:6, 
              border:'1px solid #ccc', 
              fontSize:'clamp(13px, 2.5vw, 14px)',
              boxSizing:'border-box'
            }} 
          />
          <button 
            type="submit" 
            style={{
              padding:'10px 16px', 
              background:'#007bff', 
              color:'#fff', 
              border:'none', 
              borderRadius:6, 
              cursor:'pointer', 
              fontWeight:600,
              fontSize:'clamp(13px, 2.5vw, 14px)',
              whiteSpace:'nowrap'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const TaskMarketplace = () => {
  const [tasks, setTasks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [chatTaskId, setChatTaskId] = useState(null);
  const [chatCandidate, setChatCandidate] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(arr);
    }, (err) => console.error(err));
    return () => unsub();
  }, []);

  const postTask = async (e) => {
    e.preventDefault();
    if (!title || !price) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        price: Number(price),
        poster: 'You (demo)',
        status: 'Open',
        applicants: [],
        createdAt: serverTimestamp()
      });
      setTitle('');
      setPrice('');
      setIsAdding(false);
    } catch (err) {
      console.error('post error', err);
    }
  };

  const applyForTask = async (taskId) => {
    const name = prompt('Your name to apply (e.g., Rahul):');
    if (!name) return;
    const message = prompt('Short message (optional):') || '';
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        applicants: arrayUnion({ name, message, status: 'Pending', appliedAt: new Date().toISOString() })
      });
      alert('Applied successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to apply');
    }
  };

  const changeApplicantStatus = async (taskId, applicantObj, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        applicants: arrayRemove(applicantObj)
      });
      const updated = { ...applicantObj, status: newStatus, decidedAt: new Date().toISOString() };
      await updateDoc(taskRef, {
        applicants: arrayUnion(updated),
        status: newStatus === 'Accepted' ? 'Assigned' : 'Open'
      });
      if (newStatus === 'Accepted') {
        alert(`${applicantObj.name} accepted for this task.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    if(!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete. Try again.');
    }
  };

  const submitRating = async () => {
    if (!ratingModal) return;
    try {
      await addDoc(collection(db, 'tasks', ratingModal.taskId, 'ratings'), {
        candidate: ratingModal.candidate,
        rating: ratingValue,
        comment: ratingComment,
        createdAt: serverTimestamp()
      });
      setRatingModal(null);
      setRatingValue(5);
      setRatingComment('');
      alert('Rating submitted!');
    } catch (err) {
      alert('Failed to submit rating');
    }
  };

  return (
    <div className="page-container">
      <Link to="/" className="back-link">← Back</Link>
      <h1>Task Marketplace 💼</h1>
      <p style={{color:'#555'}}>Post simple college tasks and apply for work. Real-time via Firestore.</p>

      <button className="fab" title="Add Task" onClick={() => setIsAdding(true)}>+</button>

      {isAdding && (
        <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', zIndex:1000, padding:'16px'}}>
          <form onSubmit={postTask} style={{background:'#fff', padding:20, borderRadius:8, width:'100%', maxWidth:400}}>
            <h3 style={{marginTop:0}}>Post a Task</h3>
            <input 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)} 
              placeholder="Task title (e.g., Create PPT)" 
              style={{width:'100%', padding:'10px 12px', margin:'8px 0', fontSize:'14px', borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}} 
              required
            />
            <input 
              value={price} 
              onChange={(e)=>setPrice(e.target.value)} 
              placeholder="Price (₹)" 
              type="number" 
              style={{width:'100%', padding:'10px 12px', margin:'8px 0', fontSize:'14px', borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}} 
              required
            />
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button type="submit" style={{flex:1, padding:'12px', background:'#28a745', color:'#fff', border:'none', borderRadius:6, fontSize:'14px', fontWeight:600, cursor:'pointer'}}>Post</button>
              <button type="button" onClick={()=>setIsAdding(false)} style={{flex:1, padding:'12px', background:'#dc3545', color:'#fff', border:'none', borderRadius:6, fontSize:'14px', fontWeight:600, cursor:'pointer'}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{marginTop:16}}>
        {tasks.length === 0 ? <p>No tasks yet. Be the first!</p> :
          tasks.map(t => (
            <div key={t.id} className="task-card">
              <div className="task-header">
                <div style={{flex:1}}>
                  <h4 style={{margin:'0 0 6px 0'}}>{t.title}</h4>
                  <div style={{color:'#555', fontSize:13}}>Posted by: {t.poster}</div>
                </div>
                <div>
                  <strong style={{color:'#00aa66'}}>₹{t.price}</strong>
                  <div style={{fontSize:12, color:t.status==='Open'?'orange':'green', fontWeight:600}}>{t.status}</div>
                </div>
              </div>

              <div className="task-actions">
                <button 
                  onClick={()=>applyForTask(t.id)} 
                  style={{background:'#007bff', color:'#fff'}}
                >
                  Apply
                </button>
                <button 
                  onClick={() => deleteTask(t.id)} 
                  style={{background:'#dc3545', color:'#fff'}}
                >
                  Delete
                </button>

                {t.poster && t.poster.includes('You') && (
                  <details style={{display:'block', marginTop:8, width:'100%'}}>
                    <summary style={{cursor:'pointer', color:'#007bff', fontWeight:600, padding:'8px 0'}}>
                      Applicants ({(t.applicants||[]).length})
                    </summary>
                    <div style={{marginTop:8}}>
                      {(t.applicants||[]).length === 0 && <div style={{color:'#666', fontSize:13}}>No applicants yet.</div>}
                      {(t.applicants||[]).map((app, idx)=>(
                        <div key={idx} style={{border:'1px solid #eee', padding:12, borderRadius:6, marginBottom:8, background:'#f9fafb'}}>
                          <div style={{fontWeight:700, fontSize:14}}>
                            {app.name} <small style={{color:'#666', fontWeight:400}}>({app.status})</small>
                          </div>
                          <div style={{fontSize:13, color:'#444', marginTop:4}}>{app.message}</div>
                          <div className="applicant-actions">
                            {app.status === 'Pending' && <>
                              <button 
                                onClick={()=>changeApplicantStatus(t.id, app, 'Accepted')} 
                                style={{background:'#28a745', color:'#fff'}}
                              >
                                Accept
                              </button>
                              <button 
                                onClick={()=>changeApplicantStatus(t.id, app, 'Rejected')} 
                                style={{background:'#dc3545', color:'#fff'}}
                              >
                                Reject
                              </button>
                            </>}
                            {app.status === 'Accepted' && (
                              <>
                                <button 
                                  onClick={()=>{setChatTaskId(t.id);setChatCandidate(app.name);}} 
                                  style={{background:'#007bff', color:'#fff'}}
                                >
                                  💬 Chat
                                </button>
                                <button 
                                  onClick={()=>window.open('https://razorpay.com/payment-button-demo/', '_blank')} 
                                  style={{background:'#ffc107', color:'#222'}}
                                >
                                  💳 Pay
                                </button>
                                <button 
                                  onClick={()=>setRatingModal({taskId: t.id, candidate: app.name})} 
                                  style={{background:'#28a745', color:'#fff'}}
                                >
                                  ⭐ Rate
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))
        }
      </div>

      {chatTaskId && chatCandidate && (
        <ChatModal taskId={chatTaskId} candidateName={chatCandidate} onClose={()=>{setChatTaskId(null);setChatCandidate(null);}} />
      )}

      {ratingModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'16px'}}>
          <div style={{background:'#fff', borderRadius:8, width:'100%', maxWidth:400, padding:'clamp(16px, 4vw, 24px)', boxShadow:'0 2px 16px #0002'}}>
            <h3 style={{fontSize:'clamp(18px, 4vw, 20px)', marginTop:0}}>Rate {ratingModal.candidate}</h3>
            <div style={{margin:'16px 0'}}>
              <label style={{fontSize:'clamp(14px, 3vw, 15px)', fontWeight:600}}>Rating: </label>
              <select 
                value={ratingValue} 
                onChange={e=>setRatingValue(Number(e.target.value))} 
                style={{padding:'8px 12px', borderRadius:6, border:'1px solid #ddd', fontSize:'14px', marginLeft:8}}
              >
                {[5,4,3,2,1].map(v=>(<option key={v} value={v}>{v} ⭐</option>))}
              </select>
            </div>
            <textarea 
              value={ratingComment} 
              onChange={e=>setRatingComment(e.target.value)} 
              placeholder="Comment (optional)" 
              style={{
                width:'100%', 
                minHeight:80, 
                marginBottom:12, 
                padding:'10px 12px', 
                borderRadius:6, 
                border:'1px solid #ddd', 
                fontSize:'clamp(13px, 2.5vw, 14px)', 
                boxSizing:'border-box',
                fontFamily:'inherit'
              }} 
            />
            <div style={{display:'flex', gap:8}}>
              <button 
                onClick={submitRating} 
                style={{flex:1, padding:'12px', background:'#28a745', color:'#fff', border:'none', borderRadius:6, fontSize:'14px', fontWeight:600, cursor:'pointer'}}
              >
                Submit
              </button>
              <button 
                onClick={()=>setRatingModal(null)} 
                style={{flex:1, padding:'12px', background:'#dc3545', color:'#fff', border:'none', borderRadius:6, fontSize:'14px', fontWeight:600, cursor:'pointer'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMarketplace;
