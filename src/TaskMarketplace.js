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

const TaskMarketplace = () => {
  const [tasks, setTasks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  // Real-time listener
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
        poster: 'You (demo)', // placeholder poster; later you can use auth
        status: 'Open',
        applicants: [], // array of {name, message, status}
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
      // remove old applicant object and add updated one (Firestore arrays are not update-in-place)
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
      // No need to update state, onSnapshot will handle it
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete. Try again.');
    }
  };

  return (
    <div className="page-container">
      <Link to="/" className="back-link">← Back</Link>
      <h1>Task Marketplace 💼</h1>
      <p style={{color:'#555'}}>Post simple college tasks and apply for work. Real-time via Firestore.</p>

      <button className="fab" title="Add Task" onClick={() => setIsAdding(true)}>+</button>

      {isAdding && (
        <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)'}}>
          <form onSubmit={postTask} style={{background:'#fff', padding:20, borderRadius:8, width:360}}>
            <h3>Post a Task</h3>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Task title (e.g., Create PPT)" style={{width:'100%', padding:8, margin:'8px 0'}} required/>
            <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price (₹)" type="number" style={{width:'100%', padding:8, margin:'8px 0'}} required/>
            <div style={{display:'flex', gap:8}}>
              <button type="submit" style={{flex:1, padding:10, background:'#28a745', color:'#fff', border:'none', borderRadius:6}}>Post</button>
              <button type="button" onClick={()=>setIsAdding(false)} style={{flex:1, padding:10, background:'#dc3545', color:'#fff', border:'none', borderRadius:6}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{marginTop:16}}>
        {tasks.length === 0 ? <p>No tasks yet. Be the first!</p> :
          tasks.map(t => (
            <div key={t.id} className="task-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <h4 style={{margin:'0 0 6px 0'}}>{t.title}</h4>
                  <div style={{color:'#555', fontSize:13}}>Posted by: {t.poster}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <strong style={{color:'#00aa66'}}>₹{t.price}</strong>
                  <div style={{fontSize:12,color:t.status==='Open'?'orange':'green'}}>{t.status}</div>
                </div>
              </div>

              <div style={{marginTop:10, display:'flex', gap:8, alignItems:'flex-start'}}>
                <div style={{display:'flex', gap:8, flex:1}}>
                  <button onClick={()=>applyForTask(t.id)} style={{padding:'8px 12px', background:'#007bff', color:'#fff', border:'none', borderRadius:6}}>Apply</button>

                  {/* Delete button shown for all tasks in demo */}
                  <button 
                    onClick={() => deleteTask(t.id)}
                    style={{
                      padding:'8px 12px', 
                      background:'#dc3545', 
                      color:'#fff', 
                      border:'none', 
                      borderRadius:6
                    }}
                  >
                    Delete
                  </button>

                  {/* If you are poster (we use poster === 'You (demo)') show applicants */}
                  {t.poster && t.poster.includes('You') && (
                    <details style={{display:'inline-block', marginLeft:8}}>
                      <summary style={{cursor:'pointer', color:'#007bff'}}>Applicants ({(t.applicants||[]).length})</summary>
                      <div style={{marginTop:8}}>
                        {(t.applicants||[]).length === 0 && <div style={{color:'#666'}}>No applicants yet.</div>}
                        {(t.applicants||[]).map((app, idx)=>(
                          <div key={idx} style={{border:'1px solid #eee', padding:8, borderRadius:6, marginBottom:8}}>
                            <div style={{fontWeight:700}}>{app.name} <small style={{color:'#666', fontWeight:400}}>({app.status})</small></div>
                            <div style={{fontSize:13, color:'#444'}}>{app.message}</div>
                            <div style={{marginTop:8, display:'flex', gap:8}}>
                              {app.status === 'Pending' && <>
                                <button onClick={()=>changeApplicantStatus(t.id, app, 'Accepted')} style={{padding:'6px 10px', background:'#28a745', color:'#fff', border:'none', borderRadius:6}}>Accept</button>
                                <button onClick={()=>changeApplicantStatus(t.id, app, 'Rejected')} style={{padding:'6px 10px', background:'#dc3545', color:'#fff', border:'none', borderRadius:6}}>Reject</button>
                              </>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default TaskMarketplace;
