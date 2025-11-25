from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to homepage
            page.goto("http://localhost:3000")
            page.wait_for_timeout(3000) # Wait for hydration

            # Screenshot homepage
            page.screenshot(path="verification/verification_home.png")
            print("Screenshot saved to verification/verification_home.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
