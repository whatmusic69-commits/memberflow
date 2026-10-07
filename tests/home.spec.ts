import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { content } from '../src/content';
for (const locale of ['en','lv','ru'] as const) {
 test(`${locale}: responsive layout, connections and accessibility`, async ({page}) => {
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1920,1440,1280,1024,768,390]){
   await page.setViewportSize({width,height:1000});await page.goto(`/${locale}`);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('h1')).toContainText(content[locale].hero[0]);await expect(page.locator('html')).toHaveAttribute('lang',locale);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
   if(width>=1024){const geometry=await page.evaluate(()=>{const svg=document.querySelector('.hero-connectors')!.getBoundingClientRect();const card=document.querySelector('.hero-campaign')!.getBoundingClientRect();const nodes=[...document.querySelectorAll('.channel-node')].map(n=>n.getBoundingClientRect());return {cardEnd:card.right,svgStart:svg.left+svg.width*290/600,nodeStarts:nodes.map(n=>n.left),busEnd:svg.left+svg.width*400/600,nodeCenters:nodes.map(n=>(n.top+n.bottom)/2),ys:[68,159,250,342].map(y=>svg.top+svg.height*y/410)};});expect(Math.abs(geometry.cardEnd-geometry.svgStart)).toBeLessThan(1);geometry.nodeStarts.forEach(x=>expect(Math.abs(x-geometry.busEnd)).toBeLessThan(1));geometry.nodeCenters.forEach((y,i)=>expect(Math.abs(y-geometry.ys[i])).toBeLessThan(2));}
   await page.screenshot({path:`test-results/${locale}-${width}.png`,fullPage:true});
  }
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(accessibility.violations).toEqual([]);expect(errors).toEqual([]);
 });
}
test('navigation, language, mobile menu, dialog and retention tabs',async({page})=>{
 await page.goto('/');await expect(page).toHaveURL(/\/en$/);
 await page.getByRole('group').filter({has:page.locator('summary')}).count();
 await page.locator('.language-switcher summary').click();await page.locator('.language-options a[lang="lv"]').click();await expect(page).toHaveURL(/\/lv$/);
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:content.lv.menu,exact:true}).click();await expect(page.locator('#mobile-navigation')).toBeVisible();await page.locator('#mobile-navigation').getByRole('link',{name:content.lv.nav[0],exact:true}).click();await expect(page.locator('#mobile-navigation')).toHaveCount(0);await expect(page).toHaveURL(/#product$/);
 await page.locator('.hero-ctas').getByRole('button').click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.getByRole('tab',{name:content.lv.retention[1],exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Coffee Club');await page.getByRole('tab',{name:content.lv.retention[1],exact:true}).press('ArrowRight');await expect(page.getByRole('tabpanel')).toContainText('Pumpkin Latte');
 await page.goto('/en');await page.locator('.language-switcher summary').click();await page.locator('.language-options a[lang="ru"]').click();await expect(page).toHaveURL(/\/ru$/);
});
