"use client"

import * as React from "react"

type PixelCanvasHostElement = HTMLElement & {
  appear: () => void
  disappear: () => void
}

const BrowserHTMLElement =
  typeof HTMLElement === "undefined"
    ? (class {} as typeof HTMLElement)
    : HTMLElement

class Pixel {
  width: number
  height: number
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  color: string
  speed: number
  size: number
  sizeStep: number
  minSize: number
  maxSizeInteger: number
  maxSize: number
  delay: number
  counter: number
  counterStep: number
  isIdle: boolean
  isReverse: boolean
  isShimmer: boolean

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = context
    this.x = x
    this.y = y
    this.color = color
    this.speed = this.getRandomValue(0.1, 0.9) * speed
    this.size = 0
    this.sizeStep = Math.random() * 0.4
    this.minSize = 0.5
    this.maxSizeInteger = 2
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger)
    this.delay = delay
    this.counter = 0
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
    this.isIdle = false
    this.isReverse = false
    this.isShimmer = false
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size,
    )
  }

  appear() {
    this.isIdle = false

    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }

    if (this.size >= this.maxSize) {
      this.isShimmer = true
    }

    if (this.isShimmer) {
      this.shimmer()
    } else {
      this.size += this.sizeStep
    }

    this.draw()
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0

    if (this.size <= 0) {
      this.isIdle = true
      return
    }

    this.size -= 0.1
    this.draw()
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true
    } else if (this.size <= this.minSize) {
      this.isReverse = false
    }

    if (this.isReverse) {
      this.size -= this.speed
    } else {
      this.size += this.speed
    }
  }
}

class PixelCanvasElement extends BrowserHTMLElement {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null
  private pixels: Pixel[] = []
  private animation: number | null = null
  private timeInterval = 1000 / 60
  private timePrevious = performance.now()
  private reducedMotion: boolean
  private initialized = false
  private resizeObserver: ResizeObserver | null = null
  private parent: Element | null = null

  private readonly handleParentEnter = () => this.appear()
  private readonly handleParentLeave = () => this.disappear()
  private readonly handleParentFocus = () => this.appear()
  private readonly handleParentBlur = () => this.disappear()

  constructor() {
    super()
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const shadow = this.attachShadow({ mode: "open" })
    const style = document.createElement("style")
    style.textContent = `
      :host {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
      }

      canvas {
        inline-size: 100%;
        block-size: 100%;
      }
    `
    shadow.appendChild(style)
    shadow.appendChild(this.canvas)
  }

  get colors() {
    return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"]
  }

  get gap() {
    const value = Number(this.dataset.gap) || 5
    return Math.max(4, Math.min(50, value))
  }

  get speed() {
    const value = Number(this.dataset.speed) || 35
    return this.reducedMotion ? 0 : Math.max(0, Math.min(100, value)) * 0.001
  }

  get noFocus() {
    return this.hasAttribute("data-no-focus")
  }

  get variant() {
    return this.dataset.variant || "default"
  }

  get trigger() {
    return this.dataset.trigger || "hover"
  }

  connectedCallback() {
    if (this.initialized) return
    this.initialized = true
    this.parent = this.parentElement

    requestAnimationFrame(() => {
      this.handleResize()

      const observer = new ResizeObserver((entries) => {
        if (!entries.length) return
        requestAnimationFrame(() => this.handleResize())
      })

      observer.observe(this)
      this.resizeObserver = observer
    })

    if (this.trigger !== "manual") {
      this.parent?.addEventListener("mouseenter", this.handleParentEnter)
      this.parent?.addEventListener("mouseleave", this.handleParentLeave)

      if (!this.noFocus) {
        this.parent?.addEventListener("focus", this.handleParentFocus, true)
        this.parent?.addEventListener("blur", this.handleParentBlur, true)
      }
    }
  }

