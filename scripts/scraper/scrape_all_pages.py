#!/usr/bin/env python3
"""
Haiwo.tw 全站爬蟲
爬取所有頁面的結構
"""

import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup


PAGES_TO_SCRAPE = [
    {"url": "https://haiwo.tw/", "name": "home"},
    {"url": "https://haiwo.tw/aboutus", "name": "aboutus"},
    {"url": "https://haiwo.tw/insights", "name": "insights"},
    {"url": "https://haiwo.tw/contactus", "name": "contactus"},
    {"url": "https://haiwo.tw/ouroffices", "name": "ouroffices"},
    {"url": "https://haiwo.tw/privacy", "name": "privacy"},
    {"url": "https://haiwo.tw/terms", "name": "terms"},
]


async def scrape_page(page, url: str, name: str, output_dir: Path, screenshots_dir: Path):
    """爬取單一頁面"""
    print(f"\n{'='*50}")
    print(f"正在爬取: {name} ({url})")
    print(f"{'='*50}")

    try:
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # 滾動頁面
        await page.evaluate("""
            async () => {
                const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
                for (let i = 0; i < document.body.scrollHeight; i += 500) {
                    window.scrollTo(0, i);
                    await delay(100);
                }
                window.scrollTo(0, 0);
            }
        """)
        await page.wait_for_timeout(1000)

        # 截圖
        await page.screenshot(path=str(screenshots_dir / f"{name}.png"), full_page=True)
        print(f"  ✓ 截圖已儲存")

        # 取得 HTML
        html = await page.content()
        soup = BeautifulSoup(html, "lxml")

        # 提取頁面結構
        structure = await extract_page_structure(page, soup, name)

        # 儲存 HTML
        with open(output_dir / f"{name}.html", "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  ✓ HTML 已儲存")

        # 儲存結構
        with open(output_dir / f"{name}_structure.json", "w", encoding="utf-8") as f:
            json.dump(structure, f, ensure_ascii=False, indent=2)
        print(f"  ✓ 結構已儲存")

        return structure

    except Exception as e:
        print(f"  ✗ 錯誤: {e}")
        return None


async def extract_page_structure(page, soup, page_name):
    """提取頁面結構"""

    # 使用 JavaScript 提取詳細結構
    js_structure = await page.evaluate("""
        () => {
            const result = {
                title: document.title,
                sections: [],
                headings: [],
                images: [],
                buttons: [],
                forms: [],
                animations: []
            };

            // 提取所有區塊
            document.querySelectorAll('section, [id], .row, [class*="section"]').forEach((el, index) => {
                const rect = el.getBoundingClientRect();
                const styles = getComputedStyle(el);

                result.sections.push({
                    index,
                    tagName: el.tagName,
                    id: el.id || null,
                    className: el.className || null,
                    backgroundColor: styles.backgroundColor,
                    backgroundImage: styles.backgroundImage !== 'none' ? styles.backgroundImage : null,
                    height: rect.height,
                    hasBackgroundImage: el.querySelector('img[class*="bg"]') !== null,
                    childrenCount: el.children.length,
                    textPreview: el.innerText?.substring(0, 200) || ''
                });
            });

            // 提取所有標題
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
                result.headings.push({
                    level: h.tagName,
                    text: h.innerText,
                    className: h.className
                });
            });

            // 提取所有圖片
            document.querySelectorAll('img').forEach(img => {
                result.images.push({
                    src: img.src,
                    alt: img.alt,
                    className: img.className,
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            });

            // 提取所有按鈕和連結
            document.querySelectorAll('a, button').forEach(btn => {
                if (btn.innerText.trim()) {
                    result.buttons.push({
                        tagName: btn.tagName,
                        text: btn.innerText.trim(),
                        href: btn.href || null,
                        className: btn.className
                    });
                }
            });

            // 提取表單
            document.querySelectorAll('form').forEach(form => {
                const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
                    type: input.type || input.tagName.toLowerCase(),
                    name: input.name,
                    placeholder: input.placeholder
                }));
                result.forms.push({
                    id: form.id,
                    action: form.action,
                    method: form.method,
                    inputs
                });
            });

            // 檢查動畫類別
            document.querySelectorAll('[class*="animate"], [class*="fade"], [class*="slide"], [class*="transition"]').forEach(el => {
                result.animations.push({
                    className: el.className,
                    tagName: el.tagName
                });
            });

            return result;
        }
    """)

    # 提取 CSS 變數和顏色
    colors = await page.evaluate("""
        () => {
            const colors = new Set();
            const styles = document.styleSheets;

            // 從內聯樣式取得顏色
            document.querySelectorAll('*').forEach(el => {
                const style = getComputedStyle(el);
                ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                    const value = style[prop];
                    if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
                        colors.add(value);
                    }
                });
            });

            return Array.from(colors).slice(0, 50);
        }
    """)

    js_structure['colors'] = colors
    js_structure['page_name'] = page_name

    return js_structure


async def main():
    """主程式"""
    output_dir = Path(__file__).parent / "output" / "all_pages"
    screenshots_dir = Path(__file__).parent / "screenshots" / "all_pages"
    output_dir.mkdir(parents=True, exist_ok=True)
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    all_structures = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = await context.new_page()

        for page_info in PAGES_TO_SCRAPE:
            structure = await scrape_page(
                page,
                page_info["url"],
                page_info["name"],
                output_dir,
                screenshots_dir
            )
            if structure:
                all_structures[page_info["name"]] = structure

        await browser.close()

    # 儲存總覽
    with open(output_dir / "site_structure.json", "w", encoding="utf-8") as f:
        json.dump(all_structures, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print("爬取完成！")
    print(f"{'='*50}")
    print(f"輸出目錄: {output_dir}")
    print(f"截圖目錄: {screenshots_dir}")
    print(f"已爬取頁面: {len(all_structures)}")

    # 產生網站結構摘要
    summary = generate_site_summary(all_structures)
    with open(output_dir / "site_summary.md", "w", encoding="utf-8") as f:
        f.write(summary)
    print(f"\n網站結構摘要已儲存至: {output_dir / 'site_summary.md'}")


def generate_site_summary(structures: dict) -> str:
    """產生網站結構摘要"""
    md = "# Haiwo.tw 網站結構摘要\n\n"

    for page_name, structure in structures.items():
        md += f"## {page_name.upper()}\n\n"
        md += f"**標題:** {structure.get('title', 'N/A')}\n\n"

        # 區塊
        md += "### 區塊結構\n\n"
        for section in structure.get('sections', [])[:10]:
            section_id = section.get('id') or section.get('className', 'unnamed')
            md += f"- **{section_id}** (h={section.get('height', 0):.0f}px)\n"
            if section.get('textPreview'):
                preview = section['textPreview'][:100].replace('\n', ' ')
                md += f"  - 預覽: {preview}...\n"

        # 標題
        md += "\n### 標題\n\n"
        for heading in structure.get('headings', [])[:10]:
            md += f"- {heading['level']}: {heading['text'][:50]}\n"

        # 按鈕
        md += "\n### 主要按鈕/連結\n\n"
        seen = set()
        for btn in structure.get('buttons', [])[:15]:
            text = btn['text'][:30]
            if text not in seen:
                seen.add(text)
                md += f"- {text}\n"

        md += "\n---\n\n"

    return md


if __name__ == "__main__":
    asyncio.run(main())
