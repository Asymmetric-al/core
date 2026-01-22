"use client";

import Link from "next/link";
import Image from "next/image";
import { SquarePlusIcon } from "lucide-react";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { MotionPreset } from "@asym/ui/components/shadcn/motion-preset";

const HeroSection = () => {
  return (
    <section className="bg-muted -mt-16 flex min-h-screen w-full pt-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-full items-start">
          <div className="z-1 flex w-full flex-col items-center gap-7 py-32 max-lg:text-center lg:items-start lg:py-12">
            <MotionPreset
              fade
              slide
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4 rounded-md border px-4 py-2.5"
            >
              <p className="font-semibold uppercase">Compatible With:</p>

              <a href="#">
                <Image
                  src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/tailwind-logo.png"
                  alt="TailwindCSS Logo"
                  className="w-7"
                  width={28}
                  height={28}
                  unoptimized
                />
              </a>
              <a href="#">
                <Image
                  src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/nextjs-logo.png"
                  alt="Next.js logo"
                  className="w-5.5"
                  width={22}
                  height={22}
                  unoptimized
                />
              </a>
              <a href="#">
                <Image
                  src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/shadcn-logo.png"
                  alt="Shadcn logo"
                  className="w-5.5"
                  width={22}
                  height={22}
                  unoptimized
                />
              </a>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="#">
                    <SquarePlusIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  Integrate with all your framework
                </TooltipContent>
              </Tooltip>
            </MotionPreset>

            <MotionPreset
              component="h1"
              fade
              slide
              delay={0.3}
              transition={{ duration: 0.5 }}
              className="max-w-xl text-3xl leading-[1.29167] font-bold text-pretty sm:text-4xl lg:text-5xl"
            >
              The{" "}
              <div className="animate-flip text-muted-foreground relative -mb-px inline-block h-7.5 w-36.5 origin-center [transform-style:preserve-3d] sm:h-9 sm:w-43.5 lg:h-12 lg:w-58">
                <div className="absolute flex h-full [transform-origin:center] [transform:rotateX(0deg)_translateZ(20px)] [backface-visibility:hidden]">
                  Easiest
                </div>
                <div className="absolute flex h-full [transform-origin:center] [transform:rotateX(-120deg)_translateZ(20px)] [backface-visibility:hidden]">
                  Effortless
                </div>
                <div className="absolute flex h-full [transform-origin:center] [transform:rotateX(-240deg)_translateZ(20px)] [backface-visibility:hidden]">
                  Seamless
                </div>
              </div>
              <br />
              Platform for Kingdom Impact
            </MotionPreset>

            <MotionPreset
              component="p"
              fade
              slide
              delay={0.6}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground max-w-xl text-lg"
            >
              Connect donors with missionaries. Manage support, track giving,
              and empower mission work around the globe with our powerful
              platform.
            </MotionPreset>

            <MotionPreset
              fade
              slide
              delay={0.9}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="rounded-lg text-base" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                size="lg"
                className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer rounded-lg font-mono text-base"
                onClick={() => {
                  navigator.clipboard.writeText("npx asymmetric@latest init");
                }}
              >
                npx asymmetric@latest init
              </Button>
            </MotionPreset>
          </div>

          <MotionPreset
            fade
            slide={{ direction: "right" }}
            delay={1.2}
            transition={{ duration: 0.5 }}
            className="absolute right-0 shrink-0 max-lg:hidden lg:max-[1100px]:top-10 lg:max-xl:translate-x-40 xl:top-0 xl:w-[87.4%]"
          >
            <Image
              src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/hero/image-20.png"
              alt="Mobile screen"
              className="dark:hidden"
              width={1200}
              height={800}
              unoptimized
            />
            <Image
              src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/hero/image-20-dark.png"
              alt="Mobile screen"
              className="hidden dark:inline-block"
              width={1200}
              height={800}
              unoptimized
            />
          </MotionPreset>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
