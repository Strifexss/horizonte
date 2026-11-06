/**
 * Login pronto para a verificação visual com Playwright.
 *
 * Uso num script:
 *   const { chromium } = require('playwright');
 *   const { contextoLogado, BASE_URL } = require('./tests/visual/login.cjs');
 *   const browser = await chromium.launch();
 *   const context = await contextoLogado(browser, { viewport: { width: 390, height: 844 } });
 *   const page = await context.newPage();
 *   await page.goto(`${BASE_URL}/produtos`);
 *
 * Entra uma vez com o usuário do VerificacaoVisualSeeder e guarda a sessão em
 * storage/app/playwright-auth.json (ignorado pelo git); as próximas chamadas reaproveitam.
 * Rodar direto (`node tests/visual/login.cjs`) só renova a sessão salva.
 */
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const EMAIL = 'visual@horizonte.test';
const SENHA = 'senha-visual';
const ESTADO = path.join(__dirname, '..', '..', 'storage', 'app', 'playwright-auth.json');

async function entrar(browser) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', EMAIL);
    await page.fill('#password', SENHA);
    await page.click('button[type=submit]');
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 });
    await context.storageState({ path: ESTADO });
    await context.close();
}

async function sessaoValida(browser) {
    if (!fs.existsSync(ESTADO)) {
        return false;
    }
    const context = await browser.newContext({ storageState: ESTADO });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/inicio`);
    const valida = !new URL(page.url()).pathname.startsWith('/login');
    await context.close();

    return valida;
}

/**
 * Contexto do navegador já autenticado. Aceita as opções de browser.newContext (viewport etc.).
 * deviceScaleFactor padrão 2, para prints que uma pessoa vai ver.
 */
async function contextoLogado(browser, opcoes = {}) {
    if (!(await sessaoValida(browser))) {
        await entrar(browser);
    }

    return browser.newContext({ deviceScaleFactor: 2, ...opcoes, storageState: ESTADO });
}

module.exports = { BASE_URL, contextoLogado };

if (require.main === module) {
    const { chromium } = require('playwright');
    (async () => {
        const browser = await chromium.launch();
        await entrar(browser);
        await browser.close();
        console.log(`Sessão salva em ${ESTADO}`);
    })().catch((erro) => {
        console.error(erro.message);
        process.exit(1);
    });
}
