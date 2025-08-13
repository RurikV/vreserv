import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'

import { LanguageSelector } from '@/components/language-selector'
import { Navbar } from '@/modules/home/ui/components/navbar'

// Language test configuration
const LANGUAGE_TESTS = {
  en: { flag: "🇺🇸", name: "English", expectedText: "Home" },
  ru: { flag: "🇷🇺", name: "Русский", expectedText: "Главная" },
  fr: { flag: "🇫🇷", name: "Français", expectedText: "Accueil" },
  it: { flag: "🇮🇹", name: "Italiano", expectedText: "Home" },
  et: { flag: "🇪🇪", name: "Eesti", expectedText: "Kodu" }
} as const


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

// Mock Google Fonts
vi.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'mocked-poppins'
  })
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

// Mock Radix UI dropdown components to work properly in tests
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'dropdown-menu' }, children)
  },
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    // For asChild, return the children directly (the Button component)
    return asChild ? children : React.createElement('div', { 'data-testid': 'dropdown-trigger' }, children)
  },
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => {
    // Always render content in tests so elements can be found
    return React.createElement('div', { 
      'data-testid': 'dropdown-content', 
      role: 'menu'
    }, children)
  },
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => {
    return React.createElement('div', { 
      'data-testid': 'dropdown-item', 
      role: 'menuitem',
      onClick 
    }, children)
  }
}))

