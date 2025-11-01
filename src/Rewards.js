import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function Rewards() {
  const [userPoints, setUserPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelPoints, setNextLevelPoints] = useState(100);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Demo user
  const demoUser = {
    id: 'demo-user-123',
    name: 'Alex Johnson',
    avatar: '👨‍💻'
  };

  useEffect(() => {
    calculateRewards();
    loadLeaderboard();
  }, []);

  const calculateRewards = async () => {
    try {
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      let totalPoints = 0;
      let tasksCompleted = 0;
      let totalRating = 0;
      let ratingCount = 0;
      let perfectRatings = 0;
      
      for (const doc of snapshot.docs) {
        const task = doc.data();
        const acceptedApplicant = task.applicants?.find(app => 
          app.status === 'accepted' && app.name === demoUser.name
        );
        
        if (acceptedApplicant) {
          tasksCompleted++;
          const taskPoints = task.points || 50;
          totalPoints += taskPoints;
          
          // Check ratings
          const ratingsRef = collection(db, `tasks/${doc.id}/ratings`);
          const ratingsSnap = await getDocs(ratingsRef);
          
          ratingsSnap.forEach(rDoc => {
            const rating = rDoc.data();
            totalRating += rating.rating;
            ratingCount++;
            
            if (rating.rating === 5) {
              perfectRatings++;
              totalPoints += 20; // Bonus for 5-star rating
            }
          });
        }
      }
      
      // Calculate bonus points based on average rating
      const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      if (avgRating >= 4.5) {
        totalPoints += 100; // High performer bonus
      }
      
      setUserPoints(totalPoints);
      
      // Calculate level (every 100 points = 1 level)
      const calculatedLevel = Math.floor(totalPoints / 100) + 1;
      setLevel(calculatedLevel);
      setNextLevelPoints((calculatedLevel * 100) - totalPoints);
      
      // Determine achievements
      const earnedAchievements = [];
      
      if (tasksCompleted >= 1) {
        earnedAchievements.push({
          icon: '🎯',
          title: 'First Step',
          description: 'Completed your first task',
          earned: true
        });
      }
      
      if (tasksCompleted >= 5) {
        earnedAchievements.push({
          icon: '🔥',
          title: 'Getting Hot',
          description: 'Completed 5 tasks',
          earned: true
        });
      }
      
      if (tasksCompleted >= 10) {
        earnedAchievements.push({
          icon: '💯',
          title: 'Perfect Ten',
          description: 'Completed 10 tasks',
          earned: true
        });
      }
      
      if (perfectRatings >= 3) {
        earnedAchievements.push({
          icon: '⭐',
          title: 'Star Performer',
          description: 'Received 3+ five-star ratings',
          earned: true
        });
      }
      
      if (avgRating >= 4.5 && ratingCount >= 3) {
        earnedAchievements.push({
          icon: '👑',
          title: 'Excellence Award',
          description: 'Maintained 4.5+ average rating',
          earned: true
        });
      }
      
      if (totalPoints >= 500) {
        earnedAchievements.push({
          icon: '💎',
          title: 'Point Master',
          description: 'Earned 500+ credit points',
          earned: true
        });
      }
      
      // Add locked achievements
      if (tasksCompleted < 20) {
        earnedAchievements.push({
          icon: '🏆',
          title: 'Task Champion',
          description: 'Complete 20 tasks',
          earned: false
        });
      }
      
      if (totalPoints < 1000) {
        earnedAchievements.push({
          icon: '🌟',
          title: 'Legend',
          description: 'Earn 1000 credit points',
          earned: false
        });
      }
      
      setAchievements(earnedAchievements);
      
    } catch (err) {
      console.error('Error calculating rewards:', err);
    }
  };

  const loadLeaderboard = async () => {
    // Demo leaderboard data - in production, this would aggregate real user data
    const demoLeaderboard = [
      { rank: 1, name: 'Sarah Chen', avatar: '👩‍💼', points: 850, tasks: 17, rating: 4.9 },
      { rank: 2, name: 'Alex Johnson', avatar: '👨‍💻', points: 720, tasks: 14, rating: 4.8 },
      { rank: 3, name: 'Mike Rodriguez', avatar: '👨‍🎓', points: 650, tasks: 13, rating: 4.7 },
      { rank: 4, name: 'Emily Taylor', avatar: '👩‍🔬', points: 580, tasks: 11, rating: 4.8 },
      { rank: 5, name: 'David Kim', avatar: '👨‍🏫', points: 520, tasks: 10, rating: 4.6 },
    ];
    
    setLeaderboard(demoLeaderboard);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getLevelBadge = (level) => {
    if (level >= 10) return '💎 Diamond';
    if (level >= 7) return '🏆 Platinum';
    if (level >= 5) return '⭐ Gold';
    if (level >= 3) return '🥈 Silver';
    return '🥉 Bronze';
  };

  return (
    <div className="rewards-container">
      {/* Header */}
      <h1 style={{fontSize:28, marginBottom:10, color:'#333'}}>🎁 Rewards & Achievements</h1>
      <p style={{color:'#666', marginBottom:25, fontSize:14}}>Earn credit points by completing tasks and helping fellow students!</p>

      {/* Points & Level Card */}
      <div className="rewards-header-card">
        <div className="rewards-header-content">
          <div>
            <div style={{fontSize:16, opacity:0.9, marginBottom:5}}>Your Credit Points</div>
            <div className="points-display">{userPoints}</div>
            <div style={{fontSize:13, opacity:0.85, marginTop:5}}>{nextLevelPoints} points to next level</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:50, marginBottom:5}}>🏅</div>
            <div style={{fontSize:20, fontWeight:'bold'}}>Level {level}</div>
            <div style={{fontSize:13, opacity:0.85, marginTop:3}}>{getLevelBadge(level)}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{marginTop:20, background:'rgba(255,255,255,0.2)', borderRadius:10, height:8, overflow:'hidden'}}>
          <div style={{
            background:'#fff',
            height:'100%',
            width:`${((userPoints % 100) / 100) * 100}%`,
            borderRadius:10,
            transition:'width 0.3s'
          }}></div>
        </div>
      </div>

      {/* How Points Work */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:25}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333', marginBottom:15}}>💡 How to Earn Points</h2>
        <div className="how-to-earn-grid">
          <div style={{padding:15, background:'#f0fdf4', borderRadius:8, border:'1px solid #86efac'}}>
            <div style={{fontSize:24, marginBottom:8}}>✅</div>
            <div style={{fontWeight:600, color:'#333', marginBottom:4}}>Complete Tasks</div>
            <div style={{fontSize:14, color:'#666'}}>+50-200 points per task</div>
          </div>
          <div style={{padding:15, background:'#fef3c7', borderRadius:8, border:'1px solid #fcd34d'}}>
            <div style={{fontSize:24, marginBottom:8}}>⭐</div>
            <div style={{fontWeight:600, color:'#333', marginBottom:4}}>5-Star Rating</div>
            <div style={{fontSize:14, color:'#666'}}>+20 bonus points</div>
          </div>
          <div style={{padding:15, background:'#e0e7ff', borderRadius:8, border:'1px solid #a5b4fc'}}>
            <div style={{fontSize:24, marginBottom:8}}>🎯</div>
            <div style={{fontWeight:600, color:'#333', marginBottom:4}}>High Performer</div>
            <div style={{fontSize:14, color:'#666'}}>+100 bonus (4.5+ avg)</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:25}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333', marginBottom:15}}>🏆 Achievements</h2>
        <div className="achievements-grid">
          {achievements.map((achievement, idx) => (
            <div key={idx} style={{
              padding:20,
              border:`2px solid ${achievement.earned ? '#10b981' : '#e5e7eb'}`,
              borderRadius:10,
              background: achievement.earned ? '#f0fdf4' : '#f9fafb',
              opacity: achievement.earned ? 1 : 0.6,
              position:'relative'
            }}>
              {achievement.earned && (
                <div style={{
                  position:'absolute',
                  top:10,
                  right:10,
                  background:'#10b981',
                  color:'#fff',
                  padding:'2px 8px',
                  borderRadius:10,
                  fontSize:11,
                  fontWeight:'bold'
                }}>UNLOCKED</div>
              )}
              <div style={{fontSize:40, marginBottom:10}}>{achievement.icon}</div>
              <div style={{fontWeight:600, color:'#333', marginBottom:4}}>{achievement.title}</div>
              <div style={{fontSize:14, color:'#666'}}>{achievement.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001'}}>
        <h2 style={{marginTop:0, fontSize:18, color:'#333', marginBottom:15}}>📊 Top Contributors</h2>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {leaderboard.map((user, idx) => (
            <div key={idx} className="leaderboard-item" style={{
              background: user.rank <= 3 ? '#fef3c7' : '#f9fafb',
              border: user.name === demoUser.name ? '2px solid #667eea' : '1px solid #e5e7eb'
            }}>
              <div className="leaderboard-rank">
                {getRankBadge(user.rank)}
              </div>
              <div className="leaderboard-avatar">{user.avatar}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, color:'#333', fontSize:14}}>
                  {user.name}
                  {user.name === demoUser.name && <span style={{marginLeft:8, color:'#667eea', fontSize:12}}>(You)</span>}
                </div>
                <div style={{fontSize:12, color:'#666', marginTop:2}}>
                  {user.tasks} tasks • ⭐ {user.rating} rating
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18, fontWeight:'bold', color:'#f59e0b'}}>{user.points}</div>
                <div style={{fontSize:11, color:'#666'}}>points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rewards;
