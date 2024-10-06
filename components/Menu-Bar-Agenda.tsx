import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarSeparator,
} from "@/components/ui/menubar"
import Link from "next/link"

export function MenuBarAgenda() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Menu</MenubarTrigger>
        <MenubarContent>
          <Link href="/dashboard">
            <MenubarItem>Dashboard</MenubarItem>
          </Link>
          <Link href="/inventory">
            <MenubarItem>Inventory</MenubarItem>
          </Link>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}