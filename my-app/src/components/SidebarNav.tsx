import { useState } from 'react'
import { MdMenu, MdInsertChart, MdPublic, MdColorLens, MdDiamond, MdShoppingCart, MdCalendarToday, MdExpandMore, MdArticle, MdFavorite } from 'react-icons/md'
import type { IconType } from 'react-icons'

type Item = { label: string; icon: IconType; children?: Array<{ label: string }> }

const general: Item[] = [
  { label: 'Charts', icon: MdInsertChart, children: [{ label: 'Pie charts' }, { label: 'Line charts' }] },
  { label: 'Maps', icon: MdPublic },
  { label: 'Theme', icon: MdColorLens },
  { label: 'Components', icon: MdDiamond },
  { label: 'E-commerce', icon: MdShoppingCart },
]

const extra: Item[] = [
  { label: 'Calendar', icon: MdCalendarToday },
  { label: 'Documentation', icon: MdArticle },
  { label: 'Examples', icon: MdFavorite },
]

export default function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({ Charts: true })

  const toggleOpen = (key: string) => setOpen((s) => ({ ...s, [key]: !s[key] }))

  return (
    <aside className={`${collapsed ? 'w-15' : 'w-84'} h-full bg-white shadow-xl  flex flex-col transition-all duration-200`}
      aria-label="Sidebar navigation">
      <div className="px-3 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white grid place-items-center font-bold">P</div>
          {!collapsed && <div className="font-semibold text-blue-600">Pro Sidebar</div>}
        </div>
        <button aria-label="Toggle sidebar" onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded hover:bg-blue-50 text-blue-600">
          <MdMenu size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && <div className="text-xs uppercase text-gray-400 px-2 mb-2">General</div>}
        {general.map((item) => (
          <div key={item.label}>
            <button className="w-full flex items-center gap-2 justify-between px-2 py-2 rounded-lg hover:bg-blue-50"
              onClick={() => item.children ? toggleOpen(item.label) : null}
              aria-expanded={!!open[item.label]}
            >
              <span className="flex items-center gap-2">
                <item.icon className="text-blue-600" size={20} />
                {!collapsed && <span>{item.label}</span>}
              </span>
              {item.children && !collapsed && (
                <MdExpandMore className={`${open[item.label] ? 'rotate-180' : ''} text-gray-400 transition-transform`} />
              )}
            </button>
            {item.children && open[item.label] && !collapsed && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((c) => (
                  <button key={c.label} className="w-full text-left px-2 py-1 rounded hover:bg-blue-50 text-sm text-gray-700">
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {!collapsed && <div className="text-xs uppercase text-gray-400 px-2 mt-6 mb-2">Extra</div>}
        {extra.map((item) => (
          <button key={item.label} className="w-full flex items-center gap-2 justify-between px-2 py-2 rounded-lg hover:bg-blue-50">
            <span className="flex items-center gap-2">
              <item.icon className="text-blue-600" size={20} />
              {!collapsed && <span>{item.label}</span>}
            </span>
            {item.label === 'Calendar' && !collapsed && (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5">New</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3">
        <div className={`${collapsed ? 'p-2' : 'p-4'} rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white text-center`}>
          {!collapsed && <div className="font-semibold">Pro Sidebar</div>}
          {!collapsed && <div className="text-xs opacity-80">v1.0.0</div>}
          {!collapsed && (
            <button className="mt-3 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded">View code</button>
          )}
        </div>
      </div>
    </aside>
  )
}
