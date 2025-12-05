import './App.css'
import SidebarNav from './components/SidebarNav'
import CreatePaymentRequest from './pages/CreatePaymentRequest'

export default function App() {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <SidebarNav />
      </div>
      <div className="flex-1 overflow-auto">
        <CreatePaymentRequest />
      </div>
    </div>
  )
}
