import './App.css'
import SidebarNav from './components/SidebarNav'
import CreatePaymentRequest from './pages/CreatePaymentRequest'

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 overflow-auto p-6">
        <CreatePaymentRequest />
      </div>
    </div>
  )
}
