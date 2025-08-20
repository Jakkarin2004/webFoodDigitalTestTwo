import { Outlet } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'

const OwnerLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 min-h-screen">
        <Outlet /> {/* ตรงนี้จะเปลี่ยนไปตาม route */}
      </div>
    </div>
  )
}

export default OwnerLayout
