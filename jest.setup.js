import '@testing-library/jest-dom'

// Set environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'PPP') return 'January 1st, 2024'
    if (formatStr === 'p') return '12:00 AM'
    return '2024-01-01'
  }),
  isToday: jest.fn(() => false),
  isTomorrow: jest.fn(() => false),
  isYesterday: jest.fn(() => false),
  isPast: jest.fn(() => false),
  isFuture: jest.fn(() => true),
  parseISO: jest.fn((dateStr) => new Date(dateStr)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999))
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
}))

// Mock UI components that cause parsing issues
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ children, ...props }) => <input type="checkbox" {...props}>{children}</input>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} />
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props) => <textarea {...props} />
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectValue: ({ children, ...props }) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  DialogDescription: ({ children, ...props }) => <p {...props}>{children}</p>,
  DialogTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogClose: ({ children, ...props }) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children, ...props }) => <div {...props}>{children}</div>,
  PopoverContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  PopoverTrigger: ({ children, ...props }) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/calendar', () => ({
  Calendar: (props) => <div {...props}>Calendar</div>
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuItem: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuSeparator: (props) => <hr {...props} />,
  DropdownMenuLabel: ({ children, ...props }) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/progress', () => ({
  Progress: (props) => <div {...props}>Progress</div>
}))

jest.mock('@/components/keph/edit-task-form', () => ({
  EditTaskForm: ({ task, onSave, onCancel, ...props }) => (
    <div {...props}>
      <h3>Edit Task Form</h3>
      <button onClick={() => onSave && onSave(task)}>Save</button>
      <button onClick={() => onCancel && onCancel()}>Cancel</button>
    </div>
  )
}))

jest.mock('@/lib/recurring-tasks', () => ({
  formatRecurrenceDisplay: jest.fn(() => 'Daily')
}))

// Global test timeout
jest.setTimeout(10000)