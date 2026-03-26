# Order Flow Implementation Requirements

This document describes the requirements for implementing a complete, production-grade order and checkout flow. It is intended as a specification for a development team or contractor. No code is provided — only what needs to be built, why, and what to watch out for.

---

## 0. Technical Handoff — Accounts, Keys, and Access

### 0.1 Service Accounts

All services below use the same email for the account login:

| Service | URL | Account Email |
|---|---|---|
| Supabase | https://supabase.com/dashboard | worldtradecommercefze@gmail.com |
| Resend (transactional email) | https://resend.com/login | worldtradecommercefze@gmail.com |
| Netlify (hosting and deployment) | https://app.netlify.com | worldtradecommercefze@gmail.com |

Password resets can be initiated from each service's login page using the email above.

### 0.2 Environment Variables

The following environment variables must be configured in the Netlify deployment settings (Site settings > Environment variables). These are required for the application to function correctly in production.

| Variable | Purpose | How to Obtain |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, never expose to client) | Supabase dashboard > Project Settings > API |
| `OPENAI_API_KEY` | Powers the AI chatbot on the storefront | You must create your own OpenAI account at https://platform.openai.com, add a payment method, and generate an API key. This is a pay-as-you-go service billed by OpenAI based on usage. The previous key has been revoked. |
| `RESEND_API_KEY` | Transactional email sending (order confirmations, shipping notifications) | Resend dashboard > API Keys. Log in with the account email above. |
| `CAMBERCO_IMAGES_API_KEY` | AI-powered image transformation in the admin panel | This key is obtained by subscribing to the Camber Images service at https://images.camberco.co.uk. A paid subscription is required. Once subscribed, the API key will be available in your Camber Images account dashboard. |

### 0.3 OpenAI API Key — Important Notes

The chatbot feature requires an OpenAI API key. This is NOT included with the project — you must:

1. Create an OpenAI Platform account at https://platform.openai.com
2. Add a payment method (credit card)
3. Generate a new API key
4. Add it as `OPENAI_API_KEY` in the Netlify environment variables
5. The chatbot uses the `gpt-4o-mini` model by default (configurable via the admin chatbot settings page). Usage costs are billed directly to your OpenAI account. At time of writing, gpt-4o-mini costs roughly $0.15 per million input tokens and $0.60 per million output tokens — very low for a customer support chatbot.

If the `OPENAI_API_KEY` variable is not set, the chatbot will return a "Chat is currently unavailable" message. The rest of the store will continue to function normally.

### 0.4 Camber Images API Key — Important Notes

The admin panel includes an AI image transformation feature for product images. This is powered by the Camber Images API service.

1. Go to https://images.camberco.co.uk
2. Subscribe to a plan
3. Copy the API key from your account dashboard
4. Add it as `CAMBERCO_IMAGES_API_KEY` in the Netlify environment variables

If the key is not set, the image transformation feature in the admin panel will show a "not configured" error. Product images can still be uploaded manually without this feature.

### 0.5 Supabase Project Details

The Supabase project contains the PostgreSQL database, authentication system, and row-level security policies. Key things to know:

- The database schema is defined in migration files under `src/supabase/migrations/`
- Authentication is handled by Supabase Auth (email/password with email confirmation)
- Admin users are identified by a `role` column in the `profiles` table set to `'admin'`
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security and should only be used in server-side code, never exposed to the browser

### 0.6 Netlify Deployment

The site is deployed on Netlify as a Next.js application. Key configuration:

- Build command: `npm run build`
- Publish directory: `.next`
- All environment variables listed above must be set in Netlify's environment variable settings
- After changing environment variables, a redeploy is required for changes to take effect

### 0.7 Resend (Email Service)

Resend is used for transactional emails. The project currently has email templates for order confirmations and shipping notifications, but these were removed alongside the order flow. When reimplementing:

- Log in to Resend with the account email above
- Verify the sending domain in Resend's dashboard (DNS records will need to be added)
- The API key should have sending permissions for the verified domain
- Test mode can be enabled with `EMAIL_TEST_MODE=true` and `EMAIL_TEST_RECIPIENT=your@email.com` to route all emails to a test address during development

### 0.8 Payment Gateway — Ziina

