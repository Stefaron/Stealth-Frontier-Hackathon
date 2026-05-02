"use client"

import { useEffect, useRef } from "react"

interface Vector2D {
  x: number
  y: number
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }

  closeEnoughTarget = 100
  maxSpeed = 1.0
  maxForce = 0.1
  particleSize = 10
  isKilled = false

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 0, g: 0, b: 0 }
  colorWeight = 0
  colorBlendRate = 0.01

  move() {
    let proximityMult = 1
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2)
    )
    if (distance < this.closeEnoughTarget) proximityMult = distance / this.closeEnoughTarget

    const towardsTarget = { x: this.target.x - this.pos.x, y: this.target.y - this.pos.y }
    const mag = Math.sqrt(towardsTarget.x ** 2 + towardsTarget.y ** 2)
    if (mag > 0) {
      towardsTarget.x = (towardsTarget.x / mag) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / mag) * this.maxSpeed * proximityMult
    }

    const steer = { x: towardsTarget.x - this.vel.x, y: towardsTarget.y - this.vel.y }
    const steerMag = Math.sqrt(steer.x ** 2 + steer.y ** 2)
    if (steerMag > 0) {
      steer.x = (steer.x / steerMag) * this.maxForce
      steer.y = (steer.y / steerMag) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y
    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    if (this.colorWeight < 1.0) this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)

    const c = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`
    if (drawAsPoints) {
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const rp = this.randomPos(width / 2, height / 2, (width + height) / 2)
      this.target.x = rp.x
      this.target.y = rp.y
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0
      this.isKilled = true
    }
  }

  private randomPos(x: number, y: number, mag: number): Vector2D {
    const rx = Math.random() * 1000
    const ry = Math.random() * 500
    const d = { x: rx - x, y: ry - y }
    const m = Math.sqrt(d.x ** 2 + d.y ** 2)
    if (m > 0) { d.x = (d.x / m) * mag; d.y = (d.y / m) * mag }
    return { x: x + d.x, y: y + d.y }
  }
}

interface ParticleTextEffectProps {
  words?: string[]
  className?: string
  showDescription?: boolean
  canvasWidth?: number
  canvasHeight?: number
  fontSize?: number
}

const DEFAULT_WORDS = ["STEALTH", "PRIVATE", "ENCRYPTED", "AUDITABLE", "COMPLIANT"]

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
  className,
  showDescription = true,
  canvasWidth = 1000,
  canvasHeight = 400,
  fontSize = 120,
}: ParticleTextEffectProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const animationRef   = useRef<number>(undefined)
  const particlesRef   = useRef<Particle[]>([])
  const frameCountRef  = useRef(0)
  const wordIndexRef   = useRef(0)
  const mouseRef       = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false })

  const pixelSteps  = 6
  const drawAsPoints = true

  const randomPos = (x: number, y: number, mag: number, cw: number, ch: number): Vector2D => {
    const rx = Math.random() * cw
    const ry = Math.random() * ch
    const d  = { x: rx - x, y: ry - y }
    const m  = Math.sqrt(d.x ** 2 + d.y ** 2)
    if (m > 0) { d.x = (d.x / m) * mag; d.y = (d.y / m) * mag }
    return { x: x + d.x, y: y + d.y }
  }

  const nextWord = (word: string, canvas: HTMLCanvasElement) => {
    const off = document.createElement("canvas")
    off.width  = canvas.width
    off.height = canvas.height
    const ctx  = off.getContext("2d")!

    ctx.fillStyle    = "white"
    ctx.font         = `bold ${fontSize}px Arial`
    ctx.textAlign    = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels    = imageData.data

    const newColor = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 }
    const particles = particlesRef.current
    let pi = 0

    const coords: number[] = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) coords.push(i)
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coords[i], coords[j]] = [coords[j], coords[i]]
    }

    for (const ci of coords) {
      if (pixels[ci + 3] > 0) {
        const x = (ci / 4) % canvas.width
        const y = Math.floor(ci / 4 / canvas.width)
        let p: Particle

        if (pi < particles.length) {
          p = particles[pi]
          p.isKilled = false
          pi++
        } else {
          p = new Particle()
          const rp = randomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2, canvas.width, canvas.height)
          p.pos.x          = rp.x
          p.pos.y          = rp.y
          p.maxSpeed       = Math.random() * 6 + 4
          p.maxForce       = p.maxSpeed * 0.05
          p.particleSize   = Math.random() * 6 + 6
          p.colorBlendRate = Math.random() * 0.0275 + 0.0025
          particles.push(p)
        }

        p.startColor = {
          r: p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight,
          g: p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight,
          b: p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight,
        }
        p.targetColor  = newColor
        p.colorWeight  = 0
        p.target.x     = x
        p.target.y     = y
      }
    }

    for (let i = pi; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx       = canvas.getContext("2d")!
    const particles = particlesRef.current

    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.move()
      p.draw(ctx, drawAsPoints)
      if (p.isKilled && (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height)) {
        particles.splice(i, 1)
      }
    }

    if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
      particles.forEach((p) => {
        const d = Math.sqrt((p.pos.x - mouseRef.current.x) ** 2 + (p.pos.y - mouseRef.current.y) ** 2)
        if (d < 50) p.kill(canvas.width, canvas.height)
      })
    }

    frameCountRef.current++
    if (frameCountRef.current % 240 === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      nextWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width  = canvasWidth
    canvas.height = canvasHeight

    nextWord(words[0], canvas)
    animate()

    const rect    = () => canvas.getBoundingClientRect()
    const scaleX  = () => canvas.width / rect().width
    const scaleY  = () => canvas.height / rect().height

    const onDown  = (e: MouseEvent) => {
      mouseRef.current.isPressed    = true
      mouseRef.current.isRightClick = e.button === 2
      mouseRef.current.x = (e.clientX - rect().left) * scaleX()
      mouseRef.current.y = (e.clientY - rect().top)  * scaleY()
    }
    const onUp    = () => { mouseRef.current.isPressed = false; mouseRef.current.isRightClick = false }
    const onMove  = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX - rect().left) * scaleX()
      mouseRef.current.y = (e.clientY - rect().top)  * scaleY()
    }
    const onCtx   = (e: MouseEvent) => e.preventDefault()

    canvas.addEventListener("mousedown",    onDown)
    canvas.addEventListener("mouseup",      onUp)
    canvas.addEventListener("mousemove",    onMove)
    canvas.addEventListener("contextmenu",  onCtx)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      canvas.removeEventListener("mousedown",   onDown)
      canvas.removeEventListener("mouseup",     onUp)
      canvas.removeEventListener("mousemove",   onMove)
      canvas.removeEventListener("contextmenu", onCtx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={className ?? "flex flex-col items-center justify-center min-h-screen bg-black p-4"}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block",
          maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 20%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 20%, transparent 72%)",
        }}
      />
      {showDescription && (
        <div className="mt-4 text-white text-sm text-center max-w-md">
          <p className="mb-2">Particle Text Effect</p>
          <p className="text-white/40 text-xs">
            Right-click and hold to destroy particles · Words change every 4 seconds
          </p>
        </div>
      )}
    </div>
  )
}
