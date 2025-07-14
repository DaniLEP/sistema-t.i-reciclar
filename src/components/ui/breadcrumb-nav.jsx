"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BreadcrumbNav({ onHomeClick }) {
  return (
    <nav className="flex items-center space-x-2 text-white/80 mb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={onHomeClick}
        className="text-white/80 hover:text-white hover:bg-white/10 p-2"
      >
        <Home className="w-4 h-4" />
      </Button>
      <ChevronRight className="w-4 h-4" />
      <span className="text-white font-medium">Equipment Consultation</span>
    </nav>
  )
}
