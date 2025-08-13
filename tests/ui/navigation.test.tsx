import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { Navbar } from '@/modules/home/ui/components/navbar'

// Mock functions need to be hoisted to be available in vi.mock() calls
const mockUseLocale = vi.hoisted(() => vi.fn())
const mockUseRouter = vi.hoisted(() => vi.fn())
const mockUsePathname = vi.hoisted(() => vi.fn())
const mockUseTranslations = vi.hoisted(() => vi.fn())

vi.mock('next-intl', async () => {
  const actual = await vi.importActual('next-intl')
  return {
    ...actual,
    useLocale: () => mockUseLocale(),
    useTranslations: () => mockUseTranslations()
  }
})

vi.mock('@/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => 
    React.createElement('a', { href, ...props }, children)
}))


// Mock TRPC and TanStack Query
vi.mock('@/trpc/client', () => ({
  useTRPC: () => ({
    auth: {
      session: {
        queryOptions: () => ({
          queryKey: ['auth', 'session'],
          queryFn: () => Promise.resolve(null)
        })
      }
    }
  })
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null
  })
}))

describe('Navigation Tests', () => {
  const mockPush = vi.fn()
  const mockPathname = vi.fn()

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUsePathname.mockReturnValue(mockPathname)
    mockUseLocale.mockReturnValue('en')
    
    // Setup translation mock with English messages
    mockUseTranslations.mockReturnValue((key: string) => {
      const messages: Record<string, string> = {
        'navigation.home': 'Home',
        'navigation.about': 'About',
        'navigation.features': 'Features',
        'navigation.pricing': 'Pricing',
        'navigation.contact': 'Contact',
        'auth.login': 'Log in',
        'auth.signup': 'Start selling'
      }
      return messages[key] || key
    })
    
    // Mock pathname to return current path
    mockPathname.mockReturnValue('/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Navigation Links Discovery', () => {
    it('finds all expected navigation links', () => {
      render(<Navbar />)
      
      // Get all navigation links
      const navLinks = screen.getAllByRole('link')
      expect(navLinks.length).toBeGreaterThan(0)
      
      // Check for main navigation links
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('displays navigation buttons correctly', () => {
      render(<Navbar />)
      
      // Navigation items are buttons, not links
      const homeButton = screen.getByRole('button', { name: /home/i })
      const aboutButton = screen.getByRole('button', { name: /about/i })
      const pricingButton = screen.getByRole('button', { name: /pricing/i })
      const featuresButton = screen.getByRole('button', { name: /features/i })
      const contactButton = screen.getByRole('button', { name: /contact/i })
      
      // All navigation buttons should be present and enabled
      expect(homeButton).toBeInTheDocument()
      expect(aboutButton).toBeInTheDocument()
      expect(pricingButton).toBeInTheDocument()
      expect(featuresButton).toBeInTheDocument()
      expect(contactButton).toBeInTheDocument()
      
      // Buttons should be enabled
      expect(homeButton).not.toBeDisabled()
      expect(aboutButton).not.toBeDisabled()
      expect(pricingButton).not.toBeDisabled()
      expect(featuresButton).not.toBeDisabled()
      expect(contactButton).not.toBeDisabled()
      
      // Check for the actual link element (logo)
      const logoLink = screen.getByRole('link', { name: /reserv/i })
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Navigation Click Behavior', () => {
    it('handles navigation click for pricing page', () => {
      render(<Navbar />)
      
      const pricingButton = screen.getByText('Pricing').closest('button')
      expect(pricingButton).toBeInTheDocument()
      
      // Click the pricing navigation button
      if (pricingButton) {
        fireEvent.click(pricingButton)
        
        // Should call router.push with correct path
        expect(mockPush).toHaveBeenCalledWith('/pricing')
      }
    })

    it('handles navigation click for about page', () => {
      render(<Navbar />)
      
      const aboutButton = screen.getByText('About').closest('button')
      expect(aboutButton).toBeInTheDocument()
      
      // Click the about navigation button
      if (aboutButton) {
        fireEvent.click(aboutButton)
        
        // Should call router.push with correct path
        expect(mockPush).toHaveBeenCalledWith('/about')
      }
    })

    it('handles navigation click for features page', () => {
      render(<Navbar />)
      
      const featuresButton = screen.getByText('Features').closest('button')
      expect(featuresButton).toBeInTheDocument()
      
      // Click the features navigation button
      if (featuresButton) {
        fireEvent.click(featuresButton)
        
        // Should call router.push with correct path
        expect(mockPush).toHaveBeenCalledWith('/features')
      }
    })

    it('handles navigation click for contact page', () => {
      render(<Navbar />)
      
      const contactButton = screen.getByText('Contact').closest('button')
      expect(contactButton).toBeInTheDocument()
      
      // Click the contact navigation button
      if (contactButton) {
        fireEvent.click(contactButton)
        
        // Should call router.push with correct path
        expect(mockPush).toHaveBeenCalledWith('/contact')
      }
    })

    it('handles navigation click for home page', () => {
      render(<Navbar />)
      
      const homeButton = screen.getByText('Home').closest('button')
      expect(homeButton).toBeInTheDocument()
      
      // Click the home navigation button
      if (homeButton) {
        fireEvent.click(homeButton)
        
        // Should call router.push with correct path
        expect(mockPush).toHaveBeenCalledWith('/')
      }
    })
  })

  describe('Navigation State', () => {
    it('shows active state for current page', () => {
      // Mock pathname to be /pricing
      mockPathname.mockReturnValue('/pricing')
      
      render(<Navbar />)
      
      const pricingButton = screen.getByText('Pricing').closest('button')
      
      // Should have active styling classes
      if (pricingButton) {
        expect(pricingButton.className).toContain('bg-black')
        expect(pricingButton.className).toContain('text-white')
      }
    })

    it('does not show active state for non-current pages', () => {
      // Mock pathname to be /pricing
      mockPathname.mockReturnValue('/pricing')
      
      render(<Navbar />)
      
      const homeButton = screen.getByText('Home').closest('button')
      
      // Should not have active styling classes
      if (homeButton) {
        expect(homeButton.className).not.toContain('bg-black')
        expect(homeButton.className).not.toContain('text-white')
      }
    })
  })

  describe('Error Handling', () => {
    it('handles router navigation failures gracefully', () => {
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed')
      })
      
      render(<Navbar />)
      
      const pricingButton = screen.getByText('Pricing').closest('button')
      
      // Should not throw when navigation fails
      if (pricingButton) {
        expect(() => fireEvent.click(pricingButton)).not.toThrow()
      }
    })

    it('maintains functionality when pathname is undefined', () => {
      mockPathname.mockReturnValue(undefined)
      
      // Should not throw when rendering with undefined pathname
      expect(() => render(<Navbar />)).not.toThrow()
    })
  })
})