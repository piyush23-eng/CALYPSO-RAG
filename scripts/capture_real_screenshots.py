"""
Capture 100% authentic, pixel-accurate screenshots from the live CALYPSO-RAG application
using Playwright Headless Chromium at Retina 2x resolution.
"""

from playwright.sync_api import sync_playwright
import time
import os

OUTPUT_DIR = os.path.abspath("docs/assets")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=2
        )
        page = context.new_page()

        print("[1/5] Capturing Hero Query View...")
        page.goto("http://localhost:8000/", wait_until="networkidle")
        page.wait_for_selector("text=Ask GATE CS.", timeout=15000)
        time.sleep(2.0)
        hero_path = os.path.join(OUTPUT_DIR, "hero_query_view.png")
        page.screenshot(path=hero_path, full_page=False)
        print(f"  -> Saved: {hero_path}")

        print("[2/5] Triggering Question & Capturing Answer Derivation View...")
        preset_btn = page.locator("button:has-text('OS: 2-Level Paging')").first
        preset_btn.click()
        
        print("  Waiting for LLM derivation & citations...")
        page.wait_for_selector(".answer-markdown", timeout=35000)
        time.sleep(3.0)

        # Scroll to show the answer section with Voice Player and badges
        page.evaluate("window.scrollTo(0, 520)")
        time.sleep(1.5)
        answer_path = os.path.join(OUTPUT_DIR, "answer_trace_view.png")
        page.screenshot(path=answer_path, full_page=False)
        print(f"  -> Saved: {answer_path}")

        print("[3/5] Opening Simulation Sliders & Capturing Visual Simulation Lab...")
        sim_btn = page.locator("button:has-text('Simulator')").first
        if sim_btn.count() > 0:
            sim_btn.click()
            time.sleep(2.0)

        # Scroll to focus right on the parameter playground
        page.evaluate("window.scrollTo(0, 950)")
        time.sleep(1.5)
        sim_path = os.path.join(OUTPUT_DIR, "visual_simulation_lab_view.png")
        page.screenshot(path=sim_path, full_page=False)
        print(f"  -> Saved: {sim_path}")

        print("[4/5] Navigating to Mock Exam & Capturing GATE CS Practice Exam (/quiz)...")
        quiz_nav = page.locator("button:has-text('Mock Exam')").first
        quiz_nav.click()
        page.wait_for_selector("text=Q1 OF", timeout=20000)
        time.sleep(2.0)

        # Select option B on Question 1
        b_opt = page.locator("button:has-text('B)')").first
        if b_opt.count() > 0:
            b_opt.click()
        time.sleep(1.5)

        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1.0)
        quiz_path = os.path.join(OUTPUT_DIR, "quiz_mock_exam_view.png")
        page.screenshot(path=quiz_path, full_page=False)
        print(f"  -> Saved: {quiz_path}")

        print("[5/5] Navigating to Evaluation Dashboard & Capturing RAGAS Audit (/evaluation)...")
        eval_nav = page.locator("button:has-text('The Numbers')").first
        eval_nav.click()
        page.wait_for_selector("text=The Numbers.", timeout=15000)
        time.sleep(2.5)

        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1.0)
        eval_path = os.path.join(OUTPUT_DIR, "evaluation_dashboard.png")
        page.screenshot(path=eval_path, full_page=False)
        print(f"  -> Saved: {eval_path}")

        browser.close()
        print("\nAll 5 authentic, 100% pixel-accurate real screenshots captured successfully!")


if __name__ == "__main__":
    capture()
