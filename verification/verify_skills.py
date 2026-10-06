"""
Skills-section accessibility check.

Adapted from the original verification/verify_skills.py.

The original asserted that every skill had a role="progressbar" with an
aria-valuenow/aria-labelledby pair. Those percentage bars were removed because
the 0-100 ratings (including "Adaptability 90%" and "Teamwork 90%") had no
defined basis and were not defensible in a hiring conversation.

This version therefore asserts the replacement is present and accessible:
each skill group is a heading with a list of concrete evidence items, and no
numeric proficiency percentage is rendered at all.

Requires: pip install playwright && playwright install chromium
Run against a dev server:  npm run dev
"""

from playwright.sync_api import sync_playwright
import re
import time


def verify_skills(page):
    print("Navigating to home...")
    page.goto("http://localhost:5173")

    # Handle Boot Sequence
    print("Handling boot sequence...")
    try:
        skip_button = page.get_by_role("button", name=re.compile(r"Skip", re.IGNORECASE))
        if skip_button.is_visible():
            skip_button.click()
            print("Clicked skip button.")
        else:
            print("Skip button not visible, maybe already loaded?")
    except Exception as e:
        print(f"Error handling skip button: {e}")

    # Wait for main content
    page.wait_for_selector("text=Skills", timeout=10000)
    print("Main content loaded.")

    # Scroll to Skills section
    skills_section = page.locator("text=Skills").first
    skills_section.scroll_into_view_if_needed()

    # Wait a bit for animations
    time.sleep(1)

    print("Verifying skill groups render...")
    headings = page.locator("h3")
    count = headings.count()
    print(f"Found {count} skill group headings.")
    if count == 0:
        raise Exception("No skill group headings found")

    titles = []
    for i in range(count):
        text = headings.nth(i).text_content().strip()
        titles.append(text)
        print(f"Group {i}: {text}")

    # Each group heading must be followed by real evidence, not a rating bar.
    for i in range(count):
        heading = headings.nth(i)
        card = heading.locator("xpath=ancestor::div[contains(@class,'sc-')][1]")
        items = card.locator("li")
        item_count = items.count()
        print(f"Group {i} ({titles[i]}): {item_count} evidence items")
        if item_count == 0:
            raise Exception(f"Skill group '{titles[i]}' has no concrete evidence items")

    print("Verifying numeric proficiency ratings are gone...")
    progress_bars = page.get_by_role("progressbar")
    bar_count = progress_bars.count()
    if bar_count != 0:
        raise Exception(
            f"Found {bar_count} percentage proficiency bars. These were removed "
            "because the ratings had no defined basis."
        )
    print("No percentage proficiency bars rendered, as expected.")

    page_text = page.locator("body").inner_text()
    percentage = re.search(r"\b\d{1,3}\s*%", page_text)
    if percentage:
        raise Exception(f"Unexpected numeric rating still visible: {percentage.group(0)!r}")

    print("All checks passed.")
    page.screenshot(path="verification/skills_a11y.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_skills(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()