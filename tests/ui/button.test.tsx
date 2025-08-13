import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { Button } from '@/components/ui/button'

describe('UI Button', () => {
  it('renders default button with base and default classes', () => {
    render(<Button>Click me</Button>)

    const btn = screen.getByRole('button', { name: /click me/i })

    // Base class from cva and default size/variant classes
    expect(btn).toHaveAttribute('data-slot', 'button')
    expect(btn.className).toContain('inline-flex')
    expect(btn.className).toContain('h-12')
    expect(btn.className).toContain('bg-primary')
  })

  it('applies elevated variant classes instead of default', () => {
    render(<Button variant="elevated">Elev</Button>)
    const btn = screen.getByRole('button', { name: /elev/i })

    expect(btn.className).toContain('bg-white')
    expect(btn.className).not.toContain('bg-primary')
    // Elevated has fancy hover shadow class; we can check a prefix exists
    expect(btn.className).toContain('hover:shadow-[')
  })

  it('applies size classes: sm and icon', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const small = screen.getByRole('button', { name: /small/i })
    expect(small.className).toContain('h-10')
    expect(small.className).not.toContain('h-12')

    rerender(<Button size="icon" aria-label="icon-btn"><svg aria-hidden /></Button>)
    const iconBtn = screen.getByLabelText('icon-btn')
    expect(iconBtn.className).toContain('size-9')
  })

  it('renders asChild and preserves classes on the child element', () => {
    render(
      <Button asChild variant="elevated">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/library/123">Go</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: /go/i }) as HTMLAnchorElement
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('/library/123')
    // Button classes should be on the anchor
    expect(link.className).toContain('inline-flex')
    expect(link.className).toContain('bg-white')
  })

  it('forwards onClick to underlying element', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Press</Button>)
    fireEvent.click(screen.getByRole('button', { name: /press/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
