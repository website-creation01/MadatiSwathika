import React from 'react';

function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <div style={{ width: '200px', background: '#eaeaea', height: '100vh', padding: '20px' }}>
      <h3>📘 Dashboard</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li
          style={{ padding: '10px', cursor: 'pointer', background: currentPage === 'courses' ? '#ccc' : 'transparent' }}
          onClick={() => setCurrentPage('courses')}
        >
          My Courses
        </li>
        <li
          style={{ padding: '10px', cursor: 'pointer', background: currentPage === 'results' ? '#ccc' : 'transparent' }}
          onClick={() => setCurrentPage('results')}
        >
          Results
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
