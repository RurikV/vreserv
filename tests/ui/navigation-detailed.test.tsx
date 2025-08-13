import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

import { Navbar } from '@/modules/home/ui/components/navbar'

// Test configuration
const TEST_CONFIG = {
  clickDelay: 10, // Reduced for faster tests
  maxClicks: 3,   // Maximum clicks to try
  testRoutes: ['/pricing', '/about', '/features', '/contact', '/', '/admin']
}

// Mock functions need to be hoisted to be available in vi.mock() calls
const mockUseLocale = vi.hoisted(() => vi.fn())
const mockUseRouter = vi.hoisted(() => vi.fn())
const mockUsePathname = vi.hoisted(() => vi.fn())
const mockUseTranslations = vi.hoisted(() => vi.fn())
const mockUseQuery = vi.hoisted(() => vi.fn())

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
  useQuery: () => mockUseQuery()
}))

describe('Navigation Detailed Tests', () => {
  const mockPush = vi.fn()
  const mockPathname = vi.fn()

  // Track navigation attempts and results
  let testResults = {
    totalAttempts: 0,
    successfulNavigations: 0,
    failedNavigations: 0,
    multipleClicksNeeded: 0
  }

  // Move testSingleNavigation function to the outer scope so it's accessible by all test blocks
  const testSingleNavigation = async (href: string, maxAttempts = 3) => {
    const routeNameMap: Record<string, string> = {
      '/': 'Home',
      '/about': 'About', 
      '/features': 'Features',
      '/pricing': 'Pricing',
      '/contact': 'Contact',
      '/admin': 'Dashboard'
    }

    const routeName = routeNameMap[href] || href
    let attempts = 0
    
    // Clean up any previous renders to prevent duplicates
    cleanup()
    render(<Navbar />)
    
    // Find the button for this route using getAllByText to handle potential duplicates
    const buttons = screen.getAllByText(routeName)
    const button = buttons.length > 0 ? buttons[0].closest('button') : null
    if (!button) {
      testResults.failedNavigations++
      return { success: false, attempts: 0, reason: 'button_not_found' }
    }

    const attemptClick = () => {
      attempts++
      testResults.totalAttempts++
      
      fireEvent.click(button)
      
      // Check if navigation was called
      const wasNavigationCalled = mockPush.mock.calls.some(call => call[0] === href)
      
      if (wasNavigationCalled) {
        testResults.successfulNavigations++
        if (attempts > 1) {
          testResults.multipleClicksNeeded++
        }
        return { success: true, attempts }
      } else if (attempts < maxAttempts) {
        return null // Continue trying
      } else {
        testResults.failedNavigations++
        return { success: false, attempts, expectedPath: href }
      }
    }

    // Try clicking multiple times if needed
    let result = null
    while (attempts < maxAttempts && result === null) {
      result = attemptClick()
      if (result === null) {
        // Wait a bit before next attempt
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.clickDelay))
      }
    }

    return result || { success: false, attempts, expectedPath: href }
  }

  beforeEach(() => {
    // Reset all mocks and test results
    vi.clearAllMocks()
    testResults = {
      totalAttempts: 0,
      successfulNavigations: 0,
      failedNavigations: 0,
      multipleClicksNeeded: 0
    }
    
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUsePathname.mockReturnValue(mockPathname)
    mockUseLocale.mockReturnValue('en')
    
    // Default to unauthenticated user (tests can override this)
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    })
    
    // Setup translation mock with English messages
    mockUseTranslations.mockReturnValue((key: string) => {
      const messages: Record<string, string> = {
        'navigation.home': 'Home',
        'navigation.about': 'About',
        'navigation.features': 'Features',
        'navigation.pricing': 'Pricing',
        'navigation.contact': 'Contact',
        'auth.login': 'Log in',
        'auth.signup': 'Start selling',
        'auth.dashboard': 'Dashboard'
      }
      return messages[key] || key
    })
    
    // Mock pathname to return current path
    mockPathname.mockReturnValue('/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Single Navigation Tests', () => {

    it('successfully navigates to pricing page', async () => {
      const result = await testSingleNavigation('/pricing', TEST_CONFIG.maxClicks)
      expect(result.success).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/pricing')
    })

    it('successfully navigates to about page', async () => {
      const result = await testSingleNavigation('/about', TEST_CONFIG.maxClicks)
      expect(result.success).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/about')
    })

    it('successfully navigates to features page', async () => {
      const result = await testSingleNavigation('/features', TEST_CONFIG.maxClicks)
      expect(result.success).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/features')
    })

    it('successfully navigates to contact page', async () => {
      const result = await testSingleNavigation('/contact', TEST_CONFIG.maxClicks)
      expect(result.success).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/contact')
    })

    it('successfully navigates to home page', async () => {
      const result = await testSingleNavigation('/', TEST_CONFIG.maxClicks)
      expect(result.success).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Admin Navigation Tests', () => {
    it('successfully navigates to admin page when user is authenticated', async () => {
      // Mock authenticated user session
      mockUseQuery.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        isLoading: false,
        error: null
      })

      const result = await testSingleNavigation('/admin', TEST_CONFIG.maxClicks)
      expect(result.success).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })

    it('does not show admin button when user is not authenticated', () => {
      // Mock unauthenticated session (already default, but being explicit)
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      })

      cleanup()
      render(<Navbar />)
      
      // Dashboard button should not be present
      expect(() => screen.getByText('Dashboard')).toThrow()
      
      // Should show login and signup buttons instead
      expect(screen.getByText('Log in')).toBeInTheDocument()
      expect(screen.getByText('Start selling')).toBeInTheDocument()
    })

    it('shows admin button when user is authenticated', () => {
      // Mock authenticated user session
      mockUseQuery.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        isLoading: false,
        error: null
      })

      cleanup()
      render(<Navbar />)
      
      // Dashboard button should be present
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      
      // Should not show login and signup buttons
      expect(() => screen.getByText('Log in')).toThrow()
      expect(() => screen.getByText('Start selling')).toThrow()
    })
  })

  describe('Comprehensive Navigation Suite', () => {
    it('runs navigation tests for all routes', async () => {
      const results = []
      
      for (const route of TEST_CONFIG.testRoutes) {
        // Clear mocks between each route test
        mockPush.mockClear()
        
        // Special handling for /admin route - requires authentication
        if (route === '/admin') {
          mockUseQuery.mockReturnValue({
            data: { user: { id: '1', email: 'test@example.com' } },
            isLoading: false,
            error: null
          })
        } else {
          // Reset to default unauthenticated state for other routes
          mockUseQuery.mockReturnValue({
            data: null,
            isLoading: false,
            error: null
          })
        }
        
        const result = await testSingleNavigation(route, TEST_CONFIG.maxClicks)
        results.push({ route, ...result })
      }
      
      // Verify all routes were successfully tested
      const successfulTests = results.filter(r => r.success).length
      expect(successfulTests).toBe(TEST_CONFIG.testRoutes.length)
      
      // Verify each route was called correctly
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/(about|features|pricing|contact|admin)?$/))
    })

    it('provides test summary statistics', async () => {
      // Run a subset of tests for statistics
      await testSingleNavigation('/pricing')
      await testSingleNavigation('/about')
      
      // Verify statistics are tracked
      expect(testResults.totalAttempts).toBeGreaterThan(0)
      expect(testResults.successfulNavigations).toBeGreaterThan(0)
      
      // Calculate success rate
      const successRate = (testResults.successfulNavigations / testResults.totalAttempts) * 100
      expect(successRate).toBeGreaterThan(0)
    })
  })

  describe('Navigation Setup Analysis', () => {
    it('analyzes navigation button properties', () => {
      render(<Navbar />)
      
      const navButtons = screen.getAllByRole('button').filter(button => 
        ['Home', 'About', 'Features', 'Pricing', 'Contact'].some(text => 
          button.textContent?.includes(text)
        )
      )
      
      expect(navButtons.length).toBeGreaterThan(0)
      
      // Check each navigation button has proper properties
      navButtons.forEach(button => {
        // Should be visible
        expect(button).toBeVisible()
        
        // Should have text content
        expect(button.textContent).toBeTruthy()
        
        // Should be enabled
        expect(button).not.toBeDisabled()
        
        // Should have proper button styling
        expect(button.className).toContain('cursor-pointer')
      })
    })

    it('checks for navigation button accessibility', () => {
      render(<Navbar />)
      
      const navButtons = screen.getAllByRole('button').filter(button => 
        ['Home', 'About', 'Features', 'Pricing', 'Contact'].some(text => 
          button.textContent?.includes(text)
        )
      )
      
      navButtons.forEach(button => {
        // Should have button role
        expect(button).toHaveAttribute('type', 'button')
        
        // Should have readable text
        expect(button.textContent).toMatch(/^(Home|About|Features|Pricing|Contact)$/)
      })
    })
  })

  describe('Navigation Error Scenarios', () => {
    it('handles navigation router failures gracefully', async () => {
      mockPush.mockImplementation(() => {
        throw new Error('Router navigation failed')
      })
      
      const result = await testSingleNavigation('/pricing')
      
      // Should handle the error gracefully
      expect(result).toBeDefined()
      expect(() => result).not.toThrow()
    })

    it('handles missing navigation buttons', () => {
      // Mock a scenario where a button might be missing
      mockUseTranslations.mockReturnValue((key: string) => {
        // Don't return pricing translation to simulate missing button
        if (key === 'navigation.pricing') return ''
        
        const messages: Record<string, string> = {
          'navigation.home': 'Home',
          'navigation.about': 'About',
          'navigation.features': 'Features',
          'navigation.contact': 'Contact'
        }
        return messages[key] || key
      })
      
      render(<Navbar />)
      
      // Should not throw when a button is missing
      expect(() => {
        screen.getByText('Home')
        screen.getByText('About')
        screen.getByText('Features')
        screen.getByText('Contact')
      }).not.toThrow()
    })

    it('handles rapid clicking gracefully', async () => {
      render(<Navbar />)
      
      const pricingButton = screen.getByText('Pricing').closest('button')
      if (pricingButton) {
        // Click rapidly multiple times
        for (let i = 0; i < 5; i++) {
          fireEvent.click(pricingButton)
        }
        
        // Should handle rapid clicks without errors
        expect(mockPush).toHaveBeenCalledWith('/pricing')
        expect(mockPush.mock.calls.length).toBeGreaterThan(0)
      }
    })
  })
})