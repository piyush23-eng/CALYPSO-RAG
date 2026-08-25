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
        # Create high-DPI context for retina-crisp screenshots
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=2
        )
        page = context.new_page()

        print("[1/5] Capturing Hero Query View...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        time.sleep(2.0)
        hero_path = os.path.join(OUTPUT_DIR, "hero_query_view.png")
        page.screenshot(path=hero_path, full_page=False)
        print(f"  -> Saved: {hero_path}")

        print("[2/5] Clicking Preset Query and capturing Answer & Simulation View...")
        preset_btn = page.locator("button:has-text('OS: 2-Level Paging')").first
        if preset_btn.count() > 0:
            preset_btn.click()
        else:
            page.locator("button[type='submit']").click()

        # Wait for the answer section to appear
        print("  Waiting for answer derivation...")
        page.wait_for_selector(".answer-markdown", timeout=30000)
        time.sleep(3.0)

        # Open the simulation lab
        sim_btn = page.locator("button:has-text('Simulator')").first
        if sim_btn.count() > 0:
            sim_btn.click()
            time.sleep(2.0)

        # Scroll to display the full answer card with voice player and simulation sliders
        page.evaluate("window.scrollTo(0, 320)")
        time.sleep(1.5)
        answer_path = os.path.join(OUTPUT_DIR, "answer_trace_view.png")
        page.screenshot(path=answer_path, full_page=False)
        print(f"  -> Saved: {answer_path}")

        print("[3/5] Capturing Universal Visual Simulation Lab...")
        # Scroll down directly to the parameter playground
        page.evaluate("window.scrollTo(0, 780)")
        time.sleep(1.5)
        sim_path = os.path.join(OUTPUT_DIR, "visual_simulation_lab_view.png")
        page.screenshot(path=sim_path, full_page=False)
        print(f"  -> Saved: {sim_path}")

        print("[4/5] Capturing GATE CS Mock Exam View (/quiz)...")
        page.goto("http://localhost:8000/quiz", wait_until="networkidle")
        time.sleep(2.0)
        # Select an option on Question 1
        option_btns = page.locator("button[type='button']")
        for i in range(option_btns.count()):
            btn_text = option_btns.nth(i).inner_text()
            if "B)" in btn_text or "140 ns" in btn_text or "142 ns" in btn_text or "C)" in btn_text:
                option_btns.nth(i).click()
                break
        time.sleep(1.0)
        quiz_path = os.path.join(OUTPUT_DIR, "quiz_mock_exam_view.png")
        page.screenshot(path=quiz_path, full_page=False)
        print(f"  -> Saved: {quiz_path}")

        print("[5/5] Capturing RAGAS Evaluation Dashboard (/evaluation)...")
        page.goto("http://localhost:8000/evaluation", wait_until="networkidle")
        time.sleep(2.0)
        eval_path = os.path.join(OUTPUT_DIR, "evaluation_dashboard.png")
        page.screenshot(path=eval_path, full_page=False)
        print(f"  -> Saved: {eval_path}")

        browser.close()
        print("\nAll 5 authentic real browser screenshots captured successfully!")


if __name__ == "__main__":
    capture()
