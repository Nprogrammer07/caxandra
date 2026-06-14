import { test, expect } from '@playwright/test'

// 1) La home carga y, sin sesión, ofrece registrarse.
test('la home carga y muestra el botón de registro', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Registrarme' })).toBeVisible()
})

// 2) El enlace de iniciar sesión lleva a la página de login.
test('navegar a iniciar sesión', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Iniciar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
})

// 3) La página de registro existe y muestra su título.
test('la página de registro carga', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()
})

// 4) Comprar un PLAN sin sesión debe pedir iniciar sesión.
test('comprar un plan sin sesión pide iniciar sesión', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comprar con Crypto/i }).first().click()
  await expect(page.getByText('Debes iniciar sesión para comprar un plan.')).toBeVisible()
})

// 5) Comprar un SERVICIO sin sesión debe pedir iniciar sesión.
test('comprar un servicio sin sesión pide iniciar sesión', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Explorar módulo/i }).click()
  await expect(page.getByText('Debes iniciar sesión para comprar este servicio.')).toBeVisible()
})