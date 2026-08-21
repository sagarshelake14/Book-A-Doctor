import React, { useState } from 'react'
import '../layout.css'
import {Link, useLocation} from "react-router-dom"
function Layout({children}) {

   const location = useLocation();
   const [collapsed, setCollapsed] = useState(false);

   const userMenu = [
         {
                  name: "Home",
                  path: "/",
                  icon: "ri-home-line",
         },
         {
                  name: "Appointments",
                  path: "/appointments",
                  icon: "ri-file-list-line",
         },
         {
                  name: "Apply Doctor",
                  path: "/apply-doctor",
                  icon: "ri-hospital-line",
         },
         {
                  name: "Profile",
                  path: "/profile",
                  icon: "ri-user-line",
         },
         {
                  name: "Logout",
                  path: "/logout",
                  icon: "ri-login-box-line",
         }
   ];

   const menuToBeRendered = userMenu;

  return (
    <div className='main'>

      <div className='d-flex layout'>
        <div className='sidebar'>
          <div className="sidebar-header">
                  <h4>BAC</h4>
          </div>
          <div className="menu">
                  {menuToBeRendered.map((menu) => {
                           const isActive = location.pathname === menu.path;
                           return <div className={`d-flex menu-item ${isActive && 'active-menu-item'}`}>
                           <i className={menu.icon}></i>
                           {!collapsed && <Link to={menu.path}>{menu.name}</Link>}
                           </div>
                  })}
         </div>
        </div>

        <div className='content'>
          <div className="header">
            {collapsed ? (
              <i className='ri-menu-2-fill header-action-icons' onClick={() => setCollapsed(false)} ></i>)
            :
            (
            <i className='ri-close-fill header-action-icons' onClick={() => setCollapsed(true)} ></i>)}
            
          </div>

          <div className="body">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Layout;