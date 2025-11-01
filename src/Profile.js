import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, avgRating: 0, totalEarned: 0 });

  // Demo user - in production, this would come from authentication
  const demoUser = {
    id: 'demo-user-123',
    name: 'Alex Johnson',
    email: 'alex.johnson@college.edu',
    department: 'Computer Science',
    year: '3rd Year',
    skills: ['Web Development', 'Python', 'UI/UX Design', 'Data Analysis'],
    bio: 'Passionate about building innovative solutions and helping fellow students. Love to learn new technologies and share knowledge.',
    joinedDate: 'September 2024',
    avatar: '👨‍💻'
  };

  useEffect(() => {
    setProfileData(demoUser);
    loadUserActivity();
  }, []);

  const loadUserActivity = async () => {
    try {
      // Load completed tasks where user was accepted
      const tasksRef = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      const completed = [];
      let totalEarnings = 0;
      
      for (const doc of tasksSnapshot.docs) {
        const task = doc.data();
        const acceptedApplicant = task.applicants?.find(app => 
          app.status === 'accepted' && app.name === demoUser.name
        );
        
        if (acceptedApplicant) {
          // Check if task has ratings
          const ratingsRef = collection(db, `tasks/${doc.id}/ratings`);
          const ratingsSnap = await getDocs(ratingsRef);
          
          const taskRatings = [];
          ratingsSnap.forEach(rDoc => {
            taskRatings.push(rDoc.data());
          });
          
          completed.push({
            id: doc.id,
            title: task.title,
            points: task.points || 50,
            completedDate: task.createdAt,
            ratings: taskRatings
          });
          
          totalEarnings += task.points || 50;
        }
      }
      
      setCompletedTasks(completed);
      
      // Calculate ratings
      const allRatings = completed.flatMap(t => t.ratings);
      setReceivedRatings(allRatings);
      
      const avgRating = allRatings.length > 0 
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
        : 0;
      
      setStats({
        totalTasks: completed.length,
        avgRating: avgRating,
        totalEarned: totalEarnings
      });
      
    } catch (err) {
      console.error('Error loading activity:', err);
    }
  };

  if (!profileData) {
    return <div style={{padding:20}}>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      {/* Header Card */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">{profileData.avatar}</div>
          <div className="profile-info" style={{flex:1}}>
            <h1>{profileData.name}</h1>
            <p style={{margin:'4px 0', opacity:0.9, fontSize:14}}>{profileData.department} • {profileData.year}</p>
            <p style={{margin:'4px 0', opacity:0.9, fontSize:14}}>📧 {profileData.email}</p>
            <p style={{margin:'8px 0 0 0', fontSize:13, opacity:0.8}}>Member since {profileData.joinedDate}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', textAlign:'center'}}>
          <div style={{fontSize:30, fontWeight:'bold', color:'#667eea'}}>{stats.totalTasks}</div>
          <div style={{color:'#666', marginTop:5, fontSize:14}}>Tasks Completed</div>
        </div>
        <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', textAlign:'center'}}>
          <div style={{fontSize:30, fontWeight:'bold', color:'#f59e0b'}}>⭐ {stats.avgRating}</div>
          <div style={{color:'#666', marginTop:5, fontSize:14}}>Average Rating</div>
        </div>
        <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', textAlign:'center'}}>
          <div style={{fontSize:30, fontWeight:'bold', color:'#10b981'}}>{stats.totalEarned}</div>
          <div style={{color:'#666', marginTop:5, fontSize:14}}>Credit Points Earned</div>
        </div>
      </div>

      {/* Bio Section */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:20}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333'}}>About Me</h2>
        <p style={{color:'#666', lineHeight:1.6, fontSize:14}}>{profileData.bio}</p>
      </div>

      {/* Skills Section */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:20}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333'}}>Skills</h2>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {profileData.skills.map((skill, idx) => (
            <span key={idx} style={{
              background:'#667eea', 
              color:'#fff', 
              padding:'6px 14px', 
              borderRadius:20, 
              fontSize:13,
              fontWeight:500
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Completed Tasks Section */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:20}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333'}}>Completed Tasks ({completedTasks.length})</h2>
        {completedTasks.length === 0 ? (
          <p style={{color:'#999'}}>No completed tasks yet. Start helping others to build your profile!</p>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {completedTasks.map(task => (
              <div key={task.id} style={{
                padding:15, 
                border:'1px solid #e5e7eb', 
                borderRadius:8,
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center'
              }}>
                <div>
                  <div style={{fontWeight:600, color:'#333', marginBottom:4}}>{task.title}</div>
                  {task.ratings.length > 0 && (
                    <div style={{fontSize:14, color:'#666'}}>
                      ⭐ {(task.ratings.reduce((sum, r) => sum + r.rating, 0) / task.ratings.length).toFixed(1)} 
                      {task.ratings[0].comment && ` • "${task.ratings[0].comment}"`}
                    </div>
                  )}
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#10b981', fontWeight:'bold'}}>+{task.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews Section */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001'}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333'}}>Recent Reviews</h2>
        {receivedRatings.length === 0 ? (
          <p style={{color:'#999'}}>No reviews yet.</p>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {receivedRatings.slice(0, 5).map((rating, idx) => (
              <div key={idx} style={{
                padding:15, 
                border:'1px solid #e5e7eb', 
                borderRadius:8
              }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <div style={{color:'#f59e0b', fontWeight:600}}>
                    {'⭐'.repeat(rating.rating)}
                  </div>
                  <div style={{fontSize:13, color:'#999'}}>
                    {rating.timestamp?.toDate().toLocaleDateString()}
                  </div>
                </div>
                {rating.comment && (
                  <div style={{color:'#666', fontSize:14, fontStyle:'italic'}}>
                    "{rating.comment}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
