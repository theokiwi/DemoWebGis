import { test, expect } from '@playwright/test';
test('explora mapa, tabela e filtros', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/Onde o acesso/})).toBeVisible();
  await page.getByRole('button',{name:'Analisar'}).first().click();
  await expect(page.getByRole('heading',{name:/Setor/})).toBeVisible();
  await page.getByLabel('Oferta total').check();
  await expect(page.getByRole('status')).toContainText('estabelecimentos');
});

test('categoria atualiza pontos e pontuação do setor', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Analisar'}).first().click();
  const before=await page.locator('.sector-reading').textContent();
  await page.getByLabel('Categoria').selectOption('Hospital');
  await expect(page.getByRole('status')).toContainText('1 estabelecimentos');
  await expect(page.getByRole('heading',{name:/Estabelecimentos no recorte/})).toContainText('1');
  await expect.poll(async()=>page.locator('.sector-reading').textContent()).not.toBe(before);
});
