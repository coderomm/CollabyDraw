import { Button } from "./ui/button"
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { PenLine, Save, Share2, Settings, HelpCircle } from "lucide-react"
import Link from "next/link"

export function DrawingSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <Link href="/" className="flex items-center space-x-2">
            <PenLine className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DrawTogether</span>
          </Link>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-4 p-4">
            <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/90">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/90">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/90">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Room: Drawing-123</span>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
              Copy Link
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

