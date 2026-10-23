import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { CarDetail } from './pages/car'
import { Dashboard } from './pages/dashboard'
import { Edit } from './pages/dashboard/edit'
import { New } from './pages/dashboard/new'
import { Home } from './pages/home'
import { Login } from './pages/login'
import { NotFound } from './pages/notfound'
import { Register } from './pages/register'
import { Vendor } from './pages/vendor'
import { Private } from './routes/Private'

export function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/vendedor/:id" element={<Vendor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Private>
              <Dashboard />
            </Private>
          }
        />
        <Route
          path="/dashboard/new"
          element={
            <Private>
              <New />
            </Private>
          }
        />
        <Route
          path="/dashboard/edit/:id"
          element={
            <Private>
              <Edit />
            </Private>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
