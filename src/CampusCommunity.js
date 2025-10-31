// src/CampusCommunity.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const CampusCommunity = () => {
  const [resources, setResources] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('notes');
  const [resourceUrl, setResourceUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  // Real-time listener for resources
  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setResources(arr);
    });
    return () => unsub();
  }, []);

  const shareResource = async (e) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);

      if (!title) {
        alert('Please enter a title');
        setIsUploading(false);
        return;
      }

      let finalUrl = resourceUrl;
      
      // Handle PDF upload
      if (resourceType === 'pdf') {
        if (!pdfFile) {
          alert('Please select a PDF file');
          setIsUploading(false);
          return;
        }
        
        console.log('Starting PDF upload...'); // Debug log
        
        try {
          // Create a unique filename
          const timestamp = Date.now();
          const uniqueFilename = `${timestamp}_${pdfFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, `resources/${uniqueFilename}`);
          
          console.log('Uploading to path:', `resources/${uniqueFilename}`); // Debug log
          
          // Upload the file
          const snapshot = await uploadBytes(storageRef, pdfFile);
          console.log('File uploaded successfully'); // Debug log
          
          // Get the download URL
          finalUrl = await getDownloadURL(snapshot.ref);
          console.log('Got download URL:', finalUrl); // Debug log
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload PDF: ' + uploadError.message);
          setIsUploading(false);
          return;
        }
      } else if (!resourceUrl) {
        alert('Please enter a resource URL');
        setIsUploading(false);
        return;
      }

      // Add to Firestore
      await addDoc(collection(db, 'resources'), {
        title,
        description,
        resourceType,
        resourceUrl: finalUrl,
        fileName: resourceType === 'pdf' ? pdfFile?.name : undefined,
        sharedBy: 'You (demo)',
        downloads: 0,
        college: 'Chandigarh University',
        createdAt: serverTimestamp()
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setResourceUrl('');
      setPdfFile(null);
      setIsSharing(false);
      
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Failed to share. Error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadResource = async (resource) => {
    try {
      // Update download count
      const resourceRef = doc(db, 'resources', resource.id);
      await updateDoc(resourceRef, {
        downloads: increment(1)
      });
      
      // Open resource URL in new tab
      window.open(resource.resourceUrl, '_blank');
    } catch (err) {
      console.error('Error downloading:', err);
      alert('Failed to track download. Try again.');
    }
  };

  const deleteResource = async (resourceId) => {
    if(!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (resource && resource.resourceType === 'pdf') {
        // Delete the file from storage if it's a PDF
        const storageRef = ref(storage, resource.resourceUrl);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'resources', resourceId));
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete. Try again.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type === 'application/pdf') {
      setPdfFile(file);
      console.log('PDF file selected:', file.name); // Debug log
    } else {
      alert('Please select a PDF file');
      setPdfFile(null);
      e.target.value = null;
    }
  };

  return (
    <div className="page-container">
      <Link to="/" className="back-link">← Back</Link>
      <h1>Campus Community 🎓</h1>
      <p style={{color:'#555'}}>Share and download study resources with your college community. Earn credits for sharing!</p>

      <button className="fab" title="Share Resource" onClick={() => setIsSharing(true)}>+</button>

      {isSharing && (
        <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)'}}>
          <form onSubmit={shareResource} style={{background:'#fff', padding:20, borderRadius:8, width:360}}>
            <h3>Share Resource</h3>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Title (e.g., Data Structures Notes)" 
              style={{width:'100%', padding:8, margin:'8px 0'}} 
              required
            />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Brief description..." 
              style={{width:'100%', padding:8, margin:'8px 0', minHeight:80}} 
            />
            <select 
              value={resourceType} 
              onChange={(e) => {
                setResourceType(e.target.value);
                // Clear URL/file when switching types
                setResourceUrl('');
                setPdfFile(null);
              }} 
              style={{width:'100%', padding:8, margin:'8px 0'}}
            >
              <option value="notes">Class Notes</option>
              <option value="paper">Research Paper</option>
              <option value="pdf">PDF Book/Guide</option>
            </select>
            
            {resourceType === 'pdf' ? (
              <div style={{margin:'8px 0'}}>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  required
                  style={{width:'100%'}}
                />
                {pdfFile && (
                  <div style={{fontSize:12, color:'#666', marginTop:4}}>
                    Selected: {pdfFile.name}
                  </div>
                )}
              </div>
            ) : (
              <input 
                value={resourceUrl} 
                onChange={(e) => setResourceUrl(e.target.value)} 
                placeholder="Resource URL (Google Drive, Dropbox, etc.)" 
                style={{width:'100%', padding:8, margin:'8px 0'}} 
                required
              />
            )}
            
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button 
                type="submit" 
                disabled={isUploading}
                style={{
                  flex:1, 
                  padding:10, 
                  background: isUploading ? '#999' : '#28a745', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:6,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                {isUploading ? 'Uploading...' : 'Share'} 
                {resourceType === 'pdf' && pdfFile && !isUploading && (
                  <span style={{fontSize: 12, display: 'block'}}>{pdfFile.name}</span>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsSharing(false);
                  setPdfFile(null);
                  setResourceUrl('');
                }}
                disabled={isUploading}
                style={{
                  flex:1, 
                  padding:10, 
                  background: isUploading ? '#999' : '#dc3545', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:6,
                  cursor: isUploading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{marginTop:16}}>
        {resources.length === 0 ? <p>No resources shared yet. Be the first!</p> :
          resources.map(r => (
            <div key={r.id} className="resource-card" style={{
              border:'1px solid #ddd',
              borderRadius:8,
              padding:16,
              marginBottom:16,
              background:'#fff'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <h4 style={{margin:'0 0 6px 0'}}>{r.title}</h4>
                  <div style={{fontSize:13, color:'#666'}}>
                    <span style={{color:'#007bff'}}>{r.resourceType}</span> • Shared by {r.sharedBy}
                  </div>
                  {r.fileName && (
                    <div style={{fontSize:12, color:'#666', marginTop:4}}>
                      File: {r.fileName}
                    </div>
                  )}
                  {r.description && (
                    <p style={{margin:'8px 0', fontSize:14, color:'#444'}}>{r.description}</p>
                  )}
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12, color:'#28a745', marginBottom:4}}>
                    {r.downloads} downloads
                  </div>
                  <div style={{fontSize:12, color:'#666'}}>{r.college}</div>
                </div>
              </div>

              <div style={{marginTop:12, display:'flex', gap:8}}>
                <button 
                  onClick={() => downloadResource(r)} 
                  style={{
                    padding:'8px 12px', 
                    background:'#007bff', 
                    color:'#fff', 
                    border:'none', 
                    borderRadius:6,
                    display:'flex',
                    alignItems:'center',
                    gap:6
                  }}
                >
                  <span style={{fontSize:16}}>⬇️</span> Download
                </button>
                
                {/* Delete button (only shown for demo) */}
                <button 
                  onClick={() => deleteResource(r.id)}
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
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default CampusCommunity;