#!/usr/bin/env python3
"""
Captures real pixel-perfect screenshots of CALYPSO-RAG React UI from live browser execution.
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture():
    output_dir = Path("docs/assets")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
            color_scheme="dark"
        )
        page = context.new_page()
        
        print("🌐 Navigating to http://localhost:8000...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        time.sleep(2)
        
        # 1. Capture Hero View
        hero_png = output_dir / "hero_query_view.png"
        page.screenshot(path=str(hero_png), full_page=False)
        print(f"✅ Saved real Hero screenshot to {hero_png}")
        
        # 2. Submit query directly via input and wait for /api/query network response
        print("⚡ Submitting GATE CS Query via Input...")
        input_el = page.locator("input").first
        input_el.fill("How is Effective Memory Access Time calculated in 2-level paging with TLB hit ratio?")
        
        with page.expect_response("**/api/query", timeout=30000) as response_info:
            input_el.press("Enter")
            
        print("⏳ Received /api/query response! Waiting for KaTeX rendering...")
        time.sleep(3)
        
        # Expand Retrieval Trace Accordion
        trace_button = page.locator("button:has-text('Retrieval Trace')").first
        if trace_button.is_visible():
            trace_button.click()
            time.sleep(1)
            
        # Scroll to position answer, formulas, and receipts
        page.evaluate("window.scrollTo(0, 420)")
        time.sleep(1)
        
        answer_png = output_dir / "answer_trace_view.png"
        page.screenshot(path=str(answer_png), full_page=False)
        print(f"✅ Saved real Answer screenshot to {answer_png}")
        
        # 3. Capture Evaluation View
        print("📊 Navigating to /evaluation...")
        eval_button = page.locator("button:has-text('Evaluation'), button:has-text('/evaluation')").first
        if eval_button.is_visible():
            eval_button.click()
        else:
            page.goto("http://localhost:8000/evaluation", wait_until="networkidle")
            
        time.sleep(2)
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)
        
        eval_png = output_dir / "evaluation_dashboard.png"
        page.screenshot(path=str(eval_png), full_page=False)
        print(f"✅ Saved real Evaluation Dashboard screenshot to {eval_png}")
        
        browser.close()
        print("\n🎉 ALL 3 AUTHENTIC BROWSER SCREENSHOTS CAPTURED PERFECTLY!")

if __name__ == "__main__":
    capture()
