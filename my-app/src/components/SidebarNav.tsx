import { useState } from 'react'
import { MdMenu, MdInsertChart, MdPublic, MdColorLens, MdDiamond, MdShoppingCart, MdExpandMore, MdChevronRight } from 'react-icons/md'
import type { IconType } from 'react-icons'

type Item = { label: string; icon: IconType; children?: Array<{ label: string }> }

const general: Item[] = [
  { label: 'Charts', icon: MdInsertChart, children: [{ label: 'Pie charts' }, { label: 'Line charts' }] },
  { label: 'Maps', icon: MdPublic },
  { label: 'Theme', icon: MdColorLens },
  { label: 'Components', icon: MdDiamond },
  { label: 'E-commerce', icon: MdShoppingCart },
]



export default function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({ Charts: true })
  const [activeItem, setActiveItem] = useState('Charts')

  const toggleOpen = (key: string) => setOpen((s) => ({ ...s, [key]: !s[key] }))

  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-72'} h-full bg-white shadow-xl flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200`}
      aria-label="Sidebar navigation"
    >
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
        
            <div className={`font-bold text-gray-800 transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Pro Sidebar
            </div>
          </div>
          <button 
            aria-label="Toggle sidebar" 
            onClick={() => setCollapsed((c) => !c)}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 active:scale-95"
          >
            <MdMenu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* General Section */}
          <div className={`text-xs font-semibold text-gray-500 px-3 mb-3 transition-all duration-300 ${collapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
            GENERAL
          </div>
          
          {general.map((item) => (
            <div key={item.label}>
              <button 
                className={`w-full flex items-center gap-3 justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${activeItem === item.label 
                    ? 'bg-linear-to-r from-gray-400 to-gray-300 text-black shadow-lg' 
                    : 'hover:bg-gray-200 text-gray-700 hover:text-black'
                  }
                `}
                onClick={() => {
                  if (item.children) {
                    toggleOpen(item.label)
                  }
                  setActiveItem(item.label)
                }}
                aria-expanded={!!open[item.label]}
              >
                <span className="flex items-center gap-3 relative z-10">
                  <span className={`transition-all duration-200 ${activeItem === item.label ? 'text-black' : 'text-gray-600 group-hover:scale-110 group-hover:text-black'}`}>
                    <item.icon size={20} />
                  </span>
                  <span className={`font-medium transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </span>
                {item.children && !collapsed && (
                  <span className={`${open[item.label] ? 'rotate-180' : ''} transition-transform duration-300 ${activeItem === item.label ? 'text-white' : 'text-gray-400'}`}>
                    <MdExpandMore 
                      size={18}
                    />
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </button>
              
              {/* Submenu */}
              {item.children && open[item.label] && !collapsed && (
                <div className="ml-11 mt-1 space-y-1 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {item.children.map((c) => (
                    <button 
                      key={c.label} 
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-600 text-sm text-gray-600 hover:text-white transition-all duration-200 flex items-center gap-2 group"
                    >
                      <span className="text-gray-400 group-hover:text-white transition-colors">
                        <MdChevronRight size={16} />
                      </span>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

       
        </nav>

        {/* Footer */}
        <div className={`px-5 py-4 border-t border-gray-200 bg-gray-50 transition-all duration-300 ${collapsed ? 'opacity-0 h-0 py-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-semibold shadow-md">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-gray-800">John Doe</div>
              <div className="text-xs text-gray-500">john@example.com</div>
            </div>
          </div>
        </div>
      </aside>
  )
}