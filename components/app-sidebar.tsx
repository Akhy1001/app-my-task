
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/animate-ui/components/radix/sidebar"

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>Item 1</SidebarMenuItem>
                    <SidebarMenuItem>Item 2</SidebarMenuItem>
                    <SidebarMenuItem>Item 3</SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Label 1</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>Item 1</SidebarMenuItem>
                        <SidebarMenuItem>Item 2</SidebarMenuItem>
                        <SidebarMenuItem>Item 3</SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Label 2</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>Item 1</SidebarMenuItem>
                        <SidebarMenuItem>Item 2</SidebarMenuItem>
                        <SidebarMenuItem>Item 3</SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>Item 1</SidebarMenuItem>
                    <SidebarMenuItem>Item 2</SidebarMenuItem>
                    <SidebarMenuItem>Item 3</SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
