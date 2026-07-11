import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

// The cn() helper merges class names with clsx and de-duplicates conflicting
// Tailwind utilities with tailwind-merge. It is used across every UI component,
// so its behaviour is core to how the app renders.
describe('cn (class name helper)', () => {
  it('joins multiple class strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('applies conditional object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })

  it('flattens arrays of classes', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })

  it('resolves conflicting tailwind utilities keeping the last one', () => {
    // tailwind-merge should collapse px-2 + px-4 down to px-4.
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('returns an empty string when given nothing', () => {
    expect(cn()).toBe('')
  })
})