The payment gateway is Ziina (https://ziina.com), a UAE-based payment processor. The integration was removed alongside the order flow and will need to be reimplemented. Key details:

- Ziina dashboard: https://dashboard.ziina.com
- The Ziina account is under the same business credentials
- The Ziina API credentials are already configured in the Netlify environment variables:

| Variable | Purpose | Status |
|---|---|---|
| `ZIINA_ACCESS_TOKEN` | Authenticates API calls to create and verify payment intents | Already set |
| `ZIINA_TEST_MODE` | Set to `true` for test/sandbox payments, `false` for live | Already set (currently `true`) |
| `ZIINA_WEBHOOK_SECRET` | HMAC secret for verifying webhook authenticity | Needs configuring — set up a webhook URL in the Ziina dashboard pointing to your webhook endpoint, then add the secret here |

- Ziina uses a redirect-based payment flow: create a payment intent via their API, redirect the customer to the Ziina-hosted payment page, then the customer is redirected back to your success/cancel/failure URL
- Ziina also supports webhooks for push-based payment status updates — these are the authoritative source of payment outcome and should be used alongside the redirect-based verification
- Test mode allows you to simulate payments without real charges

---

## 1. Checkout Flow

### 1.1 Checkout Page

A checkout page that collects the information needed to fulfil an order. This should be accessible from the cart page.

**Required information:**
- Contact details: full name, email address, phone number
- Shipping address: street address, city, emirate (dropdown of UAE emirates), postal code
- Guest checkout must be supported (no account required to place an order)
- Logged-in users should have their details pre-filled from their profile

### 1.2 Authentication During Checkout

Users should be able to register or log in during checkout without losing their cart contents or entered form data. The authentication form must not interfere with or accidentally submit the checkout form. Authentication actions (login, register) must be completely isolated from the order submission action.

### 1.3 Shipping Cost Calculation

Shipping cost should be calculated before the user submits their order so there are no surprises. Consider:
- Flat-rate vs weight-based vs emirate-based shipping tiers
- Free shipping thresholds (e.g., free over a certain AED amount)
- The shipping cost must be shown in the order summary before payment

### 1.4 Order Summary

Before submitting, the user must see a clear summary showing:
- All items with quantities and per-item prices
- Subtotal
- Shipping cost
- Total amount to be charged
- Currency (AED)

---

## 2. Payment Processing

### 2.1 Payment Gateway Integration

A payment gateway is required to accept online payments. The integration must handle:

- **Payment intent creation**: When the user confirms their order, a payment session/intent must be created with the gateway before redirecting the user
- **Redirect flow**: The user is redirected to the gateway's hosted payment page, then back to the store on completion
- **Return URL handling**: Separate pages/handlers for success, failure, and cancellation outcomes
- **Payment verification**: On return from the gateway, the payment status must be verified server-side by querying the gateway's API — never trust client-side query parameters alone

### 2.2 Payment Security Considerations

- Never store raw card numbers, CVVs, or sensitive payment data
- Payment intent IDs and transaction references should be stored, not card details
- All payment verification must happen server-side
- Webhook endpoints (if used) must validate the source of the request (e.g., IP allowlist, HMAC signature verification, or both)
- Payment amounts must be calculated server-side from the cart items and current prices — never accept a total from the client
- Implement idempotency: the same order should not be charged twice if the user refreshes or the webhook fires multiple times

### 2.3 Gateway Webhook Handling

If the gateway supports webhooks (push notifications for payment status changes):
- The webhook endpoint must verify the authenticity of incoming requests
- It must be idempotent: processing the same event twice should not create duplicate side effects
- It should handle all relevant status transitions (success, failure, expiry)
- Webhook processing should be treated as the authoritative source of payment status, with the redirect-based verification as a fallback

---

## 3. Order Management

### 3.1 Order Creation

When a checkout is submitted:
1. Validate that all items are still in stock at the requested quantities
2. Calculate the order total server-side from current product prices (do not trust client-provided prices)
3. Create the order record in the database atomically (order + line items in a single transaction)
4. Decrement stock for each item atomically as part of the same transaction
5. Generate a unique, human-readable order number
6. Set the order status to an initial state (e.g., "pending")
7. Set an expiry time (e.g., 30 minutes) — if payment is not completed before expiry, the order should be automatically cancelled and stock restored

### 3.2 Order Statuses

A clear set of order statuses is needed. At minimum:
- **Pending** — order created, awaiting payment
- **Payment processing** — redirected to gateway, awaiting outcome
- **Paid** — payment confirmed
- **Confirmed** — order accepted by the business for fulfilment
- **Preparing** — order being prepared/packed
- **Shipped** — handed to courier, tracking info available
- **Delivered** — confirmed delivery
- **Cancelled** — order cancelled (by customer or system timeout)
- **Refunded** — payment returned to customer

Status transitions should be enforced: e.g., an order in "delivered" status should not be transitioned back to "preparing". Define a state machine with valid transitions.

### 3.3 Stock Management During Order Lifecycle

Stock handling is critical and error-prone. The rules:
- Stock is decremented when an order is created (to prevent overselling while the user is paying)
- If payment fails or the order expires, stock must be restored
- If an order is cancelled or refunded, stock must be restored
- Stock adjustments must be atomic (use database-level transactions or stored procedures to prevent race conditions)
- Keep a stock movement log for auditability: every stock change should record the reason (sale, return, restock, adjustment, damage) and a reference to the order if applicable

### 3.4 Order Expiry and Reconciliation

Orders that are stuck in a "pending" or "payment processing" state need to be cleaned up:
- Implement a reconciliation process that runs periodically (cron job or manual admin action)
- Orders past their expiry time should be checked against the payment gateway for a final status
- If the gateway confirms payment, transition the order to "paid"
- If the gateway confirms failure or the intent has expired, cancel the order and restore stock
- Log all reconciliation actions for audit purposes

---

## 4. Customer-Facing Order Features

### 4.1 Order Confirmation Page

After successful payment, the user should see:
- Their order number
- A summary of what they ordered
- Expected next steps (e.g., "You will receive an email confirmation")
- The cart should be cleared

### 4.2 Order History (Account)

Logged-in customers should be able to:
- View a list of their past orders with status, date, and total
- View the detail of any order including items, quantities, prices, shipping address, and current status
- See tracking information when available

### 4.3 Payment Failure and Cancellation Pages

- **Payment failed page**: Show an error message, offer a link to contact support or retry
- **Payment cancelled page**: Acknowledge the cancellation, offer to return to the cart to try again

---

## 5. Admin Order Management

### 5.1 Orders List

The admin panel needs an orders page showing:
- All orders with filtering by status
- Order number, customer name, email, total, status, date
- Ability to export orders as CSV

### 5.2 Order Detail (Admin)

For each order, the admin should see:
- Full order details: items, prices, contact info, shipping address
- Current status with the ability to advance it through the workflow
- Payment reference information
- Tracking number and URL (editable)
- Notes field for internal use
- Ability to cancel the order (which restores stock)

### 5.3 Invoice and Shipping Label Generation

- A printable invoice page for each order
- A printable shipping label page for each order (can be a simple formatted label with address details)

### 5.4 Shipping Notifications

Admin should be able to mark an order as shipped and provide a tracking number/URL. This should trigger an email notification to the customer with their tracking information.

### 5.5 Admin Dashboard Stats

The admin dashboard should show:
- Revenue totals (today, this week, this month) based on paid/confirmed orders
- Order counts for the same periods
- Recent orders table
- These stats should exclude cancelled orders

---

## 6. Email Notifications

### 6.1 Order Confirmation Email

Sent when payment is confirmed. Must include:
- Order number
- Items ordered with quantities and prices
- Subtotal, shipping cost, and total
- Shipping address
- Business branding

### 6.2 Shipping Notification Email

Sent when the admin marks an order as shipped. Must include:
- Order number
- Items being shipped
- Tracking number and a clickable tracking URL
- Business branding

### 6.3 Email Reliability

- Email sending should never block or fail the order process — if the email fails to send, log the error but do not roll back the order
- Use a transactional email service (e.g., Resend, SendGrid, Postmark) — never send from the application server directly
- Include a plain text fallback for all HTML emails

---

## 7. Chatbot Integration

If the store has a customer-facing chatbot, it should be able to:
- Look up a logged-in user's order history and status when asked
- Provide tracking information if available
- Tell users that ordering is not available if the feature is not yet implemented

This requires the chatbot to have a server-side tool/function that can query orders for the authenticated user.

---

## 8. Security Requirements

### 8.1 Price and Total Integrity

- The order total must always be calculated server-side from the current product prices in the database
- Never accept a price or total from the client — the cart is a UI convenience, the server is the source of truth
- If a product price has changed between when the user added it to their cart and when they check out, the server-side calculation will use the current price

### 8.2 Stock Race Conditions

- Stock decrements must be atomic at the database level
- Use row-level locking or stored procedures to prevent two concurrent orders from both succeeding when only one item is left
- Consider using a "SELECT FOR UPDATE" pattern or equivalent

### 8.3 Authentication and Authorization

- Order detail endpoints must verify that the requesting user owns the order (for customer endpoints) or is an admin (for admin endpoints)
- Admin-only actions (status changes, cancellations, CSV export, shipping notifications) must be gated behind admin role verification
- Webhook endpoints must verify the source of the request

### 8.4 Input Validation

- All user input (contact details, addresses) must be validated and sanitised server-side
- Email addresses must be validated format
- Phone numbers should be validated
- Prevent excessively long strings that could be used for injection or storage abuse
- Validate that the emirate value is from a known list

### 8.5 Rate Limiting

- The checkout/order creation endpoint should be rate limited to prevent abuse
- The payment verification endpoint should be rate limited
- Webhook endpoints should validate source but also consider rate limiting as defence in depth

---

## 9. Error Handling and Edge Cases

### 9.1 Out of Stock During Checkout

If an item goes out of stock between the user loading the checkout page and submitting:
- The server must check stock before creating the order
- Return a clear error identifying which item(s) are no longer available
- The user should be sent back to their cart to adjust

### 9.2 Partial Stock Availability

If a user requests 3 of an item but only 2 remain:
- Reject the order — do not partially fulfil
- Return a clear error with the available quantity

### 9.3 Payment Gateway Downtime

- If the payment gateway is unreachable when creating a payment intent, return a clear error to the user
- Do not create the order in the database if the payment intent cannot be created
- Or if you do create the order first, ensure it is cleaned up if the payment intent creation fails

### 9.4 Double Submission Prevention

- The checkout submit button should be disabled after the first click
- The server endpoint should be idempotent: submitting the same checkout twice should not create two orders
- Consider using a client-generated idempotency key

### 9.5 Browser Back Button After Payment

Users often hit the back button after completing payment. Ensure:
- The success page works correctly even if loaded multiple times
- The cart is cleared on first successful load and stays cleared
- Payment verification is idempotent (verifying the same order twice does not create duplicate side effects)

---

## 10. Data Model Considerations

### 10.1 Orders Table

Should store at minimum:
- Unique order ID (UUID)
- Human-readable order number
- Customer ID (nullable for guest orders)
- Contact information (name, email, phone)
- Shipping address fields (address, city, emirate, postal code)
- Subtotal, shipping cost, total
- Order status
- Payment gateway reference ID
- Payment transaction reference
- Payment method (if available from gateway)
- Timestamps: created, paid, shipped, delivered
- Tracking number and tracking URL
- Internal notes
- Expiry timestamp (for unpaid order cleanup)

### 10.2 Order Items Table

Should store at minimum:
- Order ID (foreign key)
- Product ID and variant ID (foreign keys)
- Product name and variant label (denormalised — so the order record remains correct even if the product is later renamed or deleted)
- SKU
- Quantity
- Unit price at time of purchase
- Line total

### 10.3 Stock Movements Table

Should store:
- Variant ID
- Quantity change (positive for restocks, negative for sales)
- Reason (sale, return, restock, adjustment, damage)
- Reference ID (order ID or other reference)
- Who made the change
- Timestamp
- Notes

---

## 11. Testing Requirements

### 11.1 Unit Tests

- Order creation logic (price calculation, stock validation)
- Status transition validation (valid and invalid transitions)
- Shipping cost calculation
- Order expiry logic

### 11.2 Integration Tests

- Full checkout flow: cart to payment to confirmation
- Payment failure flow: cart to payment to failure page, verify stock is restored
- Order cancellation: verify stock is restored
- Webhook processing: verify idempotency and correct status transitions
- Concurrent stock: verify two simultaneous orders for the last item — only one should succeed

### 11.3 What to Mock

- The payment gateway API (both success and failure responses)
- Email sending (verify it was called with correct data, but do not actually send)
- Do NOT mock the database in integration tests — use a real test database

---

## 12. Monitoring and Observability

- Log all order state transitions with timestamps
- Log all payment gateway interactions (request/response, with sensitive data redacted)
- Log all stock adjustments
- Alert on orders stuck in "payment processing" for longer than the expiry window
- Alert on payment verification failures
- Alert on stock going negative (should never happen, but indicates a race condition bug)

---

## Summary of Endpoints Needed

| Endpoint | Method | Purpose |
|---|---|---|
| Checkout page | GET | Render checkout form |
| Shipping rate calculation | POST | Calculate shipping cost for given items and address |
| Payment creation | POST | Create order, create payment intent, redirect to gateway |
| Payment verification | GET | Verify payment status on return from gateway |
| Payment webhook | POST | Receive push notifications from payment gateway |
| Order reconciliation | POST | Admin: check and clean up stuck orders |
| Order cancellation | POST | Admin: cancel order and restore stock |
| Shipping notification | POST | Admin: mark as shipped and notify customer |
| Orders export | GET | Admin: download orders as CSV |
| Customer order list | GET | Customer: view own order history |
| Customer order detail | GET | Customer: view single order detail |
| Admin order list | GET | Admin: view all orders with filtering |
| Admin order detail | GET | Admin: view full order detail with controls |
| Invoice page | GET | Admin: printable invoice |
| Shipping label page | GET | Admin: printable shipping label |
