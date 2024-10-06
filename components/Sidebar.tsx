"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Home, Car, Settings, Menu, ChevronRight, Users, BarChart, Calendar } from "lucide-react"
// import { DropdownUser } from "@/components/Dropdown-User"

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Car },
  { name: "Reservations", href: "/reservations", icon: Calendar },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analyze", href: "/analyze", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet >

      <aside className={cn(
        "hidden md:flex flex-col border-r bg-white",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}>
        <div className="flex items-center justify-between p-4 h-14">
          {!isCollapsed && <h2 className="text-lg font-semibold">Car Rental</h2>}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            <ChevronRight className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
            <span className="sr-only">
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>

    </>
  )
}

function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 h-14">
        <h2 className="text-lg font-semibold">Car Rental</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          {sidebarItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="h-5 w-5 mr-2" />
                <span>{item.name}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}

// const sidebarNavItems = [
//   {
//     title: "Dashboard",
//     href: "/dashboard",
//   },
//   {
//     title: "Cars",
//     href: "/cars",
//   },
//   {
//     title: "Rentals",
//     href: "/rentals",
//   },
//   {
//     title: "Settings",
//     href: "/settings",
//   },
// ]

// interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

// export function Sidebar({ className }: SidebarProps) {
//   const pathname = usePathname()
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       <Sheet open={open} onOpenChange={setOpen}>
//         <SheetTrigger asChild>
//           <Button
//             variant="outline"
//             size="icon"
//             className="md:hidden"
//           >
//             <MenuIcon className="h-6 w-6" />
//             <span className="sr-only">Toggle Sidebar</span>
//           </Button>
//         </SheetTrigger>
//         <SheetContent side="left" className="w-[240px] sm:w-[300px]">
//           <div className="px-1 py-6 md:px-6">
//             <h2 className="mb-5 px-2 text-lg font-semibold tracking-tight">
//               Navigation
//             </h2>
//             <SidebarNavItems pathname={pathname} setOpen={setOpen} />
//           </div>
//         </SheetContent>
//       </Sheet>
//       <aside
//         className={cn(
//           "pb-12 hidden md:block",
//           className
//         )}
//       >
//         <div className="space-y-4 py-4">
//           <div className="px-3 py-2">
//             <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
//               Navigation
//             </h2>
//             <div className="space-y-1">
//               <SidebarNavItems pathname={pathname} setOpen={setOpen} />
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   )
// }

// function SidebarNavItems({ pathname, setOpen }: { pathname: string, setOpen: (open: boolean) => void }) {
//   return (
//     <nav className="space-y-1">
//       {sidebarNavItems.map((item) => (
//         <Link
//           key={item.href}
//           href={item.href}
//           onClick={() => setOpen(false)}
//           className={cn(
//             "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
//             pathname === item.href ? "bg-accent" : "transparent"
//           )}
//         >
//           <span>{item.title}</span>
//         </Link>
//       ))}
//     </nav>
//   )
// }