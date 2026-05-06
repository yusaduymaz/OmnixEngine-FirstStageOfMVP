'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface NewsTickerProps {
  items: {
    title: string
    description: string
    href: string
  }[]
}

export default function NewsTicker({ items }: NewsTickerProps) {
  return (
    <div className="flex-1 overflow-hidden ml-20">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex items-center gap-12 whitespace-nowrap"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-white/70 uppercase"># {item.title}</span>
            <span className="text-[14px] font-medium text-white">{item.description}</span>
            <Link href={item.href} className="text-[14px] font-bold text-white underline underline-offset-2 ml-2 hover:opacity-80 transition-opacity">
              Detay
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
