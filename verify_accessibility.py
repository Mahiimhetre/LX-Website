from playwright.sync_api import sync_playwright, expect
import time

def verify_buttons(page):
    page.goto("http://localhost:3000/")
    # Wait for the main page to render fully
    page.wait_for_timeout(3000)

    # Note: The sidebar toggle might not be visible if isMobile is true or we are on the landing page depending on routing. Let's just go to the dashboard to test the sidebar if needed.
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(3000)

    # Let's check the chat widget first, it's global
    try:
        chat_widget_toggle = page.locator("button[aria-label='Open chat'], button[aria-label='Close chat']")
        expect(chat_widget_toggle).to_be_visible(timeout=5000)
        print("Chat toggle button has aria-label")
        chat_widget_toggle.click()

        close_chat_btn = page.locator("button[aria-label='Close chat']").first
        expect(close_chat_btn).to_be_visible()
        print("Chat close button has aria-label")

        send_msg_btn = page.locator("button[aria-label='Send message']")
        expect(send_msg_btn).to_be_visible()
        print("Send message button has aria-label")
    except Exception as e:
        print(f"Chat widget error: {e}")

    try:
        sidebar_toggle = page.locator("button[aria-label='Collapse sidebar'], button[aria-label='Expand sidebar']")
        expect(sidebar_toggle).to_be_visible(timeout=5000)
        print("Sidebar toggle button has aria-label")
    except Exception as e:
        print(f"Sidebar toggle error (might need login or viewport config): {e}")

    page.screenshot(path="verification.png")
    print("Screenshot saved to verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set a wide viewport to ensure desktop layout
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            verify_buttons(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