  disconnectedCallback() {
    this.initialized = false
    this.resizeObserver?.disconnect()

    if (this.trigger !== "manual") {
      this.parent?.removeEventListener("mouseenter", this.handleParentEnter)
      this.parent?.removeEventListener("mouseleave", this.handleParentLeave)

      if (!this.noFocus) {
        this.parent?.removeEventListener("focus", this.handleParentFocus, true)
        this.parent?.removeEventListener("blur", this.handleParentBlur, true)
      }
    }

    if (this.animation) {
      cancelAnimationFrame(this.animation)
      this.animation = null
    }

    this.parent = null
  }

  appear() {
    this.handleResize()
    this.handleAnimation("appear")
  }

  disappear() {
    this.handleAnimation("disappear")
  }

  private handleResize() {
    if (!this.ctx || !this.initialized) return

    const rect = this.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    const dpr = window.devicePixelRatio || 1

    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(dpr, dpr)

    this.createPixels(width, height)
  }

  private getDistanceToCenter(x: number, y: number, width: number, height: number) {
    const dx = x - width / 2
    const dy = y - height / 2
    return Math.sqrt(dx * dx + dy * dy)
  }

  private getDistanceToBottomLeft(x: number, y: number, height: number) {
    const dx = x
    const dy = height - y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private createPixels(width: number, height: number) {
    if (!this.ctx) return
    this.pixels = []

    for (let x = 0; x < width; x += this.gap) {
      for (let y = 0; y < height; y += this.gap) {
        const color =
          this.colors[Math.floor(Math.random() * this.colors.length)]
        const delay = this.reducedMotion
          ? 0
          : this.variant === "icon"
            ? this.getDistanceToCenter(x, y, width, height)
            : this.getDistanceToBottomLeft(x, y, height)

        this.pixels.push(
          new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay),
        )
      }
    }
  }

  private handleAnimation(name: "appear" | "disappear") {
    if (this.animation) {
      cancelAnimationFrame(this.animation)
    }

    const animate = () => {
      this.animation = requestAnimationFrame(animate)

      const timeNow = performance.now()
      const timePassed = timeNow - this.timePrevious

      if (timePassed < this.timeInterval) return

      this.timePrevious = timeNow - (timePassed % this.timeInterval)

      if (!this.ctx) return
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      let allIdle = true
      for (const pixel of this.pixels) {
        pixel[name]()
        if (!pixel.isIdle) allIdle = false
      }

      if (allIdle && this.animation) {
        cancelAnimationFrame(this.animation)
        this.animation = null
      }
    }

    animate()
  }
}

export interface PixelCanvasProps extends React.HTMLAttributes<PixelCanvasHostElement> {
  active?: boolean
  gap?: number
  speed?: number
  colors?: string[]
  variant?: "default" | "icon"
  noFocus?: boolean
  trigger?: "hover" | "manual"
}

const PixelCanvas = React.forwardRef<PixelCanvasHostElement, PixelCanvasProps>(
  (
    {
      active,
      gap,
      speed,
      colors,
      variant,
      noFocus,
      trigger = "hover",
      style,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<PixelCanvasHostElement | null>(null)

    const setRef = React.useCallback(
      (node: PixelCanvasHostElement | null) => {
        localRef.current = node

        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<PixelCanvasHostElement | null>).current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      if (typeof window === "undefined") return

      if (!customElements.get("pixel-canvas")) {
        customElements.define("pixel-canvas", PixelCanvasElement)
      }
    }, [])

    React.useEffect(() => {
      if (active === undefined || typeof window === "undefined") return

      const frame = window.requestAnimationFrame(() => {
        const element = localRef.current
        if (!element) return

        if (active) {
          element.appear()
        } else {
          element.disappear()
        }
      })

      return () => window.cancelAnimationFrame(frame)
    }, [active])

    return React.createElement("pixel-canvas", {
      ref: setRef,
      "data-gap": gap,
      "data-speed": speed,
      "data-colors": colors?.join(","),
      "data-variant": variant,
      "data-trigger": trigger,
      ...(noFocus && { "data-no-focus": "" }),
      style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        ...style,
      },
      ...props,
    } as React.HTMLAttributes<PixelCanvasHostElement> &
      React.RefAttributes<PixelCanvasHostElement> &
      Record<string, unknown>)
  },
)
PixelCanvas.displayName = "PixelCanvas"

export { PixelCanvas }
