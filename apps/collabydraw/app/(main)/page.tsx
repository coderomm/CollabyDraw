import { StandaloneCanvas } from "@/components/canvas/StandaloneCanvas";
import { authOptions } from "@/utils/auth";
import { Button } from "@repo/ui/button"
import { PenLine, Users, Share2, Sparkles } from "lucide-react"
import { getServerSession } from "next-auth";
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user || !user.id) {
    return (
      <>
        <StandaloneCanvas />;
      </>
    )
  }
  return (
    <>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Draw Together in Real-time
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Create, collaborate, and share drawings in real-time. No installation required.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <Link href="/draw">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Drawing
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Learn More
              </Button>
            </div>
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
            ].map((feature) => (
              <div key={feature.title}
                className="flex flex-col items-center space-y-2 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

