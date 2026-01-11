import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavigation } from './components/TopNavigation';
import { FeedScreen } from './screens/FeedScreen';
import { DeliveryDetailScreen } from './screens/DeliveryDetailScreen';
import { MatchDetailScreen } from './screens/MatchDetailScreen';
import { theme } from './theme';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App" style={{ backgroundColor: theme.colors.background }}>
        <TopNavigation />
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedScreen />} />
          <Route path="/match/:id" element={<MatchDetailScreen />} />
          <Route path="/delivery/:id" element={<DeliveryDetailScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