describe('Language Switching Tests', () => {
  const mockPush = vi.fn()
  const mockPathname = vi.fn()

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUsePathname.mockReturnValue(mockPathname)
    mockUseLocale.mockReturnValue('en')
    
    // Setup translation mock with default English messages
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
    
    // Mock pathname to simulate next-intl's actual behavior more realistically
    // Test both function and string return scenarios to match real implementation
    mockPathname.mockReturnValue('/') // Default to string behavior (current path)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('LanguageSelector Component', () => {
    it('renders language selector with current locale', () => {
      render(<LanguageSelector />)
      
      // Should show the Globe icon and English flag/name in button
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('English')
      expect(button).toHaveTextContent('🇺🇸')
    })

    it('opens dropdown menu when clicked', async () => {
      render(<LanguageSelector />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      // Should show all language options
      await waitFor(() => {
        expect(screen.getByText('Русский')).toBeInTheDocument()
        expect(screen.getByText('Français')).toBeInTheDocument()
        expect(screen.getByText('Italiano')).toBeInTheDocument()
        expect(screen.getByText('Eesti')).toBeInTheDocument()
      })
    })

    it('switches to Russian when Russian option is clicked', async () => {
      render(<LanguageSelector />)
      
      // Open dropdown
      fireEvent.click(screen.getByRole('button'))
      
      // Click Russian option
      await waitFor(() => screen.getByText('Русский'))
      fireEvent.click(screen.getByText('Русский'))
      
      // The pathname mock returns a function, so component takes the function path
      // It calls pathname({ locale: 'ru' }) which returns '/' and then router.push('/')
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('switches to French when French option is clicked', async () => {
      render(<LanguageSelector />)
      
      // Open dropdown
      fireEvent.click(screen.getByRole('button'))
      
      // Click French option
      await waitFor(() => screen.getByText('Français'))
      fireEvent.click(screen.getByText('Français'))
      
      // Same behavior: pathname function returns '/', then router.push('/')
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('handles all supported languages', async () => {
      for (const [code, config] of Object.entries(LANGUAGE_TESTS)) {
        if (code === 'en') continue // Skip default language
        
        const { unmount } = render(<LanguageSelector />)
        
        // Open dropdown - get the first button since there may be multiple from cleanup
        const buttons = screen.getAllByRole('button')
        fireEvent.click(buttons[0])
        
        // Click language option
        await waitFor(() => screen.getByText(config.name))
        fireEvent.click(screen.getByText(config.name))
        
        // Should call router with single argument (pathname function returns '/')
        expect(mockPush).toHaveBeenCalledWith('/')
        
        // Clean up for next iteration
        mockPush.mockClear()
        unmount()
      }
    })

    it('handles pathname as function (next-intl createNavigation behavior)', async () => {
      // Mock pathname to be a function that generates localized paths
      const mockPathnameFunction = vi.fn()
      mockPathnameFunction.mockReturnValue('/about/ru/')
      mockUsePathname.mockReturnValue(mockPathnameFunction)
      
      render(<LanguageSelector />)
      
      // Open dropdown and click Russian
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => screen.getByText('Русский'))
      fireEvent.click(screen.getByText('Русский'))
      
      // Should call the pathname function with the new locale
      expect(mockPathnameFunction).toHaveBeenCalledWith({ locale: 'ru' })
      // Should call router.push with the generated path
      expect(mockPush).toHaveBeenCalledWith('/about/ru/')
    })

    it('handles pathname as string (current path behavior)', async () => {
      // Mock pathname to be a string (current path)
      mockUsePathname.mockReturnValue('/about')
      
      render(<LanguageSelector />)
      
      // Open dropdown and click Russian
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => screen.getByText('Русский'))
      fireEvent.click(screen.getByText('Русский'))
      
      // Should call router.push with current path and locale option
      expect(mockPush).toHaveBeenCalledWith('/about', { locale: 'ru' })
    })
  })

  describe('Navbar Language Integration', () => {
    it('displays correct navigation text for English locale', () => {
      mockUseLocale.mockReturnValue('en')
      mockUseTranslations.mockReturnValue((key: string) => {
        const englishMessages: Record<string, string> = {
          'navigation.home': 'Home',
          'navigation.about': 'About',
          'navigation.features': 'Features',
          'navigation.pricing': 'Pricing',
          'navigation.contact': 'Contact'
        }
        return englishMessages[key] || key
      })
      
      render(<Navbar />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('displays correct navigation text for Russian locale', () => {
      mockUseLocale.mockReturnValue('ru')
      mockUseTranslations.mockReturnValue((key: string) => {
        const russianMessages: Record<string, string> = {
          'navigation.home': 'Главная',
          'navigation.about': 'О нас',
          'navigation.features': 'Возможности',
          'navigation.pricing': 'Цены',
          'navigation.contact': 'Контакты'
        }
        return russianMessages[key] || key
      })
      
      render(<Navbar />)
      
      expect(screen.getByText('Главная')).toBeInTheDocument()
      expect(screen.getByText('О нас')).toBeInTheDocument()
      expect(screen.getByText('Возможности')).toBeInTheDocument()
      expect(screen.getByText('Цены')).toBeInTheDocument()
      expect(screen.getByText('Контакты')).toBeInTheDocument()
    })

    it('includes language selector in navbar', () => {
      render(<Navbar />)
      
      // Should have a button with Globe icon (LanguageSelector)
      const languageButton = screen.getByRole('button', { name: /english/i })
      expect(languageButton).toBeInTheDocument()
    })
  })

  describe('Language Switching Flow', () => {
    it('changes navigation text when language is switched', async () => {
      let currentLocale = 'en'
      
      // Mock dynamic locale changes
      mockUseLocale.mockImplementation(() => currentLocale)
      mockUseTranslations.mockImplementation(() => (key: string) => {
        const messages = {
          en: {
            'navigation.home': 'Home',
            'navigation.about': 'About'
          },
          ru: {
            'navigation.home': 'Главная', 
            'navigation.about': 'О нас'
          }
        }
        return messages[currentLocale as keyof typeof messages]?.[key] || key
      })
      
      const { rerender } = render(<Navbar />)
      
      // Initially shows English
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      
      // Simulate locale change to Russian
      currentLocale = 'ru'
      rerender(<Navbar />)
      
      // Should now show Russian text
      expect(screen.getByText('Главная')).toBeInTheDocument()
      expect(screen.getByText('О нас')).toBeInTheDocument()
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
      expect(screen.queryByText('About')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing language options gracefully', async () => {
      // Mock console.error to suppress expected error logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<LanguageSelector />)
      
      // Open dropdown
      fireEvent.click(screen.getByRole('button'))
      
      // Try to click a non-existent element (should not throw)
      const dropdown = screen.getByRole('button')
      expect(() => dropdown.click()).not.toThrow()
      
      consoleSpy.mockRestore()
    })

    it('maintains functionality when router push fails', async () => {
      mockPush.mockRejectedValue(new Error('Navigation failed'))
      
      render(<LanguageSelector />)
      
      // Open dropdown and click language option
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => screen.getByText('Русский'))
      
      // Should not throw even if navigation fails
      expect(() => fireEvent.click(screen.getByText('Русский'))).not.toThrow()
    })
  })
})