import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function TeachSkill() {
  const [teachings, setTeachings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [resources, setResources] = useState([]);
  
  // Time slot form
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [slotDuration, setSlotDuration] = useState('60');
  
  // Resource form
  const [resourceType, setResourceType] = useState('link'); // 'link' or 'pdf'
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  
  const availableTags = [
    'Coding', 'Web Development', 'Mobile Development', 'UI/UX Design',
    'Data Science', 'Machine Learning', 'Marketing', 'Content Writing',
    'Video Editing', 'Graphic Design', 'Photography', 'Business',
    'Language Learning', 'Music', 'Art', 'Public Speaking'
  ];

  useEffect(() => {
    const q = query(collection(db, 'teachings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teachingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeachings(teachingsList);
    });
    return () => unsubscribe();
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addTimeSlot = () => {
    if (slotDate && slotTime) {
      const newSlot = {
        date: slotDate,
        time: slotTime,
        duration: slotDuration + ' min',
        available: true,
        bookedBy: null
      };
      setTimeSlots([...timeSlots, newSlot]);
      setSlotDate('');
      setSlotTime('');
      setSlotDuration('60');
    }
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const addResource = async () => {
    if (resourceType === 'link' && resourceTitle && resourceLink) {
      setResources([...resources, {
        type: 'link',
        title: resourceTitle,
        url: resourceLink
      }]);
      setResourceTitle('');
      setResourceLink('');
    } else if (resourceType === 'pdf' && resourceTitle && resourceFile) {
      // Upload PDF to Firebase Storage
      try {
        const storageRef = ref(storage, `teaching-resources/${Date.now()}_${resourceFile.name}`);
        await uploadBytes(storageRef, resourceFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        setResources([...resources, {
          type: 'pdf',
          title: resourceTitle,
          url: downloadURL,
          filename: resourceFile.name
        }]);
        setResourceTitle('');
        setResourceFile(null);
      } catch (err) {
        alert('Error uploading PDF: ' + err.message);
      }
    }
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!skillName || !description || selectedTags.length === 0 || timeSlots.length === 0) {
      alert('Please fill in all required fields and add at least one time slot');
      return;
    }

    try {
      await addDoc(collection(db, 'teachings'), {
        skillName,
        description,
        tags: selectedTags,
        timeSlots,
        resources,
        teacherName: 'Alex Johnson', // Demo user
        teacherAvatar: '👨‍💻',
        createdAt: new Date(),
        totalBooked: 0,
        rating: 0
      });

      // Reset form
      setSkillName('');
      setDescription('');
      setSelectedTags([]);
      setTimeSlots([]);
      setResources([]);
      setShowForm(false);
      alert('Teaching session created successfully! 🎉');
    } catch (err) {
      alert('Error creating teaching: ' + err.message);
    }
  };

  const deleteTeaching = async (id) => {
    if (window.confirm('Are you sure you want to delete this teaching?')) {
      try {
        await deleteDoc(doc(db, 'teachings', id));
      } catch (err) {
        alert('Error deleting: ' + err.message);
      }
    }
  };

  const bookSlot = async (teachingId, slotIndex) => {
    // Demo booking functionality
    alert(`Booking slot for Google Meet! Meeting link will be sent to your email. 📧`);
    // In production, update the slot's bookedBy field and send meeting invite
  };

  return (
    <div className="teach-container">
      {/* Header */}
      <div className="teach-header">
        <div className="teach-header-title">
          <h1>🧑‍🏫 Teach a Skill</h1>
          <p style={{color:'#666', margin:0, fontSize:14}}>Share your knowledge and help others learn</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{background: showForm ? '#ef4444' : '#667eea', color:'#fff'}}
        >
          {showForm ? '✕ Cancel' : '+ Create Teaching Session'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{background:'#fff', padding:30, borderRadius:12, boxShadow:'0 2px 15px #0001', marginBottom:25}}>
          <h2 style={{marginTop:0, fontSize:22, color:'#333'}}>Create New Teaching Session</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Skill Name */}
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontWeight:600, marginBottom:8, color:'#333'}}>
                Skill Name *
              </label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., React.js Fundamentals"
                style={{
                  width:'100%',
                  padding:12,
                  border:'1px solid #ddd',
                  borderRadius:8,
                  fontSize:15,
                  boxSizing:'border-box'
                }}
              />
            </div>

            {/* Description */}
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontWeight:600, marginBottom:8, color:'#333'}}>
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you'll teach and what students will learn..."
                rows={4}
                style={{
                  width:'100%',
                  padding:12,
                  border:'1px solid #ddd',
                  borderRadius:8,
                  fontSize:15,
                  boxSizing:'border-box',
                  fontFamily:'inherit'
                }}
              />
            </div>

            {/* Tags */}
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontWeight:600, marginBottom:8, color:'#333'}}>
                Select Tags * (Choose relevant categories)
              </label>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding:'8px 16px',
                      border: selectedTags.includes(tag) ? '2px solid #667eea' : '1px solid #ddd',
                      background: selectedTags.includes(tag) ? '#667eea' : '#fff',
                      color: selectedTags.includes(tag) ? '#fff' : '#333',
                      borderRadius:20,
                      fontSize:14,
                      cursor:'pointer',
                      fontWeight: selectedTags.includes(tag) ? 600 : 400
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontWeight:600, marginBottom:8, color:'#333'}}>
                Available Time Slots * (for Google Meet sessions)
              </label>
              
              <div className="time-slot-grid">
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{padding:10, border:'1px solid #ddd', borderRadius:8, fontSize:14, boxSizing:'border-box'}}
                />
                <input
                  type="time"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  style={{padding:10, border:'1px solid #ddd', borderRadius:8, fontSize:14, boxSizing:'border-box'}}
                />
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  style={{padding:10, border:'1px solid #ddd', borderRadius:8, fontSize:14, boxSizing:'border-box'}}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  style={{
                    padding:'10px 20px',
                    background:'#10b981',
                    color:'#fff',
                    border:'none',
                    borderRadius:8,
                    cursor:'pointer',
                    fontWeight:600,
                    whiteSpace:'nowrap'
                  }}
                >
                  + Add
                </button>
              </div>

              {/* Display added slots */}
              {timeSlots.length > 0 && (
                <div style={{marginTop:15}}>
                  <div style={{fontWeight:600, marginBottom:8, fontSize:14, color:'#666'}}>
                    Added Time Slots ({timeSlots.length}):
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {timeSlots.map((slot, idx) => (
                      <div key={idx} style={{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        padding:12,
                        background:'#f0fdf4',
                        border:'1px solid #86efac',
                        borderRadius:8
                      }}>
                        <span style={{fontSize:14, color:'#333'}}>
                          📅 {slot.date} at {slot.time} ({slot.duration})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(idx)}
                          style={{
                            background:'#ef4444',
                            color:'#fff',
                            border:'none',
                            padding:'6px 12px',
                            borderRadius:6,
                            cursor:'pointer',
                            fontSize:13
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources */}
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontWeight:600, marginBottom:8, color:'#333'}}>
                Upload Resources (Optional - PDFs or Links)
              </label>
              
              <div style={{marginBottom:10}}>
                <div className="resource-actions">
                  <button
                    type="button"
                    onClick={() => setResourceType('link')}
                    style={{
                      padding:'8px 16px',
                      background: resourceType === 'link' ? '#667eea' : '#f3f4f6',
                      color: resourceType === 'link' ? '#fff' : '#333',
                      border:'none',
                      borderRadius:6,
                      cursor:'pointer',
                      fontWeight:600,
                      flex: 1
                    }}
                  >
                    🔗 Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType('pdf')}
                    style={{
                      padding:'8px 16px',
                      background: resourceType === 'pdf' ? '#667eea' : '#f3f4f6',
                      color: resourceType === 'pdf' ? '#fff' : '#333',
                      border:'none',
                      borderRadius:6,
                      cursor:'pointer',
                      fontWeight:600,
                      flex: 1
                    }}
                  >
                    📄 PDF
                  </button>
                </div>

                <input
                  type="text"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="Resource title"
                  style={{
                    width:'100%',
                    padding:10,
                    border:'1px solid #ddd',
                    borderRadius:8,
                    fontSize:14,
                    marginBottom:10,
                    boxSizing:'border-box'
                  }}
                />

                {resourceType === 'link' ? (
                  <input
                    type="url"
                    value={resourceLink}
                    onChange={(e) => setResourceLink(e.target.value)}
                    placeholder="https://example.com/resource"
                    style={{
                      width:'100%',
                      padding:10,
                      border:'1px solid #ddd',
                      borderRadius:8,
                      fontSize:14,
                      marginBottom:10,
                      boxSizing:'border-box'
                    }}
                  />
                ) : (
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResourceFile(e.target.files[0])}
                    style={{
                      width:'100%',
                      padding:10,
                      border:'1px solid #ddd',
                      borderRadius:8,
                      fontSize:14,
                      marginBottom:10,
                      boxSizing:'border-box'
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={addResource}
                  style={{
                    padding:'10px 20px',
                    background:'#10b981',
                    color:'#fff',
                    border:'none',
                    borderRadius:8,
                    cursor:'pointer',
                    fontWeight:600
                  }}
                >
                  + Add Resource
                </button>
              </div>

              {/* Display added resources */}
              {resources.length > 0 && (
                <div style={{marginTop:15}}>
                  <div style={{fontWeight:600, marginBottom:8, fontSize:14, color:'#666'}}>
                    Added Resources ({resources.length}):
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {resources.map((resource, idx) => (
                      <div key={idx} style={{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        padding:12,
                        background:'#eff6ff',
                        border:'1px solid #93c5fd',
                        borderRadius:8
                      }}>
                        <span style={{fontSize:14, color:'#333'}}>
                          {resource.type === 'pdf' ? '📄' : '🔗'} {resource.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeResource(idx)}
                          style={{
                            background:'#ef4444',
                            color:'#fff',
                            border:'none',
                            padding:'6px 12px',
                            borderRadius:6,
                            cursor:'pointer',
                            fontSize:13
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width:'100%',
                padding:15,
                background:'#667eea',
                color:'#fff',
                border:'none',
                borderRadius:8,
                fontSize:16,
                fontWeight:600,
                cursor:'pointer'
              }}
            >
              Create Teaching Session 🎓
            </button>
          </form>
        </div>
      )}

      {/* List of Teachings */}
      <div>
        <h2 style={{fontSize:22, marginBottom:15, color:'#333'}}>Available Teaching Sessions</h2>
        
        {teachings.length === 0 ? (
          <div style={{
            background:'#fff',
            padding:40,
            borderRadius:12,
            textAlign:'center',
            color:'#999'
          }}>
            <div style={{fontSize:60, marginBottom:15}}>📚</div>
            <p>No teaching sessions yet. Be the first to share your knowledge!</p>
          </div>
        ) : (
          <div className="teaching-grid">
            {teachings.map(teaching => (
              <div key={teaching.id} style={{
                background:'#fff',
                borderRadius:12,
                boxShadow:'0 2px 12px #0001',
                overflow:'hidden',
                border:'1px solid #e5e7eb'
              }}>
                {/* Header */}
                <div style={{
                  background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding:20,
                  color:'#fff'
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                    <div style={{fontSize:32}}>{teaching.teacherAvatar}</div>
                    <div>
                      <div style={{fontWeight:600, fontSize:14, opacity:0.9}}>{teaching.teacherName}</div>
                      <div style={{fontSize:12, opacity:0.8}}>Teacher</div>
                    </div>
                  </div>
                  <h3 style={{margin:'10px 0 0 0', fontSize:20}}>{teaching.skillName}</h3>
                </div>

                {/* Body */}
                <div style={{padding:20}}>
                  <p style={{color:'#666', fontSize:14, lineHeight:1.6, marginBottom:15}}>
                    {teaching.description}
                  </p>

                  {/* Tags */}
                  <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:15}}>
                    {teaching.tags.map((tag, idx) => (
                      <span key={idx} style={{
                        background:'#eff6ff',
                        color:'#2563eb',
                        padding:'4px 10px',
                        borderRadius:12,
                        fontSize:12,
                        fontWeight:500
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div style={{marginBottom:15}}>
                    <div style={{fontWeight:600, fontSize:14, marginBottom:8, color:'#333'}}>
                      Available Slots:
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:6}}>
                      {teaching.timeSlots.slice(0, 3).map((slot, idx) => (
                        <div key={idx} style={{
                          display:'flex',
                          justifyContent:'space-between',
                          alignItems:'center',
                          padding:8,
                          background:'#f9fafb',
                          borderRadius:6,
                          fontSize:13
                        }}>
                          <span>📅 {slot.date} • {slot.time}</span>
                          <button
                            onClick={() => bookSlot(teaching.id, idx)}
                            style={{
                              background:'#10b981',
                              color:'#fff',
                              border:'none',
                              padding:'4px 10px',
                              borderRadius:4,
                              fontSize:12,
                              cursor:'pointer',
                              fontWeight:600
                            }}
                          >
                            Book
                          </button>
                        </div>
                      ))}
                      {teaching.timeSlots.length > 3 && (
                        <div style={{fontSize:12, color:'#666', textAlign:'center'}}>
                          +{teaching.timeSlots.length - 3} more slots
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resources */}
                  {teaching.resources && teaching.resources.length > 0 && (
                    <div style={{marginBottom:15}}>
                      <div style={{fontWeight:600, fontSize:14, marginBottom:8, color:'#333'}}>
                        Resources:
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:6}}>
                        {teaching.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display:'flex',
                              alignItems:'center',
                              gap:8,
                              padding:8,
                              background:'#f9fafb',
                              borderRadius:6,
                              fontSize:13,
                              color:'#2563eb',
                              textDecoration:'none',
                              border:'1px solid #e5e7eb'
                            }}
                          >
                            <span>{resource.type === 'pdf' ? '📄' : '🔗'}</span>
                            <span style={{flex:1}}>{resource.title}</span>
                            <span style={{fontSize:11, color:'#666'}}>→</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{
                    display:'flex',
                    justifyContent:'space-between',
                    padding:'10px 0',
                    borderTop:'1px solid #e5e7eb',
                    marginTop:10,
                    fontSize:13,
                    color:'#666'
                  }}>
                    <span>👥 {teaching.totalBooked} students</span>
                    <span>⭐ {teaching.rating > 0 ? teaching.rating.toFixed(1) : 'New'}</span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTeaching(teaching.id)}
                    style={{
                      width:'100%',
                      padding:10,
                      background:'#fee2e2',
                      color:'#dc2626',
                      border:'none',
                      borderRadius:8,
                      fontSize:14,
                      fontWeight:600,
                      cursor:'pointer',
                      marginTop:10
                    }}
                  >
                    Delete Teaching
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeachSkill;
