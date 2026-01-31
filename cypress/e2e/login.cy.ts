/// <reference types="cypress" />

describe('Login E2E (real)', () => {
  // CONFIGURACIÓN DE CREDENCIALES
  // Asegúrate de que este usuario exista en tu Base de Datos real
  const validEmail = Cypress.env('USER_EMAIL') || 'eren@gmail.com'
  const validPassword = Cypress.env('USER_PASS') || '123456'

  beforeEach(() => {
    // Visitamos la página de login antes de cada prueba
    cy.visit('http://localhost:4200/login')
  })

  // --- FUNCIONES DE AYUDA (LOGOUT COMO LO PEDISTE) ---

  // 1. Abrir menú del avatar
  function openUserMenu() {
    cy.document().then((doc) => {
      if (doc.querySelector('[data-cy=menu-ac]')) {
        cy.get('[data-cy=menu-ac]').should('be.visible').click({ force: true })
      } else {
        // Busca botón por texto "AC" o el primer botón de imagen si no tiene texto
        cy.contains('button', /^AC$/).click({ force: true }) 
      }
    })
  }

  // 2. Ir a la sección "Cuenta" (Paso intermedio que pediste)
  function goToCuenta() {
    cy.document().then((doc) => {
      if (doc.querySelector('[data-cy=menu-cuenta]')) {
        cy.get('[data-cy=menu-cuenta]').should('be.visible').click({ force: true })
      } else {
        cy.contains(/Cuenta/i).should('be.visible').click({ force: true })
      }
    })
  }

  // 3. Hacer clic en Salir
  function clickLogout() {
    cy.document().then((doc) => {
      if (doc.querySelector('[data-cy=logout]')) {
        cy.get('[data-cy=logout]').should('be.visible').click({ force: true })
      } else {
        cy.contains(/Cerrar Sesión|Cerrar sesión|Logout|Salir/i).should('be.visible').click({ force: true })
      }
    })
  }

  // --- TESTS ---

  it('permite loguearse y luego cerrar sesión a través del menú lateral', () => {
    // 1. Espiamos la petición para esperar al backend
    cy.intercept('POST', '**/api/usuarios/login').as('loginRequest')

    // 2. Login (Usando force:true para evitar errores visuales)
    cy.get('input[name="email"], input[placeholder="Email"]', { timeout: 10000 })
      .clear({ force: true })
      .type(validEmail, { force: true })

    cy.get('input[name="password"], input[placeholder="Contraseña"], input[name="pwd"]', { timeout: 10000 })
      .clear({ force: true })
      .type(validPassword, { force: true })

    cy.contains(/Ingresar|Iniciar Sesión|Log in/i).click()

    // 3. Esperar confirmación del backend (200 OK)
    cy.wait('@loginRequest', { timeout: 20000 }).its('response.statusCode').should('eq', 200)

    // 4. Verificar que entró al sistema
    cy.url({ timeout: 10000 }).should('not.include', '/login')
    
    // 5. EJECUTAR EL FLUJO DE LOGOUT COMPLETO
    cy.wait(1000); // Pequeña espera visual para estabilidad
    openUserMenu()
    cy.wait(500);
    goToCuenta()
    cy.wait(500);
    clickLogout()

    // 6. Verificar que salió (Vuelta al login o borrado de token)
    cy.url({ timeout: 10000 }).should((url) => {
      expect(url).to.satisfy((u: any) => u.includes('/login') || u.includes('/home'))
    })

    // Verificar que el token ya no existe en localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('authToken') || 
                    win.localStorage.getItem('accessToken') || 
                    win.localStorage.getItem('token');
      expect(token).to.be.oneOf([null, undefined])
    })
  })

  it('muestra error con credenciales inválidas', () => {
    cy.intercept('POST', '**/api/usuarios/login').as('badLogin')

    cy.get('input[name="email"], input[placeholder="Email"]')
      .clear({ force: true })
      .type('wrong@gmail.com', { force: true })

    cy.get('input[name="password"], input[placeholder="Contraseña"]')
      .clear({ force: true })
      .type('wrongpass', { force: true })

    cy.contains(/Ingresar|Iniciar Sesión|Log in/i).click()

    cy.wait('@badLogin', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [400, 401, 404])
    cy.url().should('include', '/login')
  })

})