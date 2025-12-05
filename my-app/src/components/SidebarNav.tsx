import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'

export default function SidebarNav() {
  return (
    <div className="h-screen">
      <Sidebar>
        <Menu>
          <SubMenu label="Charts">
            <MenuItem>Pie charts</MenuItem>
            <MenuItem>Line charts</MenuItem>
          </SubMenu>
          <MenuItem>Documentation</MenuItem>
          <MenuItem>Calendar</MenuItem>
        </Menu>
      </Sidebar>
    </div>
  )
}
