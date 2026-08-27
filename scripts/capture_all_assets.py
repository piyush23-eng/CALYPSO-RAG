from playwright.sync_api import sync_playwright
import time
import os

OUTPUT_DIR = os.path.abspath("docs/assets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 960}, device_scale_factor=2)
    page = context.new_page()

    # 1. Hero Query
    page.goto("http://localhost:8000/", wait_until="networkidle")
    time.sleep(1.0)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "hero_query_view.png"))

    # 2. Answer Derivation
    preset_btn = page.locator("button:has-text('OS: 2-Level Paging')").first
    preset_btn.click()
    page.wait_for_selector(".answer-markdown", timeout=35000)
    time.sleep(2.0)
    page.evaluate("window.scrollTo(0, 480)")
    time.sleep(1.0)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "answer_trace_view.png"))

    # 3. Visual Simulation Lab
    sim_btn = page.locator("button:has-text('Simulation Lab')").first
    if sim_btn.count() > 0:
        sim_btn.click()
        time.sleep(1.0)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "visual_simulation_lab_view.png"))

    # 4. Evaluation Dashboard
    page.goto("http://localhost:8000/evaluation", wait_until="networkidle")
    time.sleep(1.0)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "evaluation_dashboard.png"))

    # 5. Student Mastery Radar
    page.goto("http://localhost:8000/mastery", wait_until="networkidle")
    time.sleep(1.0)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "student_mastery_radar_view.png"))

    # 6. Quiz Mock Exam & Diagnostics
    page.goto("http://localhost:8000/quiz", wait_until="networkidle")
    time.sleep(1.0)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "quiz_mock_exam_diagnostic_view.png"))

    browser.close()
    print("All 6 high-res live UI screenshots captured!")
