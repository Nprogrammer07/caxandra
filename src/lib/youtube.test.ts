import { describe, it, expect } from 'vitest'
import { extractYouTubeId } from './youtube'

describe('extractYouTubeId', () => {
  it('acepta un ID directo de 11 caracteres', () => {
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('extrae el ID de una URL watch?v=', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('extrae el ID de un enlace youtu.be', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('extrae el ID de un enlace /embed/', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('extrae el ID de un Short', () => {
    expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('ignora parámetros extra (&t=30s)', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ')
  })
  it('devuelve null para basura', () => {
    expect(extractYouTubeId('no es un video')).toBeNull()
    expect(extractYouTubeId('https://example.com/foo')).toBeNull()
  })
})