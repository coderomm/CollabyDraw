import { Button } from "@repo/ui/button"
import { PenLine, Users, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex-1">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <motion.h1
            className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Draw Together in Real-time
          </motion.h1>
          <motion.p
            className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Create, collaborate, and share drawings in real-time. No installation required.
          </motion.p>
          <motion.div
            className="space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/draw">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Drawing
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {[
            {
              icon: PenLine,
              title: "Easy Drawing Tools",
              description: "Intuitive tools for sketching, diagramming, and illustrating your ideas.",
            },
            {
              icon: Users,
              title: "Real-time Collaboration",
              description: "Work together with your team in real-time, no matter where they are.",
            },
            {
              icon: Share2,
              title: "Easy Sharing",
              description: "Share your drawings with a simple link or export them in various formats.",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex flex-col items-center space-y-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}

