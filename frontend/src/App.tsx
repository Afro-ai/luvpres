import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { CreatePage } from './pages/Create';
import { PresenterPage } from './pages/Presenter';
import { ViewerPage } from './pages/Viewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/present/:sessionId" element={<PresenterPage />} />
        <Route path="/view/:sessionId" element={<ViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
