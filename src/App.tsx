import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import PasswordGate from './components/auth/PasswordGate'
import HomePage from './pages/HomePage'
import ExamPage from './pages/ExamPage'
import PracticePage from './pages/PracticePage'
import PracticalPage from './pages/PracticalPage'
import RandomPage from './pages/RandomPage'
import WrongBookPage from './pages/WrongBookPage'
import FavoritesPage from './pages/FavoritesPage'
import StatsPage from './pages/StatsPage'
import DataManagePage from './pages/DataManagePage'

function App() {
  return (
    <PasswordGate>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="practical" element={<PracticalPage />} />
            <Route path="random" element={<RandomPage />} />
            <Route path="wrong" element={<WrongBookPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="data" element={<DataManagePage />} />
          </Route>
        </Routes>
      </HashRouter>
    </PasswordGate>
  )
}

export default App
