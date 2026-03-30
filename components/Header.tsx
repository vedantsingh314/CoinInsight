"use client"
import  Link  from "next/link"
import React from 'react'
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
const Header = () => {
    const pathname=usePathname();//this is used to tell which route i am currently is and only works in client side
  return (
    <header>
        <div className='main-container inner'>
            <Link href="/">
            <Image src="/logo.svg" alt="CoinInsight logo" width={132} height={40}/>
            </Link>

            <nav>
                <Link href="/" className={cn('nav-link',{'is-active':pathname==='/','is-hime':true})}>Home</Link>
                
                <p>Search Modal</p>
                <Link href="/coins" className={cn('nav-link',{'is-active':pathname='/coins',})}>All coins</Link>
            </nav>
        </div>
    </header>
  )
}

export default Header