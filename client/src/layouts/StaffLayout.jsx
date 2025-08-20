import { Outlet } from 'react-router-dom'
import SidebarStaff from '../components/sidebar/SidebarStaff'

const OwnerLayout = () => {
  return (
    <div className="flex">
      <SidebarStaff />
      <div className="flex-1 bg-gray-100 min-h-screen">
        <Outlet /> {/* ตรงนี้จะเปลี่ยนไปตาม route */}
      </div>
    </div>
  )
}

export default OwnerLayout
