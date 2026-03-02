#!/usr/bin/env python3
"""
Haiwo.tw Website Scraper
使用 Playwright 等待 JavaScript 渲染完成後爬取網站內容
"""

import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup


async def scrape_haiwo():
    """爬取 haiwo.tw 網站的完整結構"""

    async with async_playwright() as p:
        # 啟動瀏覽器
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = await context.new_page()

        print("正在載入 haiwo.tw...")
        await page.goto("https://haiwo.tw/", wait_until="networkidle")

        # 等待頁面完全渲染
        await page.wait_for_timeout(3000)

        # 滾動頁面以觸發 lazy loading
        await page.evaluate("""
            async () => {
                const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
                for (let i = 0; i < document.body.scrollHeight; i += 500) {
                    window.scrollTo(0, i);
                    await delay(200);
                }
                window.scrollTo(0, 0);
            }
        """)

        await page.wait_for_timeout(2000)

        # 截圖
        screenshots_dir = Path(__file__).parent / "screenshots"
        screenshots_dir.mkdir(exist_ok=True)

        await page.screenshot(path=str(screenshots_dir / "haiwo_full.png"), full_page=True)
        print(f"截圖已儲存至 {screenshots_dir / 'haiwo_full.png'}")

        # 取得完整 HTML
        html_content = await page.content()

        # 解析 HTML
        soup = BeautifulSoup(html_content, "lxml")

        # 提取結構化資料
        data = {
            "meta": extract_meta(soup),
            "navigation": extract_navigation(soup),
            "sections": extract_sections(soup, page),
            "footer": extract_footer(soup),
            "styles": extract_styles(soup),
        }

        # 提取所有文字內容
        all_text = []
        for element in soup.find_all(["h1", "h2", "h3", "h4", "p", "span", "a", "li"]):
            text = element.get_text(strip=True)
            if text and len(text) > 1:
                all_text.append({
                    "tag": element.name,
                    "text": text,
                    "class": element.get("class", [])
                })

        data["all_text"] = all_text

        # 提取所有圖片
        images = []
        for img in soup.find_all("img"):
            images.append({
                "src": img.get("src", ""),
                "alt": img.get("alt", ""),
                "class": img.get("class", [])
            })
        data["images"] = images

        # 提取所有連結
        links = []
        for a in soup.find_all("a"):
            links.append({
                "href": a.get("href", ""),
                "text": a.get_text(strip=True),
                "class": a.get("class", [])
            })
        data["links"] = links

        # 儲存原始 HTML
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)

        with open(output_dir / "haiwo_raw.html", "w", encoding="utf-8") as f:
            f.write(html_content)

        # 儲存結構化資料
        with open(output_dir / "haiwo_structure.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"HTML 已儲存至 {output_dir / 'haiwo_raw.html'}")
        print(f"結構化資料已儲存至 {output_dir / 'haiwo_structure.json'}")

        # 提取 CSS 樣式
        styles = await page.evaluate("""
            () => {
                const styles = [];
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            styles.push(rule.cssText);
                        }
                    } catch (e) {
                        // 跨域樣式表無法讀取
                    }
                }
                return styles;
            }
        """)

        with open(output_dir / "haiwo_styles.css", "w", encoding="utf-8") as f:
            f.write("\n".join(styles))

        print(f"CSS 已儲存至 {output_dir / 'haiwo_styles.css'}")

        # 額外提取各個區塊的詳細資訊
        sections_detail = await extract_sections_detail(page)
        with open(output_dir / "haiwo_sections.json", "w", encoding="utf-8") as f:
            json.dump(sections_detail, f, ensure_ascii=False, indent=2)

        print(f"區塊詳情已儲存至 {output_dir / 'haiwo_sections.json'}")

        await browser.close()

        return data


def extract_meta(soup):
    """提取 meta 資訊"""
    meta = {}

    title = soup.find("title")
    meta["title"] = title.get_text(strip=True) if title else ""

    for tag in soup.find_all("meta"):
        name = tag.get("name") or tag.get("property", "")
        content = tag.get("content", "")
        if name and content:
            meta[name] = content

    return meta


def extract_navigation(soup):
    """提取導航結構"""
    nav_items = []

    # 尋找 nav 或 header 中的連結
    nav = soup.find("nav") or soup.find("header")
    if nav:
        for a in nav.find_all("a"):
            nav_items.append({
                "text": a.get_text(strip=True),
                "href": a.get("href", ""),
            })

    return nav_items


def extract_sections(soup, page):
    """提取頁面區塊"""
    sections = []

    # 尋找所有 section 元素
    for section in soup.find_all(["section", "div"]):
        section_id = section.get("id", "")
        section_class = " ".join(section.get("class", []))

        if section_id or "section" in section_class.lower():
            sections.append({
                "id": section_id,
                "class": section_class,
                "text_preview": section.get_text(strip=True)[:200] if section.get_text(strip=True) else ""
            })

    return sections


def extract_footer(soup):
    """提取 footer 資訊"""
    footer = soup.find("footer")
    if not footer:
        return {}

    return {
        "text": footer.get_text(strip=True),
        "links": [
            {"text": a.get_text(strip=True), "href": a.get("href", "")}
            for a in footer.find_all("a")
        ]
    }


def extract_styles(soup):
    """提取內聯樣式和樣式連結"""
    styles = {
        "inline": [],
        "external": []
    }

    for style in soup.find_all("style"):
        styles["inline"].append(style.get_text())

    for link in soup.find_all("link", rel="stylesheet"):
        styles["external"].append(link.get("href", ""))

    return styles


async def extract_sections_detail(page):
    """使用 JavaScript 提取更詳細的區塊資訊"""
    return await page.evaluate("""
        () => {
            const sections = [];

            // Hero Section
            const heroH1 = document.querySelector('h1');
            if (heroH1) {
                sections.push({
                    type: 'hero',
                    title: heroH1.innerText,
                    subtitle: heroH1.nextElementSibling?.innerText || ''
                });
            }

            // 取得所有主要區塊
            document.querySelectorAll('section, [class*="section"]').forEach((section, index) => {
                const heading = section.querySelector('h1, h2, h3');
                const paragraphs = Array.from(section.querySelectorAll('p')).map(p => p.innerText);
                const buttons = Array.from(section.querySelectorAll('a, button')).map(btn => ({
                    text: btn.innerText,
                    href: btn.href || ''
                }));

                sections.push({
                    index,
                    id: section.id || '',
                    className: section.className || '',
                    heading: heading?.innerText || '',
                    paragraphs: paragraphs.slice(0, 5),
                    buttons: buttons.slice(0, 5),
                    backgroundColor: getComputedStyle(section).backgroundColor,
                    rect: section.getBoundingClientRect()
                });
            });

            return sections;
        }
    """)


if __name__ == "__main__":
    asyncio.run(scrape_haiwo())
