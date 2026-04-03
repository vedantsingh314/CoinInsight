"use client"
import  Link  from "next/link"
import React, { useState } from 'react'
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search } from 'lucide-react'
import SearchModal from './SearchModal'

const Header = () => {
    const pathname=usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header>
        <div className='main-container inner'>
            <Link href="/">
            <Image src="/logo.svg" alt="CryptoInsight logo" width={132} height={40}/>
            </Link>

            <nav>
                <Link href="/" className={cn('nav-link',{'is-active':pathname==='/','is-hime':true})}>Home</Link>
                
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-500 hover:bg-dark-400 transition text-gray-300 text-sm"
                  title="Press Cmd+K (Mac) or Ctrl+K (Windows)"
                >
                  <Search size={18} />
                  <span>Search</span>
                  <kbd className="hidden md:inline px-2 py-1 rounded bg-dark-600 text-xs text-gray-400">⌘K</kbd>
                </button>

                <Link href="/coins" className={cn('nav-link',{'is-active':pathname==='/coins',})}>All coins</Link>
            </nav>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header